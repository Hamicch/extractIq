import Link from 'next/link';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@extractiq/ui';
import {
  FileText,
  Sparkles,
  Zap,
  Shield,
  Brain,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 sm:py-24 lg:py-32">
        <div className="text-center mb-16 lg:mb-24">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-success bg-clip-text text-transparent">
            Extract IQ
          </h1>
          <p className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground mb-4">
            Flow from upload to insight
          </p>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            AI-native document intelligence platform that transforms your documents into actionable insights with intelligent extraction, categorization, and analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/learn-more">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Key Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto mb-16 lg:mb-24">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <FileText className="w-12 h-12 text-primary mb-4" />
              <CardTitle>Upload Documents</CardTitle>
              <CardDescription>
                Seamlessly upload and manage your documents in one place
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Support for PDF, DOCX, TXT, and more. Secure cloud storage with
                S3 integration. Drag-and-drop interface for easy file management.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <Sparkles className="w-12 h-12 text-accent mb-4" />
              <CardTitle>AI Processing</CardTitle>
              <CardDescription>
                Powerful AI extracts insights from your documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Automated text extraction, entity recognition, and intelligent
                categorization. Advanced NLP models understand context and extract
                meaningful data.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <Zap className="w-12 h-12 text-success mb-4" />
              <CardTitle>Instant Insights</CardTitle>
              <CardDescription>
                Get actionable insights from your documents in seconds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Real-time processing with background job queues. Export and
                share insights easily. Comprehensive analytics dashboard.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Why Choose Extract IQ?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built for modern teams who need intelligent document processing
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Native</h3>
              <p className="text-sm text-muted-foreground">
                State-of-the-art AI models power every extraction and analysis
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
                <Shield className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-sm text-muted-foreground">
                Enterprise-grade security with end-to-end encryption
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-4">
                <BarChart3 className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Analytics Ready</h3>
              <p className="text-sm text-muted-foreground">
                Built-in analytics and reporting for data-driven decisions
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">
                Process thousands of documents in minutes, not hours
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple, powerful, and intelligent document processing
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Upload Your Documents</h3>
                <p className="text-muted-foreground">
                  Simply upload your documents through our intuitive interface. We support
                  multiple formats including PDF, DOCX, TXT, and more. Your files are
                  securely stored in the cloud.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">AI Processing & Extraction</h3>
                <p className="text-muted-foreground">
                  Our AI-powered engine analyzes your documents, extracts key information,
                  identifies entities, and automatically categorizes content. All processing
                  happens in the background with real-time status updates.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-success text-success-foreground flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Get Insights & Analytics</h3>
                <p className="text-muted-foreground">
                  Access extracted data, view analytics, and export insights. Our platform
                  provides detailed confidence scores, audit logs, and comprehensive
                  reporting tools to help you make informed decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Ready to Transform Your Documents?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of teams using Extract IQ to unlock insights from their documents
          </p>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
