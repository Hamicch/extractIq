import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getDocuflowClient, type ExtractionConfig } from '@extractiq/shared';

interface UploadDocumentOptions {
  extractionConfig?: ExtractionConfig;
  metadata?: Record<string, unknown>;
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  const client = getDocuflowClient();

  return useMutation({
    mutationFn: async ({
      file,
      options,
    }: {
      file: File;
      options?: UploadDocumentOptions;
    }) => {
      return client.uploadDocument(file, options);
    },
    onSuccess: () => {
      // Invalidate documents list to refetch with new document
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}
