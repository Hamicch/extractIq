import { useMutation } from '@tanstack/react-query';
import { getDocuflowClient, type WebhookConfig } from '@docuflow/shared';

export function useCreateWebhook() {
  const client = getDocuflowClient();

  return useMutation({
    mutationFn: (config: WebhookConfig) => client.createWebhook(config),
  });
}
