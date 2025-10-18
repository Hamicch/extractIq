import { useQuery } from '@tanstack/react-query';
import { getDocuflowClient, type GetAnalyticsRequest } from '@extractiq/shared';

export function useAnalytics(params: GetAnalyticsRequest) {
  const client = getDocuflowClient();

  return useQuery({
    queryKey: ['analytics', params],
    queryFn: () => client.getAnalytics(params),
    staleTime: 1000 * 60 * 10, // 10 minutes - analytics data changes less frequently
  });
}
