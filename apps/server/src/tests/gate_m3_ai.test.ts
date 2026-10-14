import assert from 'assert';
import { 
  optimizeBudgetCombo, 
  processAiConsultation, 
  getSeasonalCalendarData 
} from '../modules/ai/ai.service';

async function runTests() {
  console.log('\n=== [GATE M3 AI COPILOT & RECOMMENDER TESTS] ===\n');

  // Test 1: Budget optimizer strictly obeys <= budget and excludes alcohol from default gifts
  const budget500k = 500000;
  const combo500k = await optimizeBudgetCombo(budget500k, 'đối tác', 'quà biếu');
  assert.ok(combo500k.totalCost <= budget500k, `Total cost ${combo500k.totalCost} must be <= budget ${budget500k}`);
  assert.ok(combo500k.items.length > 0, 'Combo must contain at least 1 item');
  assert.strictEqual(combo500k.targetBudget, budget500k);
  assert.ok(combo500k.items.every(i => !i.name.toLowerCase().includes('rượu')), 'Default gift combo must not contain alcohol');
  console.log('  ✔ PASS: optimizeBudgetCombo strictly respects 500,000 VND budget without exceeding and excludes alcohol');

  // Test 1b: Exclusion handling (không hạt điều)
  const comboNoNuts = await optimizeBudgetCombo(500000, 'đối tác', 'quà biếu không hạt điều');
  assert.ok(comboNoNuts.totalCost <= 500000, 'Must respect budget constraint');
  assert.ok(comboNoNuts.items.every(i => !i.name.toLowerCase().includes('hạt điều')), 'Must exclude cashew nuts when requested');
  console.log('  ✔ PASS: optimizeBudgetCombo respects exclusion filter (không hạt điều)');

  // Test 2: Budget optimizer for small budget 100,000 VND
  const budget100k = 100000;
  const combo100k = await optimizeBudgetCombo(budget100k, 'gia đình', 'tiêu dùng');
  assert.ok(combo100k.totalCost <= budget100k, `Total cost ${combo100k.totalCost} must be <= budget ${budget100k}`);
  console.log('  ✔ PASS: optimizeBudgetCombo handles tight 100,000 VND budget correctly');

  // Test 3: Medical safety guardrail triggered with verified_rules mode
  const medicalQuery = 'Bưởi Tân Triều có chữa được bệnh ung thư và tiểu đường không?';
  const medicalResponse = await processAiConsultation(medicalQuery);
  assert.strictEqual(medicalResponse.intent, 'MEDICAL_SAFETY_GUARDRAIL', 'Should detect medical safety guardrail intent');
  assert.strictEqual(medicalResponse.mode, 'verified_rules', 'Should declare verified_rules mode transparently');
  assert.ok(medicalResponse.reply.includes('không thể thay thế thuốc chữa bệnh'), 'Should provide strict medical disclaimer');
  console.log('  ✔ PASS: processAiConsultation triggers medical safety guardrail and transparent mode');

  // Test 4: Traceability verification for genuine Dong Nai batch
  const validBatchQuery = 'Tôi muốn kiểm tra mã lô BATCH-BUOI-TANTRIEU-2026-01';
  const validBatchResponse = await processAiConsultation(validBatchQuery);
  assert.strictEqual(validBatchResponse.intent, 'TRACEABILITY_VERIFICATION');
  assert.strictEqual(validBatchResponse.mode, 'verified_rules');
  assert.ok(validBatchResponse.reply.includes('xác thực trên hệ thống'), 'Should confirm genuine lot verification');
  assert.ok(validBatchResponse.actionLink?.url.includes('BATCH-BUOI-TANTRIEU-2026-01'), 'Should provide direct link to lot details');
  console.log('  ✔ PASS: processAiConsultation successfully validates genuine lot code BATCH-BUOI-TANTRIEU-2026-01');

  // Test 5: Traceability rejection for non-existent / fake batch (Fail-closed)
  const fakeBatchQuery = 'Mã lô BATCH-FAKE-99999999 có hợp lệ không?';
  const fakeBatchResponse = await processAiConsultation(fakeBatchQuery);
  assert.strictEqual(fakeBatchResponse.intent, 'TRACEABILITY_NOT_FOUND');
  assert.ok(fakeBatchResponse.reply.includes('Cảnh báo an toàn'), 'Should raise safety alert for unrecognized lot');
  console.log('  ✔ PASS: processAiConsultation fails closed and alerts user on unknown lot code');

  // Test 6: Seasonal calendar accurate facts
  const seasonData = getSeasonalCalendarData();
  assert.ok(seasonData.length >= 3, 'Should provide at least 3 major crops');
  const durianSeason = seasonData.find(c => c.crop.includes('Sầu Riêng'));
  assert.ok(durianSeason, 'Must include Sầu Riêng Ri6 Long Khánh');
  assert.ok(durianSeason?.location.includes('Xuân Lập') || durianSeason?.location.includes('Đồng Nai'), 'Must be associated with authentic Dong Nai location');
  console.log('  ✔ PASS: getSeasonalCalendarData returns authentic regional crop seasonality');

  console.log('\nResults: 6 passed, 0 failed.\n');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
