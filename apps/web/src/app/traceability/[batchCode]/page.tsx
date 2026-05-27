import TraceabilityDetailPageClient from './TraceabilityDetailClient';

export async function generateStaticParams() {
  return [
    { batchCode: 'BATCH-BUOI-CAIMON-01' },
    { batchCode: 'BATCH-BUOI-CAIMON-02' },
    { batchCode: 'BATCH-CACHUA-DALAT-01' },
    { batchCode: 'BATCH-RAUMUONG-01' },
    { batchCode: 'BATCH-SAURIENG-RI6-01' },
    { batchCode: 'BATCH-XOAICAT-HOALOC-01' },
    { batchCode: 'BATCH-BOSAP-034-01' },
    { batchCode: 'BATCH-NAMDUIGA-HUYEN-01' },
    { batchCode: 'BATCH-MANGTAY-NINHTHUAN-01' }
  ];
}

export default function Page() {
  return <TraceabilityDetailPageClient />;
}
