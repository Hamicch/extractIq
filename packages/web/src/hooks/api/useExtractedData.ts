import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDocuflowClient, type ExtractedDataUpdate } from '@extractiq/shared';

export function useExtractedData(documentId: string, enabled = true) {
  const client = getDocuflowClient();

  return useQuery({
    queryKey: ['documents', documentId, 'extracted-data'],
    queryFn: () => client.getExtractedData(documentId),
    enabled,
    retry: (failureCount, error) => {
      // Don't retry if document not processed yet (409)
      if (error instanceof Error && 'statusCode' in error) {
        if ((error as any).statusCode === 409) {
          return false;
        }
      }
      return failureCount < 3;
    },
  });
}

export function useUpdateExtractedData() {
  const queryClient = useQueryClient();
  const client = getDocuflowClient();

  return useMutation({
    mutationFn: ({
      documentId,
      update,
    }: {
      documentId: string;
      update: ExtractedDataUpdate;
    }) => client.updateExtractedData(documentId, update),
    onSuccess: (_, { documentId }) => {
      // Invalidate extracted data for this document
      queryClient.invalidateQueries({
        queryKey: ['documents', documentId, 'extracted-data'],
      });
      // Also invalidate document details
      queryClient.invalidateQueries({
        queryKey: ['documents', documentId],
      });
    },
  });
}
