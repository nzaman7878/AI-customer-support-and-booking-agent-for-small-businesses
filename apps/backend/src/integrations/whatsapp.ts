import { config } from '../config/index.js';
import { runAgent } from '../agent/graph.js';

export interface WhatsAppMessagePayload {
  from: string; // Customer phone number (e.g. "919820112345")
  messageId: string;
  text: string;
  timestamp: string;
  name?: string;
}

/**
 * Send an outbound message via Meta WhatsApp Cloud API
 */
export async function sendWhatsAppMessage(
  to: string, 
  bodyText: string,
  quickReplies?: string[]
): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!config.whatsapp.accessToken || !config.whatsapp.phoneNumberId) {
    console.log(`[WhatsApp Simulation] To: ${to} | Body: "${bodyText.slice(0, 100)}..."`);
    return {
      success: true,
      data: { message: 'WhatsApp credentials not set; message logged in simulation mode' }
    };
  }

  try {
    let messagePayload: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { preview_url: false, body: bodyText }
    };

    // If quick replies are provided, format as interactive button message
    if (quickReplies && quickReplies.length > 0 && quickReplies.length <= 3) {
      messagePayload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: bodyText },
          action: {
            buttons: quickReplies.map((reply, idx) => ({
              type: 'reply',
              reply: {
                id: `btn_${idx}_${reply.toLowerCase().replace(/\s+/g, '_')}`,
                title: reply.slice(0, 20)
              }
            }))
          }
        }
      };
    }

    const response = await fetch(
      `https://graph.facebook.com/v21.0/${config.whatsapp.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.whatsapp.accessToken}`
        },
        body: JSON.stringify(messagePayload)
      }
    );

    const json = await response.json();
    return { success: response.ok, data: json };
  } catch (error: any) {
    console.error('[WhatsApp API] Send message error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Process incoming Meta WhatsApp Webhook payload
 */
export async function processWhatsAppWebhook(body: any): Promise<{ handled: boolean; reply?: string }> {
  try {
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];
    const contact = value?.contacts?.[0];

    if (!message) {
      return { handled: false };
    }

    const from = message.from; // Phone number
    const customerName = contact?.profile?.name || 'WhatsApp Customer';

    // Extract text from text message or interactive button reply
    let text = '';
    if (message.type === 'text') {
      text = message.text?.body || '';
    } else if (message.type === 'interactive') {
      text = message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || '';
    }

    if (!text) {
      return { handled: false };
    }

    console.log(`[WhatsApp Webhook] Received message from ${customerName} (${from}): "${text}"`);

    // Run LangGraph Agent
    const conversationId = `wa_${from}`;
    const agentState = await runAgent(text, conversationId, 'whatsapp', {
      name: customerName,
      phone: from
    });

    // Send reply back to customer on WhatsApp
    await sendWhatsAppMessage(from, agentState.finalResponse);

    return {
      handled: true,
      reply: agentState.finalResponse
    };
  } catch (error: any) {
    console.error('[WhatsApp Webhook] Processing error:', error);
    return { handled: false };
  }
}
