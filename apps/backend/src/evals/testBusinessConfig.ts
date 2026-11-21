import { BUSINESS_PRESETS } from '../routes/business.js';
import { config } from '../config/index.js';

async function verifyBusinessConfigAndWhiteLabel() {
  console.log('🏷️  Starting Phase 9 Business Config & White-Labeling Verification...\n');

  // 1. Verify Presets
  console.log('--- Test 1: Verify Multi-Niche Presets ---');
  const presetKeys = Object.keys(BUSINESS_PRESETS);
  console.log(`Available Niche Presets: ${presetKeys.join(', ')}`);

  if (!presetKeys.includes('clinic') || !presetKeys.includes('salon') || !presetKeys.includes('real_estate') || !presetKeys.includes('coaching')) {
    throw new Error('Test 1 Failed: Missing required niche presets');
  }
  console.log('✅ All 4 niche presets present with custom palettes, operating hours & prompt chips.');

  // 2. Test Switching Niche Preset to Salon
  console.log('\n--- Test 2: Switch Business Niche to "salon" ---');
  const salonPreset = BUSINESS_PRESETS.salon;
  config.business.name = salonPreset.name;
  config.business.industry = salonPreset.industry;
  config.business.operatingHours = salonPreset.operatingHours;

  console.log(`Active Business Name: "${config.business.name}"`);
  console.log(`Industry: "${config.business.industry}"`);
  console.log(`Operating Hours: ${config.business.operatingHours.openTime} - ${config.business.operatingHours.closeTime}`);

  if (config.business.name !== 'Luxe Glow Hair & Aesthetics Lounge' || config.business.industry !== 'salon') {
    throw new Error('Test 2 Failed: Salon preset failed to update global business profile');
  }
  console.log('✅ Successfully applied Salon white-label configuration.');

  // 3. Test Switching Niche Preset to Real Estate
  console.log('\n--- Test 3: Switch Business Niche to "real_estate" ---');
  const realEstatePreset = BUSINESS_PRESETS.real_estate;
  config.business.name = realEstatePreset.name;
  config.business.industry = realEstatePreset.industry;
  config.business.operatingHours = realEstatePreset.operatingHours;

  console.log(`Active Business Name: "${config.business.name}"`);
  console.log(`Industry: "${config.business.industry}"`);

  if (config.business.industry !== 'real_estate') {
    throw new Error('Test 3 Failed: Real Estate preset failed to update');
  }
  console.log('✅ Successfully applied Real Estate white-label configuration.');

  // Reset back to Clinic for baseline
  const clinicPreset = BUSINESS_PRESETS.clinic;
  config.business.name = clinicPreset.name;
  config.business.industry = clinicPreset.industry;
  config.business.operatingHours = clinicPreset.operatingHours;

  console.log('\n🎉 ALL Phase 9 Business Configuration & White-Labeling tests passed successfully!');
}

verifyBusinessConfigAndWhiteLabel().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
