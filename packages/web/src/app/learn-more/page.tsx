import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@extractiq/ui';
import {
  FileText,
  Sparkles,
  Brain,
  Shield,
  Zap,
  BarChart3,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Layers,
  Search,
  Tag,
  Database,
} from 'lucide-react';

export default function LearnMorePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-primary text-primary-foreground py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <Link
            href="/"
            className="inline-flex items-center text-primary-foreground hover:opacity-90 mb-8 transition-opacity"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            Learn More About Extract IQ
          </h1>
          <p className="text-xl lg:text-2xl opacity-90 max-w-3xl">
            The AI-native document extraction and categorization platform that transforms
            how you work with documents
          </p>
        </div>
      </section>

      {/* What is Extract IQ */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            What is Extract IQ?
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              Extract IQ is an AI-native document intelligence platform designed to help
              businesses and individuals extract, categorize, and analyze information from
              documents at scale. Built with cutting-edge artificial intelligence, our
              platform transforms unstructured document data into structured, actionable
              insights.
            </p>
            <p className="text-lg text-muted-foreground mb-6">
              Whether you're processing invoices, contracts, research papers, or any other
              document type, Extract IQ leverages advanced natural language processing
              (NLP) and machine learning models to understand context, extract key
              information, and automatically organize your documents for easy access and
              analysis.
            </p>
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="bg-muted/50 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Core Capabilities
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need for intelligent document processing
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Document Extraction</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Automatically extract text, entities, dates, numbers, and structured data
                  from PDFs, Word documents, and other file formats. Our AI understands
                  document structure and extracts information with high accuracy.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Tag className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Intelligent Categorization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Automatically categorize documents based on content, type, and context.
                  Our AI learns from your documents to provide increasingly accurate
                  classifications over time.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-success" />
                </div>
                <CardTitle>Smart Search</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Find documents instantly using semantic search that understands meaning,
                  not just keywords. Search across all your documents and extracted data
                  with natural language queries.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Database className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Data Structuring</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Transform unstructured document data into structured formats. Export to
                  JSON, CSV, or integrate directly with your existing systems via our API.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Analytics & Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get comprehensive analytics on your document processing. Track extraction
                  accuracy, processing times, and gain insights into your document
                  workflows.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center mb-4">
                  <Layers className="w-6 h-6 text-success" />
                </div>
                <CardTitle>Multi-Tenant Architecture</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Organize your documents by tenants, projects, or teams. Perfect for
                  agencies, consultancies, and organizations managing multiple clients or
                  projects.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* AI-Powered Features */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-center">
            AI-Powered Intelligence
          </h2>
          <p className="text-lg text-muted-foreground mb-12 text-center max-w-2xl mx-auto">
            Our platform uses state-of-the-art AI models to understand and process your
            documents
          </p>

          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-3">Advanced NLP Models</h3>
                <p className="text-muted-foreground">
                  We leverage cutting-edge natural language processing models to understand
                  context, extract entities, and identify relationships within your
                  documents. Our AI can handle complex documents with multiple languages,
                  tables, and mixed content types.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-accent" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-3">Entity Recognition</h3>
                <p className="text-muted-foreground">
                  Automatically identify and extract entities such as names, dates,
                  locations, organizations, and custom fields. Our models are trained to
                  recognize patterns and extract structured data from unstructured text.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-success" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-3">Confidence Scoring</h3>
                <p className="text-muted-foreground">
                  Every extraction comes with a confidence score, so you know how reliable
                  the extracted data is. Review and correct low-confidence extractions to
                  improve accuracy over time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="bg-muted/50 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Use Cases
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Extract IQ helps businesses across industries
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Legal & Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-success mr-2 mt-0.5 flex-shrink-0" />
                    <span>Contract analysis and extraction</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-success mr-2 mt-0.5 flex-shrink-0" />
                    <span>Regulatory document processing</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-success mr-2 mt-0.5 flex-shrink-0" />
                    <span>Compliance monitoring</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Finance & Accounting</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-success mr-2 mt-0.5 flex-shrink-0" />
                    <span>Invoice processing</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-success mr-2 mt-0.5 flex-shrink-0" />
                    <span>Receipt extraction</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-success mr-2 mt-0.5 flex-shrink-0" />
                    <span>Financial document analysis</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Research & Academia</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-success mr-2 mt-0.5 flex-shrink-0" />
                    <span>Paper extraction and analysis</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-success mr-2 mt-0.5 flex-shrink-0" />
                    <span>Literature review automation</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-success mr-2 mt-0.5 flex-shrink-0" />
                    <span>Data collection from documents</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>HR & Operations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-success mr-2 mt-0.5 flex-shrink-0" />
                    <span>Resume parsing</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-success mr-2 mt-0.5 flex-shrink-0" />
                    <span>Employee document management</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-success mr-2 mt-0.5 flex-shrink-0" />
                    <span>Form processing</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Healthcare</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-success mr-2 mt-0.5 flex-shrink-0" />
                    <span>Medical record extraction</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-success mr-2 mt-0.5 flex-shrink-0" />
                    <span>Insurance document processing</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-success mr-2 mt-0.5 flex-shrink-0" />
                    <span>Patient data management</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Real Estate</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-success mr-2 mt-0.5 flex-shrink-0" />
                    <span>Property document analysis</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-success mr-2 mt-0.5 flex-shrink-0" />
                    <span>Lease agreement processing</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 text-success mr-2 mt-0.5 flex-shrink-0" />
                    <span>Contract management</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security & Privacy */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-6 items-start mb-12">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                <Shield className="w-8 h-8 text-accent" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Security & Privacy
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Your documents are protected with enterprise-grade security measures
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-success mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    End-to-end encryption for data in transit and at rest
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-success mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Secure cloud storage with AWS S3 integration
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-success mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Comprehensive audit logs for all document access and processing
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-success mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Role-based access control and multi-tenant isolation
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-success mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    GDPR and SOC 2 compliant infrastructure
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Transform your document workflows with AI-powered extraction and categorization
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/">
              <Button
                size="lg"
                variant="ghost"
                className="w-full sm:w-auto border-primary-foreground/60  hover:bg-primary-foreground/20 hover:border-primary-foreground"
              >
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

