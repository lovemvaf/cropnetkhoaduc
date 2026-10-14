import assert from 'assert';
import { getJwtSecret, getJwtRefreshSecret, generateSecureToken } from '../utils/security';
import * as traceRepo from '../modules/traceability/trace.repository';
import * as traceService from '../modules/traceability/trace.service';
import * as productRepo from '../modules/product/product.repository';
import * as authService from '../modules/auth/auth.service';

async function runM0SecurityTests() {
  console.log('=== [GATE M0 SECURITY & DATA INTEGRITY TESTS] ===\n');
  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    return Promise.resolve()
      .then(fn)
      .then(() => {
        console.log(`  ✔ PASS: ${name}`);
        passed++;
      })
      .catch((err) => {
        console.error(`  ✖ FAIL: ${name}`);
        console.error(`    -> ${err.message}`);
        failed++;
      });
  }

  // Test 1: getJwtSecret fails in production when using default insecure secret
  await test('getJwtSecret fails closed in production with default insecure secret', () => {
    const originalEnv = process.env.NODE_ENV;
    const originalSecret = process.env.JWT_SECRET;
    try {
      process.env.NODE_ENV = 'production';
      process.env.JWT_SECRET = 'super-secret-jwt-key';
      assert.throws(() => getJwtSecret(), /FATAL_SECURITY_ERROR/);
    } finally {
      process.env.NODE_ENV = originalEnv;
      process.env.JWT_SECRET = originalSecret;
    }
  });

  // Test 2: getJwtSecret accepts valid 32+ char secret in production
  await test('getJwtSecret accepts secure 32+ character key in production', () => {
    const originalEnv = process.env.NODE_ENV;
    const originalSecret = process.env.JWT_SECRET;
    try {
      process.env.NODE_ENV = 'production';
      process.env.JWT_SECRET = 'a_very_strong_and_secure_cryptographic_key_2026_dong_nai';
      const secret = getJwtSecret();
      assert.strictEqual(secret, 'a_very_strong_and_secure_cryptographic_key_2026_dong_nai');
    } finally {
      process.env.NODE_ENV = originalEnv;
      process.env.JWT_SECRET = originalSecret;
    }
  });

  // Test 3: generateSecureToken generates distinct, high-entropy tokens
  await test('generateSecureToken generates unpredictable cryptographic tokens', () => {
    const t1 = generateSecureToken(8);
    const t2 = generateSecureToken(8);
    assert.strictEqual(t1.length, 8);
    assert.strictEqual(t2.length, 8);
    assert.notStrictEqual(t1, t2);
  });

  // Test 4: P0 Fix - Non-existent batch code must return null, NEVER MOCK_BATCHES[0]
  await test('findBatchByCode returns null for non-existent batch (never returns MOCK_BATCHES[0])', async () => {
    const res = await traceRepo.findBatchByCode('BATCH-COMPLETELY-NON-EXISTENT-XYZ');
    assert.strictEqual(res, null, 'Non-existent batch must return null!');
  });

  // Test 5: P0 Fix - Non-existent product ID must return null, NEVER MOCK_PRODUCTS[0]
  await test('findProductById returns null for invalid ID (never returns MOCK_PRODUCTS[0])', async () => {
    const res = await productRepo.findProductById('999999999-invalid-id');
    assert.strictEqual(res, null, 'Non-existent product ID must return null!');
  });

  // Test 6: Truthful baseline in trace.service - no fabricated PASSED or 0.0% pesticide
  await test('createTraceBatch creates truthful unverified baseline without fake PASSED lab reports', async () => {
    const batch = await traceService.createTraceBatch({
      productId: '1',
      batchCode: `TEST-BATCH-${Date.now()}`,
      harvestDate: new Date(),
      farmingArea: 'Vườn thực nghiệm Tân Triều',
      farmingProcess: 'Canh tác sinh thái tự nhiên',
      frontendOrigin: 'http://localhost:3000'
    });

    assert.ok(batch, 'Batch was created');
    assert.deepStrictEqual(batch.inspectionReports, [], 'Default inspection reports must be empty until officially tested');
    assert.strictEqual(batch.shipmentInfo, null, 'Default shipment info must be null until dispatched');
    assert.strictEqual(batch.logisticsTimeline[0].status, 'REGISTERED', 'First status must be REGISTERED');
  });

  // Test 7: requestPasswordReset does not expose resetToken in production
  await test('requestPasswordReset does not leak resetToken in production response', async () => {
    const originalEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = 'production';
      const res = await authService.requestPasswordReset('admin@cropnet.vn');
      assert.strictEqual((res as any).devResetToken, undefined, 'devResetToken must not be present in production');
      assert.strictEqual((res as any).resetToken, undefined, 'resetToken must not be present');
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runM0SecurityTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
