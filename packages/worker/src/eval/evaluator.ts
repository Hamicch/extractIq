import * as fs from 'fs/promises';
import * as path from 'path';
import { DocumentExtractor } from '../agents/document-extractor';
import {
  GoldenSample,
  DocumentEvaluationResult,
  EvaluationReport,
  EvaluationConfig,
} from './types';
import {
  calculateDocumentMetrics,
  calculatePercentiles,
  analyzeConfidenceBuckets,
  getTopFields,
} from './metrics';

/**
 * Main evaluation runner for document extraction
 */
export class Evaluator {
  private extractor: DocumentExtractor;
  private config: EvaluationConfig;

  constructor(config: EvaluationConfig) {
    this.config = config;
    this.extractor = new DocumentExtractor();
  }

  /**
   * Run full evaluation suite
   */
  async runEvaluation(): Promise<EvaluationReport> {
    console.log('Loading golden dataset...');
    const samples = await this.loadGoldenDataset();

    console.log(`Evaluating ${samples.length} samples...`);
    const results: DocumentEvaluationResult[] = [];

    // Process samples (with optional parallelism)
    const parallelism = this.config.parallelism || 1;

    for (let i = 0; i < samples.length; i += parallelism) {
      const batch = samples.slice(i, i + parallelism);

      const batchResults = await Promise.all(
        batch.map(sample => this.evaluateSample(sample))
      );

      results.push(...batchResults.filter(r => r !== null) as DocumentEvaluationResult[]);

      console.log(`Progress: ${results.length}/${samples.length}`);
    }

    console.log('Calculating aggregate metrics...');
    const report = this.generateReport(results);

    console.log('Saving results...');
    await this.saveReport(report);

    console.log('\n=== EVALUATION COMPLETE ===\n');
    this.printSummary(report);

    return report;
  }

  /**
   * Evaluate a single sample
   */
  private async evaluateSample(sample: GoldenSample): Promise<DocumentEvaluationResult | null> {
    try {
      console.log(`Evaluating: ${sample.name}`);

      // Read document file
      const documentBuffer = await fs.readFile(sample.filePath);

      // Extract
      const startTime = Date.now();
      const extractionResult = await this.extractor.extractFromDocument(
        documentBuffer,
        sample.id,
        { maxRetries: 2, confidenceThreshold: 0.7 }
      );
      const latencyMs = Date.now() - startTime;

      // Calculate metrics
      const metricsResult = calculateDocumentMetrics(
        extractionResult.extraction,
        sample.groundTruth,
        latencyMs,
        extractionResult.metadata.totalTokens,
        extractionResult.metadata.estimatedCost
      );

      return {
        sampleId: sample.id,
        predicted: extractionResult.extraction,
        groundTruth: sample.groundTruth,
        metrics: {
          accuracy: metricsResult.accuracy,
          fieldPrecision: metricsResult.fieldPrecision,
          fieldRecall: metricsResult.fieldRecall,
          fieldF1: metricsResult.fieldF1,
          fieldAccuracy: metricsResult.fieldAccuracy,
          confidenceCalibration: metricsResult.confidenceCalibration,
        },
        performance: {
          latencyMs,
          tokensUsed: extractionResult.metadata.totalTokens,
          estimatedCost: extractionResult.metadata.estimatedCost,
        },
        errors: metricsResult.errors,
      };
    } catch (error) {
      console.error(`Failed to evaluate sample ${sample.id}:`, error);
      return null;
    }
  }

