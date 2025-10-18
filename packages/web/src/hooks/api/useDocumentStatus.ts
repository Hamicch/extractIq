import { useQuery } from '@tanstack/react-query';
import { getDocuflowClient } from '@extractiq/shared';

export function useDocumentStatus(
  documentId: string,
  options?: {
    enabled?: boolean;
    refetchInterval?: number | false;
  }
) {
  const client = getDocuflowClient();

  const query = useQuery({
    queryKey: ['documents', documentId, 'status'],
    queryFn: () => client.getDocumentStatus(documentId),
    enabled: options?.enabled ?? true,
    // Poll every 3 seconds by default if document is still processing
    refetchInterval: (query) => {
      if (
        query.state.data?.status === 'processing' ||
        query.state.data?.status === 'queued' ||
        query.state.data?.status === 'uploading'
      ) {
        return options?.refetchInterval ?? 3000;
      }
      return false;
    },
    // Stop polling on completed/failed
    refetchIntervalInBackground: false,
  });

  return query;
}
