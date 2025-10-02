import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
  getDocuflowClient,
  type ListDocumentsRequest,
} from '@docuflow/shared';

export function useDocuments(params?: ListDocumentsRequest) {
  const client = getDocuflowClient();

  return useQuery({
    queryKey: ['documents', params],
    queryFn: () => client.listDocuments(params),
  });
}

export function useInfiniteDocuments(
  params?: Omit<ListDocumentsRequest, 'cursor'>
) {
  const client = getDocuflowClient();

  return useInfiniteQuery({
    queryKey: ['documents', 'infinite', params],
    queryFn: ({ pageParam }) =>
      client.listDocuments({
        limit: 20,
        sortBy: 'uploadedAt',
        sortOrder: 'desc',
        ...params,
        cursor: pageParam,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext ? lastPage.pagination.nextCursor : undefined,
    getPreviousPageParam: (firstPage) =>
      firstPage.pagination.hasPrev
        ? firstPage.pagination.prevCursor
        : undefined,
    initialPageParam: undefined as string | undefined,
  });
}
