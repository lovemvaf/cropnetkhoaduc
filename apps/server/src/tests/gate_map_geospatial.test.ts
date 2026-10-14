import assert from 'assert';

// Utility loại bỏ dấu tiếng Việt
function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

// Bounding box Thành phố Đồng Nai mở rộng (bao gồm cả Bình Phước cũ)
const DONG_NAI_BBOX = {
  minLat: 10.60,
  maxLat: 12.10,
  minLng: 106.50,
  maxLng: 107.60
};

// Dữ liệu đối chiếu
const TEST_MAP_POINTS = [
  { id: 'htx-tantrieu', tier: 2, status: 'VERIFIED', lat: 11.0267, lng: 106.8835, source: 'Hồ sơ OCOP Sở NN&PTNT Đồng Nai' },
  { id: 'htx-longkhanh', tier: 2, status: 'VERIFIED', lat: 10.9258, lng: 107.2412, source: 'Chứng nhận VietGAP' },
  { id: 'batch-hatdieu-dongnai', tier: 3, status: 'VERIFIED', lat: 11.2350, lng: 107.1680, source: 'HACCP Codex' },
  { id: 'region-xuanloc', tier: 1, status: 'TRADITIONAL_REGION', lat: 10.9325, lng: 107.3820 },
  { id: 'region-cammy', tier: 1, status: 'TRADITIONAL_REGION', lat: 10.7932, lng: 107.2185 },
  { id: 'region-cattien', tier: 1, status: 'TRADITIONAL_REGION', lat: 11.4285, lng: 107.4268 },
  { id: 'region-trian', tier: 1, status: 'TRADITIONAL_REGION', lat: 11.1215, lng: 107.0189 },
  { id: 'region-dongxoai', tier: 1, status: 'TRADITIONAL_REGION', lat: 11.5333, lng: 106.8833 },
  { id: 'region-phurieng', tier: 1, status: 'TRADITIONAL_REGION', lat: 11.7580, lng: 106.9850 },
  { id: 'region-chonthanh', tier: 1, status: 'TRADITIONAL_REGION', lat: 11.4720, lng: 106.6680 },
  { id: 'region-budang', tier: 1, status: 'TRADITIONAL_REGION', lat: 11.7650, lng: 107.2420 }
];

async function runGeospatialTests() {
  console.log('\n=== [GATE GIS & GEOSPATIAL MAP VERIFICATION TESTS] ===\n');
  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void) {
    try {
      fn();
      console.log(`  ✔ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✘ FAIL: ${name} -> ${err.message}`);
      failed++;
    }
  }

  // Test 1: Diacritic removal
  test('removeVietnameseTones strips accents accurately for fuzzy search', () => {
    assert.strictEqual(removeVietnameseTones('Cù Lao Tân Triều'), 'cu lao tan trieu');
    assert.strictEqual(removeVietnameseTones('Sầu Riêng Chín Cây'), 'sau rieng chin cay');
    assert.strictEqual(removeVietnameseTones('Đồng Xoài & Bù Đăng'), 'dong xoai & bu dang');
  });

  // Test 2: Point count
  test('Total points count equals 11 (2 verified coops, 1 QR lot, 8 traditional basins)', () => {
    assert.strictEqual(TEST_MAP_POINTS.length, 11);
    const tier1Count = TEST_MAP_POINTS.filter(p => p.tier === 1).length;
    const tier2Count = TEST_MAP_POINTS.filter(p => p.tier === 2).length;
    const tier3Count = TEST_MAP_POINTS.filter(p => p.tier === 3).length;
    assert.strictEqual(tier1Count, 8, 'Must have exactly 8 traditional regions');
    assert.strictEqual(tier2Count, 2, 'Must have exactly 2 verified cooperatives');
    assert.strictEqual(tier3Count, 1, 'Must have exactly 1 QR trace lot');
  });

  // Test 3: Bounding box compliance
  test('All 11 points strictly fall inside Dong Nai Metropolitan territory (lat 10.6-12.1, lng 106.5-107.6)', () => {
    TEST_MAP_POINTS.forEach(p => {
      assert.ok(
        p.lat >= DONG_NAI_BBOX.minLat && p.lat <= DONG_NAI_BBOX.maxLat,
        `Point ${p.id} latitude ${p.lat} outside bbox [${DONG_NAI_BBOX.minLat}, ${DONG_NAI_BBOX.maxLat}]`
      );
      assert.ok(
        p.lng >= DONG_NAI_BBOX.minLng && p.lng <= DONG_NAI_BBOX.maxLng,
        `Point ${p.id} longitude ${p.lng} outside bbox [${DONG_NAI_BBOX.minLng}, ${DONG_NAI_BBOX.maxLng}]`
      );
    });
  });

  // Test 4: Data integrity - No fake verified claims
  test('Tier 1 regional basins are never marked VERIFIED and only designated TRADITIONAL_REGION', () => {
    const tier1Points = TEST_MAP_POINTS.filter(p => p.tier === 1);
    tier1Points.forEach(p => {
      assert.strictEqual(p.status, 'TRADITIONAL_REGION', `Tier 1 point ${p.id} must be TRADITIONAL_REGION`);
    });
  });

  // Test 5: Verified items must provide proof sources
  test('All items marked VERIFIED must provide official verification sources', () => {
    const verifiedPoints = TEST_MAP_POINTS.filter(p => p.status === 'VERIFIED');
    verifiedPoints.forEach(p => {
      assert.ok(p.source && p.source.length > 5, `Verified point ${p.id} lacks official verification source`);
    });
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) process.exit(1);
}

runGeospatialTests().catch(err => {
  console.error(err);
  process.exit(1);
});
