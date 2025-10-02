import { useQuery } from '@tanstack/react-query';
import {
  getDocuflowClient,
  type ListTenantsRequest,
} from '@docuflow/shared';

export function useTenants(params?: ListTenantsRequest) {
  const client = getDocuflowClient();

  return useQuery({
    queryKey: ['tenants', params],
    queryFn: () => client.listTenants(params),
  });
}
