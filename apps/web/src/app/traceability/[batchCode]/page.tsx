import TraceabilityDetailPageClient from './TraceabilityDetailClient';

export async function generateStaticParams() {
  return [
    { batchCode: 'BATCH-BUOI-TANTRIEU-2026-01' },
    { batchCode: 'BATCH-SAURIENG-LONGKHANH-2026-01' },
    { batchCode: 'BATCH-HATDIEU-DONGNAI-2026-01' },
    { batchCode: 'BATCH-CHOMCHOM-LONGKHANH-2026-01' },
    { batchCode: 'BATCH-RUOUBUOI-TANTRIEU-2026-01' }
  ];
}

export default function Page() {
  return <TraceabilityDetailPageClient />;
}
