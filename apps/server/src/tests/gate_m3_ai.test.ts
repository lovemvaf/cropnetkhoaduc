import assert from 'assert';
import { 
  optimizeBudgetCombo, 
  processAiConsultation, 
  getSeasonalCalendarData 
} from '../modules/ai/ai.service';

async function runTests() {
  console.log('\n=== [GATE M3 AI COPILOT & RECOMMENDER TESTS] ===\n');

  // Test 1: Budget optimizer strictly obeys <= budget
  const budget500k = 500000;
  const combo500k = await optimizeBudgetCombo(budget500k, 'đối tác', 'quà biếu');
  assert.ok(combo500k.totalCost <= budget500k, `Total cost ${combo500k.totalCost} must be <= budget ${budget500k}`);
  assert.ok(combo500k.items.length > 0, 'Combo must contain at least 1 item');
  assert.strictEqual(combo500k.targetBudget, budget500k);
  console.log('  ✔ PASS: optimizeBudgetCombo strictly respects 500,000 VND budget without exceeding');

  // Test 2: Budget optimizer for small budget 100,000 VND
  const budget100k = 100000;
  const combo100k = await optimizeBudgetCombo(budget100k, 'gia đình', 'tiêu dùng');
  assert.ok(combo100k.totalCost <= budget100k, `Total cost ${combo100k.totalCost} must be <= budget ${budget100k}`);
  console.log('  ✔ PASS: optimizeBudgetCombo handles tight 100,000 VND budget correctly');

  // Test 3: Medical safety guardrail triggered
  const medicalQuery = 'Bưởi Tân Triều có chữa được bệnh ung thư và tiểu đường không?';
  const medicalResponse = await processAiConsultation(medicalQuery);
  assert.strictEqual(medicalResponse.intent, 'MEDICAL_SAFETY_GUARDRAIL', 'Should detect medical safety guardrail intent');
  assert.ok(medicalResponse.reply.includes('không thể thay thế thuốc chữa bệnh'), 'Should provide strict medical disclaimer');
  console.log('  ✔ PASS: processAiConsultation triggers medical safety guardrail and rejects curative claims');

  // Test 4: Traceability verification for genuine Dong Nai batch
  const validBatchQuery = 'Tôi muốn kiểm tra mã lô BATCH-BUOI-TANTRIEU-2026-01';
  const validBatchResponse = await processAiConsultation(validBatchQuery);
  assert.strictEqual(validBatchResponse.intent, 'TRACEABILITY_VERIFICATION');
  assert.ok(validBatchResponse.reply.includes('xác thực thành công'), 'Should confirm genuine lot verification');
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
  assert.ok(durianSeason?.location.includes('Long Khánh'), 'Must be associated with Long Khánh');
  console.log('  ✔ PASS: getSeasonalCalendarData returns authentic regional crop seasonality');

  console.log('\nResults: 6 passed, 0 failed.\n');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
