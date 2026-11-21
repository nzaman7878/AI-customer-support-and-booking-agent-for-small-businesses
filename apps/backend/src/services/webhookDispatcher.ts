import crypto from 'crypto';
import { getDb, isDbConnected } from '../db/mongo.js';

export type WebhookEventType = 
  | 'appointment.created' 
  | 'appointment.cancelled' 
  | 'lead.captured' 
  | 'reminder.sent'
  | 'appointment.feedback_requested'
  | 'feedback.detractor_alert';

export interface WebhookLogEntry {
  id: string;
  event: WebhookEventType;
  endpointUrl: string;
  payload: any;
  status: 'delivered' | 'failed' | 'simulated';
  statusCode?: number;
  latencyMs: number;
  timestamp: string;
  errorMessage?: string;
}

export interface WebhookConfig {
  endpointUrl: string;
  secret: string;
  enabled: boolean;
  retryCount: number;
}

let activeWebhookConfig: WebhookConfig = {
  endpointUrl: 'https://hooks.zapier.com/hooks/catch/omniagent/demo',
  secret: 'omniagent_wh_secret_live',
  enabled: true,
  retryCount: 3
};

const webhookLogs: WebhookLogEntry[] = [
  {
    id: 'wh_log_init',
    event: 'lead.captured',
    endpointUrl: 'https://hooks.zapier.com/hooks/catch/omniagent/demo',
    payload: {
      name: 'Chloe Davenport',
      phone: '+1 (310) 902-3341',
      interest: 'Couples Hyperbaric Oxygen Therapy',
      source: 'web'
    },
    status: 'simulated',
    statusCode: 200,
    latencyMs: 14,
    timestamp: new Date(Date.now() - 3600000).toISOString()
  }
];

export function getWebhookConfig(): WebhookConfig {
  return { ...activeWebhookConfig };
}

export function updateWebhookConfig(partial: Partial<WebhookConfig>): WebhookConfig {
  activeWebhookConfig = {
    ...activeWebhookConfig,
    ...partial
  };
  return { ...activeWebhookConfig };
}

export function getWebhookLogs(): WebhookLogEntry[] {
  return [...webhookLogs];
}

/**
 * Dispatch an outbound webhook event to external CRM / Automation tools
 */
export async function dispatchWebhookEvent(
  event: WebhookEventType,
  data: any
): Promise<WebhookLogEntry> {
  const startTime = Date.now();
  const logId = `wh_evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const envelope = {
    id: logId,
    event,
    timestamp: new Date().toISOString(),
    business: 'OmniAgent Client',
    data
  };

  // Compute HMAC signature for client security verification
  const signature = crypto
    .createHmac('sha256', activeWebhookConfig.secret)
    .update(JSON.stringify(envelope))
    .digest('hex');

  let status: 'delivered' | 'failed' | 'simulated' = 'simulated';
  let statusCode = 200;
  let errorMessage: string | undefined;

  if (activeWebhookConfig.enabled && activeWebhookConfig.endpointUrl && activeWebhookConfig.endpointUrl.startsWith('http')) {
    // If it's a test/mock hook URL, simulate fast delivery, or execute real fetch if reachable
    if (activeWebhookConfig.endpointUrl.includes('localhost') || activeWebhookConfig.endpointUrl.includes('zapier') || activeWebhookConfig.endpointUrl.includes('webhook.site')) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);

        const response = await fetch(activeWebhookConfig.endpointUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-OmniAgent-Event': event,
            'X-OmniAgent-Signature': `sha256=${signature}`
          },
          body: JSON.stringify(envelope),
          signal: controller.signal
        });
        clearTimeout(timeout);

        statusCode = response.status;
        status = response.ok ? 'delivered' : 'failed';
      } catch (err: any) {
        // Fallback to simulated delivery in sandbox/offline environments
        status = 'simulated';
        statusCode = 200;
        errorMessage = `Live dispatch simulated: ${err.message}`;
      }
    } else {
      status = 'simulated';
      statusCode = 200;
    }
  }

  const logEntry: WebhookLogEntry = {
    id: logId,
    event,
    endpointUrl: activeWebhookConfig.endpointUrl,
    payload: envelope,
    status,
    statusCode,
    latencyMs: Date.now() - startTime,
    timestamp: new Date().toISOString(),
    errorMessage
  };

  webhookLogs.unshift(logEntry);
  if (webhookLogs.length > 50) webhookLogs.pop();

  // Persist to Mongo if connected
  const db = getDb();
  if (isDbConnected() && db) {
    try {
      await db.collection('webhook_logs').insertOne(logEntry);
    } catch {
      // Ignore Mongo error in simulation
    }
  }

  return logEntry;
}
