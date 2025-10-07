'use client';

import { useState, useMemo } from 'react';
import { useDocuments } from '@/hooks/api';
import { useAppStore } from '@/lib/store';
import { Card, Button, Input } from '@docuflow/ui';
import { Search, SlidersHorizontal, Trash2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { useWebSocket } from '@/hooks/useWebSocket';

type SortField = 'uploadedAt' | 'size' | 'name';
type SortOrder = 'asc' | 'desc';
type StatusFilter = 'all' | 'uploading' | 'queued' | 'processing' | 'completed' | 'failed';

export default function DocumentsPage() {
  const _selectedTenant = useAppStore((state) => state.selectedTenant);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortField, setSortField] = useState<SortField>('uploadedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const queryParams = {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    sortBy: sortField,
    sortOrder: sortOrder,
  };

  const { data: documentsResponse, isLoading, refetch } = useDocuments(queryParams);
  const documents = documentsResponse?.data || [];
  const pagination = documentsResponse?.pagination;

  // WebSocket for real-time updates
  useWebSocket({
    onDocumentUpdate: (_data) => {
      // Refetch documents when there's an update
      refetch();
    },
  });

  // Filter and search documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = searchQuery === '' ||
        doc.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [documents, searchQuery, statusFilter]);

  const handleSelectDocument = (id: string) => {
    const newSelection = new Set(selectedDocuments);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedDocuments(newSelection);
  };

  const handleBulkDelete = async () => {
    if (selectedDocuments.size === 0) return;

    // TODO: Implement bulk delete API call
    console.log('Deleting documents:', Array.from(selectedDocuments));
    setSelectedDocuments(new Set());
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Since we're using cursor-based pagination, we'll simplify this
  // In a real implementation, you'd use the cursor from pagination

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4" />
          <div className="grid grid-cols-1 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Documents
        </h1>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">
          Manage and track your document processing
        </p>
      </div>

      {/* Filters and Search */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {(['all', 'uploading', 'queued', 'processing', 'completed', 'failed'] as StatusFilter[]).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSort('uploadedAt')}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Date {sortField === 'uploadedAt' && (sortOrder === 'asc' ? '↑' : '↓')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSort('size')}
            >
              Size {sortField === 'size' && (sortOrder === 'asc' ? '↑' : '↓')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSort('name')}
            >
              Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </Button>
          </div>

          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedDocuments.size > 0 && (
        <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {selectedDocuments.size} document{selectedDocuments.size > 1 ? 's' : ''} selected
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDocuments(new Set())}
              >
                Clear selection
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Document List */}
      {filteredDocuments.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-neutral-500 dark:text-neutral-400">
            {searchQuery || statusFilter !== 'all'
              ? 'No documents match your filters'
              : 'No documents yet'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <Link href="/upload">
              <Button className="mt-4">Upload Your First Document</Button>
            </Link>
          )}
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 mb-6">
            {filteredDocuments.map((document) => (
              <div key={document.id} className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedDocuments.has(document.id)}
                  onChange={() => handleSelectDocument(document.id)}
                  className="mt-6 h-4 w-4 rounded border-neutral-300 dark:border-neutral-700"
                />
                <div className="flex-1">
                  <DocumentCard document={document} showConfidence={true} />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && (pagination.hasNext || pagination.hasPrev) && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Showing {documents.length} documents
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.hasPrev}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
