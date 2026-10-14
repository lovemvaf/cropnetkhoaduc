import ProductDetailPageClient from './ProductDetailPageClient';

export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
    { id: '6' },
    { id: 'prod-buoi-duong-la-cam' },
    { id: 'prod-buoi-da-xanh' },
    { id: 'prod-sau-rieng-ri6' },
    { id: 'prod-chom-chom-nhan' },
    { id: 'prod-hat-dieu-dong-nai' },
    { id: 'prod-ruou-buoi-tan-trieu' }
  ];
}

export default function Page() {
  return <ProductDetailPageClient />;
}
