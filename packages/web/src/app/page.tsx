import { Button } from '@docuflow/ui';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@docuflow/ui';
import { FileText, Sparkles, Zap } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Docuflow
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 mb-8">
            Flow from upload to insight
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">
            AI-native document intelligence platform
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg">Get Started</Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <FileText className="w-12 h-12 text-blue-500 mb-4" />
              <CardTitle>Upload Documents</CardTitle>
              <CardDescription>
                Seamlessly upload and manage your documents in one place
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Support for PDF, DOCX, TXT, and more. Secure cloud storage with
                S3 integration.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Sparkles className="w-12 h-12 text-purple-500 mb-4" />
              <CardTitle>AI Processing</CardTitle>
              <CardDescription>
                Powerful AI extracts insights from your documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automated text extraction, entity recognition, and intelligent
                categorization.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="w-12 h-12 text-green-500 mb-4" />
              <CardTitle>Instant Insights</CardTitle>
              <CardDescription>
                Get actionable insights from your documents in seconds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Real-time processing with background job queues. Export and
                share insights easily.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
