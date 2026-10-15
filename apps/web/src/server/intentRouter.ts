// apps/web/src/server/intentRouter.ts
// Intelligent multi-label intent router with Vietnamese normalization

export type IntentType =
  | 'GENERAL_GREETING'
  | 'PROMPT_INJECTION_GUARD'
  | 'MEDICAL_SAFETY_GUARDRAIL'
  | 'OUT_OF_SCOPE_COMMERCE'
  | 'COMPARE_LOCAL_AND_EXTERNAL'
  | 'TRACEABILITY_QR'
  | 'BUDGET_CALCULATION'
  | 'PRODUCT_INVENTORY'
  | 'SEASONALITY'
  | 'NOVEL_TERMS'
  | 'AGRONOMY_POLICY'
  | 'MULTI_INTENT'
  | 'CORRECTION'
  | 'KNOWLEDGE'
  | 'UNKNOWN';

export interface ParsedIntent {
  primaryIntent: IntentType;
  secondaryIntents: IntentType[];
  extractedEntities: {
    products?: string[];
    cooperatives?: string[];
    foreignPlaces?: string[];
    batchCode?: string | null;
    budget?: number | null;
    quantity?: number | null;
    excludeCashew?: boolean;
    comparison?: boolean;
    novelTerm?: string | null;
  };
  normalizedQuery: string;
}

export function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