  /**
   * Generate aggregate report from individual results
   */
  private generateReport(results: DocumentEvaluationResult[]): EvaluationReport {
    const successful = results.length;
    const failed = 0; // TODO: Track failures

    // Calculate aggregate metrics
    const accuracies = results.map(r => r.metrics.accuracy);
    const precisions = results.map(r => r.metrics.fieldPrecision);
    const recalls = results.map(r => r.metrics.fieldRecall);
    const f1s = results.map(r => r.metrics.fieldF1);

    const overallAccuracy = accuracies.reduce((sum, a) => sum + a, 0) / accuracies.length || 0;
    const avgFieldPrecision = precisions.reduce((sum, p) => sum + p, 0) / precisions.length || 0;
    const avgFieldRecall = recalls.reduce((sum, r) => sum + r, 0) / recalls.length || 0;
    const avgFieldF1 = f1s.reduce((sum, f) => sum + f, 0) / f1s.length || 0;

    // Performance metrics
    const latencies = results.map(r => r.performance.latencyMs);
    const costs = results.map(r => r.performance.estimatedCost);
    const tokens = results.map(r => r.performance.tokensUsed);

    const totalCost = costs.reduce((sum, c) => sum + c, 0);
    const totalTokens = tokens.reduce((sum, t) => sum + t, 0);

    // Confidence analysis
    const allFieldResults = results.flatMap(r => {
      const confidences: Array<{ correct: boolean; confidence: number }> = [];
      // Extract all confidence scores and correctness
      const extractConfidences = (obj: any, errors: Array<any>) => {
        if (obj && typeof obj === 'object') {
          if ('value' in obj && 'confidence' in obj) {
            const hasError = errors.some(e => e.confidence === obj.confidence);
            confidences.push({
              correct: !hasError,
              confidence: obj.confidence,
            });
          } else {
            for (const value of Object.values(obj)) {
              extractConfidences(value, errors);
            }
          }
        }
      };
      extractConfidences(r.predicted, r.errors);
      return confidences;
    });

    const avgConfidence = allFieldResults.reduce((sum, r) => sum + r.confidence, 0) / allFieldResults.length || 0;
    const calibrationError = allFieldResults.length > 0
      ? allFieldResults.reduce((sum, r) => {
          return sum + Math.abs(r.confidence - (r.correct ? 1 : 0));
        }, 0) / allFieldResults.length
      : 0;

    // Analyze by document type
    const byDocumentType: Record<string, any> = {};
    for (const result of results) {
      const type = result.groundTruth.type;
      if (!byDocumentType[type]) {
        byDocumentType[type] = {
          count: 0,
          totalAccuracy: 0,
          totalLatency: 0,
          totalCost: 0,
        };
      }
      byDocumentType[type].count++;
      byDocumentType[type].totalAccuracy += result.metrics.accuracy;
      byDocumentType[type].totalLatency += result.performance.latencyMs;
      byDocumentType[type].totalCost += result.performance.estimatedCost;
    }

    for (const type in byDocumentType) {
      const data = byDocumentType[type];
      byDocumentType[type] = {
        count: data.count,
        accuracy: data.totalAccuracy / data.count,
        avgLatency: data.totalLatency / data.count,
        avgCost: data.totalCost / data.count,
      };
    }

    // Field analysis
    const allFieldAccuracies: Record<string, number[]> = {};
    for (const result of results) {
      for (const [field, accuracy] of Object.entries(result.metrics.fieldAccuracy)) {
        if (!allFieldAccuracies[field]) {
          allFieldAccuracies[field] = [];
        }
        allFieldAccuracies[field].push(accuracy);
      }
    }

    const avgFieldAccuracies: Record<string, number> = {};
    for (const [field, accuracies] of Object.entries(allFieldAccuracies)) {
      avgFieldAccuracies[field] = accuracies.reduce((sum, a) => sum + a, 0) / accuracies.length;
    }

    return {
      summary: {
        totalSamples: successful + failed,
        successfulExtractions: successful,
        failedExtractions: failed,
        overallAccuracy,
        avgFieldPrecision,
        avgFieldRecall,
        avgFieldF1,
      },
      performance: {
        latency: calculatePercentiles(latencies),
        cost: {
          totalCost,
          avgCostPerDocument: totalCost / results.length,
          totalTokens,
          avgTokensPerDocument: totalTokens / results.length,
        },
      },
      confidenceAnalysis: {
        avgConfidence,
        calibrationError,
        confidenceBuckets: analyzeConfidenceBuckets(allFieldResults),
      },
      byDocumentType,
      byDifficulty: {}, // TODO: Add difficulty analysis
      fieldAnalysis: {
        mostAccurate: getTopFields(avgFieldAccuracies, 5, false),
        leastAccurate: getTopFields(avgFieldAccuracies, 5, true),
        confusionMatrix: {}, // TODO: Add confusion matrix
      },
      samples: results,
      timestamp: new Date(),
      metadata: {
        modelVersion: 'gpt-4',
        evaluationVersion: '1.0.0',
        configHash: JSON.stringify(this.config),
      },
    };
  }

