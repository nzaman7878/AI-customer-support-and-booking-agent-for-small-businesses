import { processWhatsAppWebhook } from '../integrations/whatsapp.js';
import { runAgent } from '../agent/graph.js';
import { seedClinicKnowledgeBase } from '../services/seedKnowledge.js';

async function verifyOmnichannelGateways() {
  console.log('📡 Starting Phase 6 Omnichannel Delivery Verification (WhatsApp & Web Widget)...\n');

  await seedClinicKnowledgeBase();

  // Test 1: Simulated WhatsApp Inquiry
  console.log('--- Test 1: WhatsApp Ingress & Reply ---');
  const mockWhatsAppPayload = {
    entry: [{
      changes: [{
        value: {
          contacts: [{ profile: { name: 'Sunil Gavaskar' } }],
          messages: [{
            from: '919820199999',
            type: 'text',
            text: { body: 'What are the clinic opening hours on Saturday?' },
            timestamp: `${Math.floor(Date.now() / 1000)}`
          }]
        }
      }]
    }]
  };

  const waResult = await processWhatsAppWebhook(mockWhatsAppPayload);
  console.log(`✅ Handled: ${waResult.handled}`);
  console.log(`WhatsApp Reply: "${waResult.reply?.slice(0, 140)}..."`);

  if (!waResult.handled || !waResult.reply) {
    throw new Error('Test 1 Failed: WhatsApp message was not processed properly');
  }

  // Test 2: WhatsApp Interactive Slot Selection
  console.log('\n--- Test 2: WhatsApp Interactive Booking Response ---');
  const mockBookingPayload = {
    entry: [{
      changes: [{
        value: {
          contacts: [{ profile: { name: 'Sunil Gavaskar' } }],
          messages: [{
            from: '919820199999',
            type: 'text',
            text: { body: 'Can I book a consultation this Friday?' },
            timestamp: `${Math.floor(Date.now() / 1000)}`
          }]
        }
      }]
    }]
  };

  const bookingWaResult = await processWhatsAppWebhook(mockBookingPayload);
  console.log(`✅ Handled: ${bookingWaResult.handled}`);
  console.log(`WhatsApp Booking Reply: "${bookingWaResult.reply?.slice(0, 140)}..."`);

  if (!bookingWaResult.handled) {
    throw new Error('Test 2 Failed: WhatsApp booking was not processed properly');
  }

  // Test 3: Web Chat Widget Agent Invocation
  console.log('\n--- Test 3: Web Chat Widget Agent Invocation ---');
  const widgetState = await runAgent(
    'What is your refund policy if I buy a 5-session cryo package?',
    'widget_sess_test',
    'web'
  );
  console.log(`Intent: ${widgetState.detectedIntent}`);
  console.log(`Thoughts: ${widgetState.agentThoughts.length} trace items`);
  console.log(`Widget Response: "${widgetState.finalResponse.slice(0, 140)}..."`);

  if (widgetState.detectedIntent !== 'inquiry' || !widgetState.finalResponse.includes('refund')) {
    throw new Error('Test 3 Failed: Web widget inquiry should ground in refund policy');
  }

  console.log('\n🎉 ALL Phase 6 Omnichannel tests passed successfully!');
}

verifyOmnichannelGateways().catch(err => {
  console.error('❌ Omnichannel verification failed:', err);
  process.exit(1);
});
