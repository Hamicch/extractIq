import { DocumentExtraction } from '../schemas/extraction-schemas';

/**
 * Calculate metrics for a single document extraction
 */
export function calculateDocumentMetrics(
  predicted: DocumentExtraction,
  groundTruth: DocumentExtraction,
  _latencyMs: number,
  _tokensUsed: number,
  _estimatedCost: number
): { accuracy: number; fieldPrecision: number; fieldRecall: number; fieldF1: number; fieldAccuracy: Record<string, number>; confidenceCalibration: { avgConfidence: number; calibrationError: number }; errors: Array<any> } {
  const errors: Array<{ field: string; expected: any; actual: any; confidence: number }> = [];
  const fieldResults: Array<{ correct: boolean; confidence: number }> = [];

  // Flatten both objects for comparison
  const predictedFlat = flattenObject(predicted);
  const groundTruthFlat = flattenObject(groundTruth);

  // Get all unique field paths
  const allFields = new Set([
    ...Object.keys(predictedFlat),
    ...Object.keys(groundTruthFlat),
  ]);

  const fieldAccuracy: Record<string, number> = {};

  // Compare each field
  for (const field of allFields) {
    const predictedValue = predictedFlat[field];
    const truthValue = groundTruthFlat[field];

    // Extract value and confidence if it's a confidence object
    const predVal = predictedValue?.value !== undefined ? predictedValue.value : predictedValue;
    const truthVal = truthValue?.value !== undefined ? truthValue.value : truthValue;
    const confidence = predictedValue?.confidence || 1.0;

    const isCorrect = deepEqual(predVal, truthVal);

    fieldResults.push({
      correct: isCorrect,
      confidence,
    });

    // Calculate per-field accuracy
    const fieldKey = field.split('.')[0]; // Group by top-level field
    if (!fieldAccuracy[fieldKey]) {
      fieldAccuracy[fieldKey] = 0;
    }
    if (isCorrect) {
      fieldAccuracy[fieldKey]++;
    }

    if (!isCorrect) {
      errors.push({
        field,
        expected: truthVal,
        actual: predVal,
        confidence,
      });
    }
  }

  // Calculate precision, recall, F1
  const truePositives = fieldResults.filter(r => r.correct).length;
  const falsePositives = Object.keys(predictedFlat).length - truePositives;
  const falseNegatives = Object.keys(groundTruthFlat).length - truePositives;

  const precision = truePositives / (truePositives + falsePositives) || 0;
  const recall = truePositives / (truePositives + falseNegatives) || 0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  // Overall accuracy (exact match)
  const accuracy = errors.length === 0 ? 1 : truePositives / allFields.size;

  // Normalize field accuracy
  for (const key in fieldAccuracy) {
    const totalFields = Array.from(allFields).filter(f => f.startsWith(key)).length;
    fieldAccuracy[key] = fieldAccuracy[key] / totalFields;
  }

  // Calculate confidence calibration
  const avgConfidence = fieldResults.reduce((sum, r) => sum + r.confidence, 0) / fieldResults.length;
  const calibrationError = calculateCalibrationError(fieldResults);

  return {
    accuracy,
    fieldPrecision: precision,
    fieldRecall: recall,
    fieldF1: f1,
    fieldAccuracy,
    confidenceCalibration: {
      avgConfidence,
      calibrationError,
    },
    errors,
  };
}

/**
 * Calculate calibration error (Expected Calibration Error - ECE)
 */
function calculateCalibrationError(
  results: Array<{ correct: boolean; confidence: number }>
): number {
  const buckets = 10;
  const bucketSize = 1.0 / buckets;
  let totalError = 0;

  for (let i = 0; i < buckets; i++) {
    const lower = i * bucketSize;
    const upper = (i + 1) * bucketSize;

    const bucketResults = results.filter(r => r.confidence >= lower && r.confidence < upper);

    if (bucketResults.length === 0) continue;

    const avgConfidence = bucketResults.reduce((sum, r) => sum + r.confidence, 0) / bucketResults.length;
    const accuracy = bucketResults.filter(r => r.correct).length / bucketResults.length;

    totalError += Math.abs(avgConfidence - accuracy) * (bucketResults.length / results.length);
  }

  return totalError;
}

/**
 * Calculate percentiles for latency
 */
export function calculatePercentiles(values: number[]): {
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  mean: number;
} {
  if (values.length === 0) {
    return { p50: 0, p90: 0, p95: 0, p99: 0, mean: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;

  return {
    p50: sorted[Math.floor(sorted.length * 0.5)],
    p90: sorted[Math.floor(sorted.length * 0.9)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)],
    mean,
  };
}

/**
 * Flatten nested object for comparison
 */
function flattenObject(obj: any, prefix = ''): Record<string, any> {
  const result: Record<string, any> = {};

  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Check if it's a confidence object
      if ('value' in value && 'confidence' in value) {
        result[newKey] = value;
      } else {
        Object.assign(result, flattenObject(value, newKey));
      }
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'object') {
          Object.assign(result, flattenObject(item, `${newKey}[${index}]`));
        } else {
          result[`${newKey}[${index}]`] = item;
        }
      });
    } else {
      result[newKey] = value;
    }
  }

  return result;
}

/**
 * Deep equality check
 */
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (typeof a !== typeof b) return false;

  if (typeof a === 'number' && typeof b === 'number') {
    return Math.abs(a - b) < 0.01; // Tolerance for floating point
  }

  if (typeof a === 'string') {
    // Normalize whitespace for string comparison
    return a.trim().toLowerCase() === b.trim().toLowerCase();
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    return keysA.every(key => deepEqual(a[key], b[key]));
  }

  return false;
}

/**
 * Analyze confidence calibration across buckets
 */
export function analyzeConfidenceBuckets(
  results: Array<{ correct: boolean; confidence: number }>
): Array<{ range: string; count: number; accuracy: number }> {
  const buckets = [
    { range: '0.0-0.5', lower: 0.0, upper: 0.5 },
    { range: '0.5-0.7', lower: 0.5, upper: 0.7 },
    { range: '0.7-0.8', lower: 0.7, upper: 0.8 },
    { range: '0.8-0.9', lower: 0.8, upper: 0.9 },
    { range: '0.9-1.0', lower: 0.9, upper: 1.0 },
  ];

  return buckets.map(bucket => {
    const bucketResults = results.filter(
      r => r.confidence >= bucket.lower && r.confidence < bucket.upper
    );

    const accuracy = bucketResults.length > 0
      ? bucketResults.filter(r => r.correct).length / bucketResults.length
      : 0;

    return {
      range: bucket.range,
      count: bucketResults.length,
      accuracy,
    };
  });
}

/**
 * Get top N fields by accuracy
 */
export function getTopFields(
  fieldAccuracies: Record<string, number>,
  n: number,
  ascending: boolean = false
): Array<{ field: string; accuracy: number }> {
  const sorted = Object.entries(fieldAccuracies)
    .map(([field, accuracy]) => ({ field, accuracy }))
    .sort((a, b) => (ascending ? a.accuracy - b.accuracy : b.accuracy - a.accuracy));

  return sorted.slice(0, n);
}
