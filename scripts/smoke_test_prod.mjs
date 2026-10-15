// scripts/smoke_test_prod.mjs
// Verifies live production endpoints on https://cropnetkhoaduc.vercel.app

const PROD_URL = 'https://cropnetkhoaduc.vercel.app';

async function testEndpoint(name, url, options = {}) {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    let body;
    if (contentType.includes('application/json')) {
      body = await res.json();
    } else {
      const text = await res.text();
      body = text.slice(0, 150) + (text.length > 150 ? '...' : '');
    }
    const ok = res.status >= 200 && res.status < 300;
    console.log(`[${ok ? 'PASS' : 'FAIL'}] ${name} (Status: ${res.status})`);
    if (!ok) {
      console.error(`       Error details:`, body);
    }
    return { ok, status: res.status, body, headers: res.headers };
  } catch (err) {
    console.error(`[FAIL] ${name} - Exception:`, err.message);
    return { ok: false, error: err.message };
  }
}

async function run() {
  console.log(`=== LIVE PRODUCTION SMOKE TEST: ${PROD_URL} ===\n`);
  
  // 1. Homepage
  await testEndpoint('1. GET / (Homepage)', `${PROD_URL}/`);

  // 2. Verified asset
  await testEndpoint('2. GET /assets/nongsan/buoi-duong-la-cam.jpg', `${PROD_URL}/assets/nongsan/buoi-duong-la-cam.jpg`);

  // 3. Categories API
  const catRes = await testEndpoint('3. GET /api/categories', `${PROD_URL}/api/categories`);
  if (catRes.ok && Array.isArray(catRes.body?.data || catRes.body)) {
    const list = catRes.body?.data || catRes.body;
    console.log(`       Categories returned: ${list.length} categories`);
  }

  // 4. Products API
  const prodRes = await testEndpoint('4. GET /api/products', `${PROD_URL}/api/products`);
  if (prodRes.ok) {
    const list = prodRes.body?.data || prodRes.body;
    console.log(`       Products returned: ${list.length} products`);
    console.log(`       Sample product: ${list[0]?.name} (${list[0]?.origin?.district}, ${list[0]?.origin?.province})`);
  }

  // 5. Traceability Batch API
  const batchRes = await testEndpoint(
    '5. GET /api/traceability/batches/BATCH-BUOI-TANTRIEU-2026-01',
    `${PROD_URL}/api/traceability/batches/BATCH-BUOI-TANTRIEU-2026-01`
  );
  if (batchRes.ok) {
    const batch = batchRes.body?.data || batchRes.body;
    console.log(`       Batch found: ${batch.productName} - Co-op: ${batch.producer?.cooperative}`);
  }

  // 6. Forum Posts API
  const forumRes = await testEndpoint('6. GET /api/forum', `${PROD_URL}/api/forum`);
  if (forumRes.ok) {
    const posts = forumRes.body?.data || forumRes.body;
    console.log(`       Forum posts returned: ${Array.isArray(posts) ? posts.length : 'OK'} posts`);
  }

  // 7. Auth Login API
  const loginRes = await testEndpoint('7. POST /api/auth/login (Admin Seed)', `${PROD_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@cropnet.vn',
      password: 'AdminDongNai2026!@#'
    })
  });
  if (loginRes.ok) {
    const user = loginRes.body?.data?.user;
    console.log(`       Login success! User: ${user?.fullName} | Role: ${user?.role}`);
    const setCookie = loginRes.headers.get('set-cookie');
    console.log(`       Set-Cookie header received: ${setCookie ? 'YES (contains JWT tokens)' : 'NO'}`);
  }

  // 8. RAG Chatbot API (Budget Query)
  const chatRes = await testEndpoint('8. POST /api/ai/chat (Budget Combo)', `${PROD_URL}/api/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Tư vấn combo quà tặng nông sản Đồng Nai ngân sách 300000 VNĐ'
    })
  });
  if (chatRes.ok) {
    const data = chatRes.body?.data;
    console.log(`       RAG Response Intent: ${data?.intent}`);
    console.log(`       Mode: ${data?.mode} | AnswerType: ${data?.answerType}`);
    console.log(`       Sample message: ${data?.reply?.slice(0, 140)}...`);
  }

  // 9. RAG Chatbot Out-of-bounds Query (Bảo Lộc / Lâm Đồng)
  const oobRes = await testEndpoint('9. POST /api/ai/chat (Boundary Rejection)', `${PROD_URL}/api/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Có trà Bảo Lộc Lâm Đồng hay bơ sáp Đắk Lắk không?'
    })
  });
  if (oobRes.ok) {
    const data = oobRes.body?.data;
    console.log(`       Boundary rejection message: ${data?.reply?.slice(0, 140)}...`);
  }

  console.log(`\n=== SMOKE TEST FINISHED ===`);
}

run();
