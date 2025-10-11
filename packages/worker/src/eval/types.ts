import { DocumentExtraction } from '../schemas/extraction-schemas';

/**
 * Golden dataset sample with human-annotated ground truth
 */
export interface GoldenSample {
  id: string;
  name: string;
  documentType: 'legal_contract' | 'invoice' | 'generic';
  filePath: string;
  groundTruth: DocumentExtraction;
  metadata: {
    difficulty: 'easy' | 'medium' | 'hard';
    characteristics: string[];
    notes?: string;
  };
}

/**
 * Evaluation result for a single document
 */
export interface DocumentEvaluationResult {
  sampleId: string;
  predicted: DocumentExtraction;
  groundTruth: DocumentExtraction;
  metrics: {
    accuracy: number; // Overall exact match
    fieldPrecision: number;
    fieldRecall: number;
    fieldF1: number;
    fieldAccuracy: Record<string, number>; // Per-field accuracy
    confidenceCalibration: {
      avgConfidence: number;
      calibrationError: number; // How well confidence predicts correctness
    };
  };
  performance: {
    latencyMs: number;
    tokensUsed: number;
    estimatedCost: number;
  };
  errors: Array<{
    field: string;
    expected: any;
    actual: any;
    confidence: number;
  }>;
}

/**
 * Aggregate evaluation metrics across all samples
 */
export interface EvaluationReport {
  summary: {
    totalSamples: number;
    successfulExtractions: number;
    failedExtractions: number;
    overallAccuracy: number;
    avgFieldPrecision: number;
    avgFieldRecall: number;
    avgFieldF1: number;
  };
  performance: {
    latency: {
      p50: number;
      p90: number;
      p95: number;
      p99: number;
      mean: number;
    };
    cost: {
      totalCost: number;
      avgCostPerDocument: number;
      totalTokens: number;
      avgTokensPerDocument: number;
    };
  };
  confidenceAnalysis: {
    avgConfidence: number;
    calibrationError: number;
    confidenceBuckets: Array<{
      range: string;
      count: number;
      accuracy: number;
    }>;
  };
  byDocumentType: Record<
    string,
    {
      count: number;
      accuracy: number;
      avgLatency: number;
      avgCost: number;
    }
  >;
  byDifficulty: Record<
    string,
    {
      count: number;
      accuracy: number;
      avgLatency: number;
    }
  >;
  fieldAnalysis: {
    mostAccurate: Array<{ field: string; accuracy: number }>;
    leastAccurate: Array<{ field: string; accuracy: number }>;
    confusionMatrix: Record<string, Record<string, number>>;
  };
  samples: DocumentEvaluationResult[];
  timestamp: Date;
  metadata: {
    modelVersion: string;
    evaluationVersion: string;
    configHash: string;
  };
}

/**
 * Evaluation configuration
 */
export interface EvaluationConfig {
  datasetPath: string;
  outputPath: string;
  parallelism?: number;
  targetMetrics: {
    minAccuracy: number;
    maxP95Latency: number;
    maxCostPerDocument: number;
  };
}