  /**
   * Load golden dataset from JSON file
   */
  private async loadGoldenDataset(): Promise<GoldenSample[]> {
    const datasetPath = path.join(process.cwd(), this.config.datasetPath);
    const content = await fs.readFile(datasetPath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Save evaluation report
   */
  private async saveReport(report: EvaluationReport): Promise<void> {
    const outputDir = path.join(process.cwd(), this.config.outputPath);

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Save JSON report
    const jsonPath = path.join(outputDir, `eval-${Date.now()}.json`);
    await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));

    // Save CSV with per-document results
    const csvPath = path.join(outputDir, `eval-${Date.now()}.csv`);
    await this.saveCsvReport(report, csvPath);

    // Save latest symlink
    const latestPath = path.join(outputDir, 'latest.json');
    await fs.writeFile(latestPath, JSON.stringify(report, null, 2));

    console.log(`\nReports saved to:`);
    console.log(`  JSON: ${jsonPath}`);
    console.log(`  CSV: ${csvPath}`);
    console.log(`  Latest: ${latestPath}`);
  }

  /**
   * Save CSV report
   */
  private async saveCsvReport(report: EvaluationReport, csvPath: string): Promise<void> {
    const headers = [
      'sample_id',
      'document_type',
      'accuracy',
      'precision',
      'recall',
      'f1',
      'latency_ms',
      'tokens_used',
      'cost_usd',
      'error_count',
    ];

    const rows = report.samples.map(s => [
      s.sampleId,
      s.groundTruth.type,
      s.metrics.accuracy.toFixed(4),
      s.metrics.fieldPrecision.toFixed(4),
      s.metrics.fieldRecall.toFixed(4),
      s.metrics.fieldF1.toFixed(4),
      s.performance.latencyMs.toString(),
      s.performance.tokensUsed.toString(),
      s.performance.estimatedCost.toFixed(4),
      s.errors.length.toString(),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    await fs.writeFile(csvPath, csv);
  }

  /**
   * Print summary to console
   */
  private printSummary(report: EvaluationReport): void {
    console.log('SUMMARY');
    console.log('-------');
    console.log(`Total Samples: ${report.summary.totalSamples}`);
    console.log(`Successful: ${report.summary.successfulExtractions}`);
    console.log(`Failed: ${report.summary.failedExtractions}`);
    console.log(`Overall Accuracy: ${(report.summary.overallAccuracy * 100).toFixed(2)}%`);
    console.log(`Avg Precision: ${(report.summary.avgFieldPrecision * 100).toFixed(2)}%`);
    console.log(`Avg Recall: ${(report.summary.avgFieldRecall * 100).toFixed(2)}%`);
    console.log(`Avg F1: ${(report.summary.avgFieldF1 * 100).toFixed(2)}%`);

    console.log('\nPERFORMANCE');
    console.log('-----------');
    console.log(`P50 Latency: ${report.performance.latency.p50.toFixed(0)}ms`);
    console.log(`P95 Latency: ${report.performance.latency.p95.toFixed(0)}ms`);
    console.log(`P99 Latency: ${report.performance.latency.p99.toFixed(0)}ms`);
    console.log(`Total Cost: $${report.performance.cost.totalCost.toFixed(2)}`);
    console.log(`Avg Cost/Doc: $${report.performance.cost.avgCostPerDocument.toFixed(4)}`);

    console.log('\nTARGET METRICS');
    console.log('--------------');
    const accuracyTarget = this.config.targetMetrics.minAccuracy;
    const latencyTarget = this.config.targetMetrics.maxP95Latency;
    const costTarget = this.config.targetMetrics.maxCostPerDocument;

    const accuracyPass = report.summary.overallAccuracy >= accuracyTarget;
    const latencyPass = report.performance.latency.p95 <= latencyTarget;
    const costPass = report.performance.cost.avgCostPerDocument <= costTarget;

    console.log(
      `Accuracy >=${(accuracyTarget * 100).toFixed(0)}%: ${accuracyPass ? '✓ PASS' : '✗ FAIL'} ` +
      `(${(report.summary.overallAccuracy * 100).toFixed(2)}%)`
    );
    console.log(
      `P95 Latency <=${latencyTarget}ms: ${latencyPass ? '✓ PASS' : '✗ FAIL'} ` +
      `(${report.performance.latency.p95.toFixed(0)}ms)`
    );
    console.log(
      `Cost <=$${costTarget}: ${costPass ? '✓ PASS' : '✗ FAIL'} ` +
      `($${report.performance.cost.avgCostPerDocument.toFixed(4)})`
    );

    if (!accuracyPass || !latencyPass || !costPass) {
      console.log('\n⚠️  Some targets not met');
      process.exit(1);
    } else {
      console.log('\n✓ All targets met!');
    }
  }
}
