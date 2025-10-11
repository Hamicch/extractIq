# Document Extraction Evaluation Framework

This directory contains the evaluation harness for the AI-powered document extraction system.

## Overview

The evaluation framework measures the accuracy, performance, and cost of document extraction using a golden dataset with human-annotated ground truth.

## Quick Start

```bash
# Run evaluation
npm run eval

# Watch mode (re-run on code changes)
npm run eval:watch
```

## Components

### 1. Golden Dataset (`golden-dataset.json`)

Contains 10 annotated samples across document types:
- **3 Legal Contracts**: Service agreements, NDAs, employment contracts
- **4 Invoices**: Simple and complex invoices with multiple line items
- **3 Generic Documents**: Reports, memos, mixed-content documents

Each sample includes:
- Document metadata (ID, name, type)
- File path to test PDF
- Ground truth extraction (human-annotated)
- Difficulty rating and characteristics

### 2. Schemas (`../schemas/extraction-schemas.ts`)

Zod schemas defining the structure for each document type:
- **Legal Contract**: parties, dates, payment terms, governing law
- **Invoice**: vendor, line items, totals, tax calculations
- **Generic**: title, key points, summary, entities

All fields include confidence scores (0-1 scale).

### 3. Extraction Agent (`../agents/document-extractor.ts`)

AI agent that:
1. **OCR Stage**: Extract text from PDFs using `pdf-parse`
2. **Type Detection**: Classify document type with GPT-4
3. **Schema-Guided Extraction**: Extract structured data with confidence scores
4. **Validation**: Check confidence scores and cross-validate fields (e.g., invoice math)
5. **Self-Correction**: Retry up to 2 times with error feedback

### 4. Metrics (`metrics.ts`)

Calculates:
- **Per-field metrics**: Precision, recall, F1 score
- **Overall accuracy**: Exact match rate
- **Confidence calibration**: How well confidence predicts correctness
- **Latency percentiles**: P50, P90, P95, P99
- **Cost tracking**: Token usage and estimated costs

### 5. Evaluator (`evaluator.ts`)

Orchestrates evaluation:
- Loads golden dataset
- Runs extraction on each sample
- Calculates aggregate metrics
- Generates reports (JSON + CSV)
- Compares against target thresholds

## Metrics

### Target Thresholds

- **Field Accuracy**: ≥90%
- **P95 Latency**: ≤30s
- **Cost per Document**: ≤$0.50

### Reported Metrics

**Summary**:
- Overall accuracy (exact match)
- Average precision/recall/F1
- Success/failure counts

**Performance**:
- Latency percentiles (P50, P90, P95, P99)
- Token usage and costs
- Cost breakdown by document type

**Confidence Analysis**:
- Average confidence scores
- Calibration error (ECE)
- Confidence buckets with accuracy

**Field Analysis**:
- Most/least accurate fields
- Per-field accuracy breakdown
- Confusion matrix for field types

## Output

### JSON Report

```json
{
  "summary": {
    "totalSamples": 10,
    "overallAccuracy": 0.92,
    "avgFieldF1": 0.89
  },
  "performance": {
    "latency": { "p95": 28500 },
    "cost": { "avgCostPerDocument": 0.42 }
  },
  "confidenceAnalysis": { ... },
  "byDocumentType": { ... },
  "fieldAnalysis": { ... },
  "samples": [ ... ]
}
```

### CSV Report

Per-document results:
```csv
sample_id,document_type,accuracy,precision,recall,f1,latency_ms,tokens_used,cost_usd,error_count
invoice-001,invoice,0.95,0.94,0.96,0.95,25400,3200,0.38,2
...
```

## CI Integration

The evaluation runs automatically on PR when changes are made to:
- `packages/worker/src/agents/**`
- `packages/worker/src/schemas/**`
- `packages/worker/src/eval/**`

Results are:
1. Uploaded as artifacts
2. Posted as PR comment
3. Used to fail CI if thresholds aren't met

## Adding New Test Cases

1. Create test PDF in `test-data/<type>/`
2. Manually annotate the document
3. Add entry to `golden-dataset.json`:

```json
{
  "id": "invoice-005",
  "name": "Complex Multi-Currency Invoice",
  "documentType": "invoice",
  "filePath": "./test-data/invoices/multi-currency-005.pdf",
  "groundTruth": {
    "type": "invoice",
    "invoice_number": { "value": "INV-2024-005", "confidence": 0.95 },
    // ... full extraction with confidence scores
  },
  "metadata": {
    "difficulty": "hard",
    "characteristics": ["multi-currency", "complex-calculations", "poor-scan-quality"]
  }
}
```

## Improving Performance

### Increasing Accuracy

1. **Better prompts**: Refine system prompts with more examples
2. **Schema refinement**: Make schemas more specific
3. **Validation rules**: Add domain-specific validation
4. **Confidence tuning**: Adjust thresholds for retry logic

### Reducing Latency

1. **Shorter prompts**: Reduce token count
2. **Parallel processing**: Use GPT-4-turbo or smaller models
3. **Caching**: Cache OCR results and type detection

### Reducing Cost

1. **Use GPT-3.5**: For simple documents
2. **Optimize prompts**: Remove unnecessary examples
3. **Smart retries**: Only retry on high-impact errors

## Debugging

View detailed errors for each sample:
```bash
cat eval-results/latest.json | jq '.samples[] | select(.errors | length > 0)'
```

Check specific field accuracy:
```bash
cat eval-results/latest.json | jq '.fieldAnalysis.leastAccurate'
```

## Future Enhancements

- [ ] Add image-based OCR for scanned documents
- [ ] Multi-model ensemble (GPT-4 + Claude)
- [ ] Active learning: Flag uncertain cases for human review
- [ ] A/B testing framework for prompt changes
- [ ] Real-time monitoring dashboard
- [ ] Automated regression detection
