import TraceabilityDetailPageClient from './TraceabilityDetailClient';

export async function generateStaticParams() {
  return [
    { batchCode: 'BATCH-BUOI-CAIMON-01' },
    { batchCode: 'BATCH-BUOI-CAIMON-02' }
  ];
}

export default function Page() {
  return <TraceabilityDetailPageClient />;
}
