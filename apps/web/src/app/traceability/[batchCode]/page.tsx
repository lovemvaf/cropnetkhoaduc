import TraceabilityDetailPageClient from './TraceabilityDetailClient';

export async function generateStaticParams() {
  return [
    { batchCode: 'BATCH-BUOI-CAIMON-01' },
    { batchCode: 'BATCH-BUOI-CAIMON-02' },
    { batchCode: 'BATCH-CACHUA-DALAT-01' },
    { batchCode: 'BATCH-RAUMUONG-01' }
  ];
}

export default function Page() {
  return <TraceabilityDetailPageClient />;
}
