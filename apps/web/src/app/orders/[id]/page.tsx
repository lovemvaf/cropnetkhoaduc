import OrderTrackingPageClient from './OrderTrackingClient';

export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: 'mock-order-1' }
  ];
}

export default function Page() {
  return <OrderTrackingPageClient />;
}