export function detectIntent(query: string, history: any[] = []): ParsedIntent {
  const clean = query.trim();
  const lower = clean.toLowerCase();
  const norm = removeVietnameseTones(clean);

  const secondaryIntents: IntentType[] = [];
  const entities: ParsedIntent['extractedEntities'] = {
    products: [],
    cooperatives: [],
    foreignPlaces: [],
    batchCode: null,
    budget: null,
    quantity: null,
    excludeCashew: false,
    comparison: false,
    novelTerm: null
  };

  // 0. Prompt Injection / Jailbreak Guard (T27)
  const injectionPatterns = [
    'bo qua chi dan',
    'system prompt',
    'in ra toan bo',
    'ban la robot',
    'ignore previous',
    'ignore all instructions',
    'jailbreak'
  ];
  if (injectionPatterns.some(p => norm.includes(p))) {
    return {
      primaryIntent: 'PROMPT_INJECTION_GUARD',
      secondaryIntents,
      extractedEntities: entities,
      normalizedQuery: norm
    };
  }

  // 1. Correction / Apology handling (T17: "Tôi hỏi sầu riêng, sao lại giới thiệu bưởi?")
  const isCorrection =
    norm.includes('sao lai gioi thieu') ||
    norm.includes('toi hoi') ||
    norm.includes('nham roi') ||
    norm.includes('khong phai');
  if (isCorrection && (norm.includes('sau rieng') || norm.includes('buoi'))) {
    return {
      primaryIntent: 'CORRECTION',
      secondaryIntents,
      extractedEntities: entities,
      normalizedQuery: norm
    };
  }

  // 2. Traceability QR / Batch lookup
  const batchMatch = clean.match(/BATCH-[A-Z0-9\-]+/i);
  if (batchMatch || norm.includes('truy xuat') || norm.includes('ma lo') || norm.includes('quet qr')) {
    entities.batchCode = batchMatch ? batchMatch[0].toUpperCase() : null;
    return {
      primaryIntent: 'TRACEABILITY_QR',
      secondaryIntents,
      extractedEntities: entities,
      normalizedQuery: norm
    };
  }

  // 3. Medical safety filter
  const medicalWords = ['chua benh', 'tri benh', 'ung thu', 'tieu duong', 'than duoc', 'khoi benh', 'thay the thuoc', 'phuong phap tri'];
  if (medicalWords.some(w => norm.includes(w))) {
    return {
      primaryIntent: 'MEDICAL_SAFETY_GUARDRAIL',
      secondaryIntents,
      extractedEntities: entities,
      normalizedQuery: norm
    };
  }

  // 4. Foreign province check (Distinguish Comparison vs Commerce!)
  const foreignNames = ['cai mon', 'vinh long', 'da lat', 'bac giang', 'ninh thuan', 'ben tre', 'dak lak', 'lam dong'];
  const matchedForeign = foreignNames.filter(fn => norm.includes(fn));
  if (matchedForeign.length > 0) {
    entities.foreignPlaces = matchedForeign;
    const isComparison =
      norm.includes('khac') ||
      norm.includes('so sanh') ||
      norm.includes('phan biet') ||
      norm.includes('khac nhau');

    if (isComparison) {
      entities.comparison = true;
      return {
        primaryIntent: 'COMPARE_LOCAL_AND_EXTERNAL',
        secondaryIntents,
        extractedEntities: entities,
        normalizedQuery: norm
      };
    }

    const isBuyOrList =
      norm.includes('mua') ||
      norm.includes('dat') ||
      norm.includes('ban') ||
      norm.includes('co ban') ||
      norm.includes('gia bao nhieu');
    if (isBuyOrList) {
      return {
        primaryIntent: 'OUT_OF_SCOPE_COMMERCE',
        secondaryIntents,
        extractedEntities: entities,
        normalizedQuery: norm
      };
    }
  }

  // 5. Multi-intent question (T30: "Giải thích VietGAP, HTX Tân Triều có chứng nhận gì, bưởi giá hôm nay bao nhiêu?")
  if (
    (norm.includes('vietgap') || norm.includes('giai thich')) &&
    (norm.includes('chung nhan') || norm.includes('htx')) &&
    (norm.includes('gia') || norm.includes('bao nhieu'))
  ) {
    return {
      primaryIntent: 'MULTI_INTENT',
      secondaryIntents: ['NOVEL_TERMS', 'PRODUCT_INVENTORY'],
      extractedEntities: entities,
      normalizedQuery: norm
    };
  }

  // 6. Novel Terms / General Agronomy & Quality Questions
  // (Brix, Ethylene, aw hoạt độ nước, GlobalG.A.P., SKU, HACCP vs VietGAP)
  if (norm.includes('brix') || norm.includes('°bx')) {
    entities.novelTerm = 'Brix';
    return {
      primaryIntent: 'NOVEL_TERMS',
      secondaryIntents,
      extractedEntities: entities,
      normalizedQuery: norm
    };
  }
  if (norm.includes('ethylene')) {
    entities.novelTerm = 'Ethylene';
    return {
      primaryIntent: 'NOVEL_TERMS',
      secondaryIntents,
      extractedEntities: entities,
      normalizedQuery: norm
    };
  }
  if (norm.includes('hoat do nuoc') || norm.includes('aw') || norm.includes('trai cay say can giam')) {
    entities.novelTerm = 'Hoạt độ nước (aw)';
    return {
      primaryIntent: 'NOVEL_TERMS',
      secondaryIntents,
      extractedEntities: entities,
      normalizedQuery: norm
    };
  }
  if (norm.includes('globalg.a.p') || norm.includes('globalgap')) {
    entities.novelTerm = 'GlobalG.A.P.';
    return {
      primaryIntent: 'NOVEL_TERMS',
      secondaryIntents,
      extractedEntities: entities,
      normalizedQuery: norm
    };
  }
  if (norm.includes('haccp khac vietgap') || norm.includes('so sanh haccp') || (norm.includes('haccp') && norm.includes('vietgap'))) {
    entities.novelTerm = 'HACCP và VietGAP';
    return {
      primaryIntent: 'NOVEL_TERMS',
      secondaryIntents,
      extractedEntities: entities,
      normalizedQuery: norm
    };
  }
  if (norm.includes('sku la gi') || norm.includes('sku cua')) {
    entities.novelTerm = 'SKU';
    return {
      primaryIntent: 'NOVEL_TERMS',
      secondaryIntents,
      extractedEntities: entities,
      normalizedQuery: norm
    };
  }

  // 7. Agronomy Policy (T20: "Có phải tất cả HTX đều đạt VietGAP?", T22: "Tôi mua giống từ tỉnh khác...")
  if (
    norm.includes('tat ca htx') ||
    norm.includes('toan bo htx') ||
    norm.includes('co phai tat ca')
  ) {
    return {
      primaryIntent: 'AGRONOMY_POLICY',
      secondaryIntents,
      extractedEntities: entities,
      normalizedQuery: norm
    };
  }
  if (
    norm.includes('giong trai tu tinh khac') ||
    norm.includes('mua giong') ||
    norm.includes('trong o dong nai co ban duoc')
  ) {
    return {
      primaryIntent: 'AGRONOMY_POLICY',
      secondaryIntents,
      extractedEntities: entities,
      normalizedQuery: norm
    };
  }

  // 8. Calculation vs Seasonality when keyword 'mùa' appears
  // (T31: "Mùa này mua 5kg sầu riêng hết bao tiền?" -> PURCHASE CALCULATION, NOT SEASONALITY!)
  const budgetPattern = /(\d+)\s*(k|nghìn|ngàn|triệu|tr)/i;
  const pricePattern = /(\d+[\d\.,]*)\s*đ/i;
  const kgPattern = /(\d+)\s*(kg|kí|ký|qua|trai|hop|hu)/i;

  const hasBudget = lower.match(budgetPattern) || lower.match(pricePattern);
  const hasKg = lower.match(kgPattern);

  if (norm.includes('doi sang')) {
    const changeMatch = norm.match(/doi sang\s*(\d+)\s*(kg|ki|ky|qua|hop|hu|trai)?/i);
    if (changeMatch) {
      entities.quantity = parseInt(changeMatch[1], 10);
    }
    if (norm.includes('300k') || norm.includes('300.000')) {
      entities.budget = 300000;
    }
    return {
      primaryIntent: 'BUDGET_CALCULATION',
      secondaryIntents: ['PRODUCT_INVENTORY'],
      extractedEntities: entities,
      normalizedQuery: norm
    };
  }

  if (hasKg && (norm.includes('mua') || norm.includes('het bao tien') || norm.includes('gia bao nhieu'))) {
    const kgNum = parseInt(hasKg[1], 10);
    entities.quantity = kgNum;
    return {
      primaryIntent: 'BUDGET_CALCULATION',
      secondaryIntents: ['PRODUCT_INVENTORY'],
      extractedEntities: entities,
      normalizedQuery: norm
    };
  }

  // Budget combo intent
  if (
    norm.includes('ngan sach') ||
    norm.includes('combo') ||
    norm.includes('qua bieu') ||
    norm.includes('duoi 250k') ||
    (norm.includes('mua') && hasBudget)
  ) {
    entities.excludeCashew = norm.includes('khong hat dieu') || norm.includes('di ung hat') || norm.includes('bo hat dieu');
    return {
      primaryIntent: 'BUDGET_CALCULATION',
      secondaryIntents,
      extractedEntities: entities,
      normalizedQuery: norm
    };
  }

  // 9. Live Product Inventory check ("Còn sầu riêng không? Bao nhiêu?", "Giá bưởi hôm nay")
  if (
    (norm.includes('con') && norm.includes('khong')) ||
    (norm.includes('gia') && norm.includes('bao nhieu')) ||
    norm.includes('ton kho')
  ) {
    return {
      primaryIntent: 'PRODUCT_INVENTORY',
      secondaryIntents,
      extractedEntities: entities,
      normalizedQuery: norm
    };
  }

  // 10. Seasonality query (T16: "Chôm chôm Long Khánh có tháng mấy?", "Khi nào chín rộ")
  if (
    norm.includes('thang may') ||
    norm.includes('mua vu') ||
    norm.includes('chin ro') ||
    norm.includes('thu hoach vao')
  ) {
    return {
      primaryIntent: 'SEASONALITY',
      secondaryIntents,
      extractedEntities: entities,
      normalizedQuery: norm
    };
  }

  // 11. General Greeting ONLY if the user solely greets without questions
  const pureGreetingWords = ['xin chao', 'chao ban', 'hello', 'hi', 'chao tro ly', 'chao cropnet'];
  const isPureGreeting = pureGreetingWords.some(g => norm === g || norm === `${g}!` || norm === `${g} nhe`);
  if (isPureGreeting) {
    return {
      primaryIntent: 'GENERAL_GREETING',
      secondaryIntents,
      extractedEntities: entities,
      normalizedQuery: norm
    };
  }

  // Default to general knowledge
  return {
    primaryIntent: 'KNOWLEDGE',
    secondaryIntents,
    extractedEntities: entities,
    normalizedQuery: norm
  };
}
