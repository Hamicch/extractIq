import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDocuflowClient } from '@extractiq/shared';

export function useDocument(documentId: string, enabled = true) {
  const client = getDocuflowClient();

  return useQuery({
    queryKey: ['documents', documentId],
    queryFn: () => client.getDocument(documentId),
    enabled,
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  const client = getDocuflowClient();

  return useMutation({
    mutationFn: (documentId: string) => client.deleteDocument(documentId),
    onSuccess: (_, documentId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['documents', documentId] });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}
