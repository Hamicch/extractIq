#!/usr/bin/env node

import { Evaluator } from './evaluator';
import { EvaluationConfig } from './types';

/**
 * Run evaluation from command line
 */
async function main() {
  const config: EvaluationConfig = {
    datasetPath: './src/eval/golden-dataset.json',
    outputPath: './eval-results',
    parallelism: 1, // Sequential for consistency
    targetMetrics: {
      minAccuracy: 0.9, // 90% field accuracy
      maxP95Latency: 30000, // 30 seconds
      maxCostPerDocument: 0.5, // $0.50 per document
    },
  };

  const evaluator = new Evaluator(config);

  try {
    await evaluator.runEvaluation();
  } catch (error) {
    console.error('Evaluation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main };
