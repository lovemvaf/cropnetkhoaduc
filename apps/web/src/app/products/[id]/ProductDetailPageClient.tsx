'use client';

import React, { useEffect, useState } from 'react';
import { useCartStore } from '@/shared/stores/cart';
import { Container } from '@cropnet/ui';
import { formatVND } from '@cropnet/utils';
import { ShoppingCart, QrCode, MapPin, ChevronRight, Check } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiClient } from '@/shared/services/api';
import ProductCard from '@/features/products/components/ProductCard';
import { getAssetPath } from '@/shared/utils/path';

export default function ProductDetailPageClient() {
  const { id } = useParams();
  const addItem = useCartStore((state) => state.addItem);
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/products/${id}`);
        if (res.data.success) {
          const prodData = res.data.data;
          setProduct(prodData);

          if (prodData.variants && Array.isArray(prodData.variants) && prodData.variants.length > 0) {
            setSelectedVariant(prodData.variants[0]);
          }

          try {
            const relRes = await apiClient.get('/products', {
              params: { categoryId: prodData.categoryId, limit: 4 }
            });
            if (relRes.data.success) {
              const list = relRes.data.data.products || relRes.data.data;
              setRelatedProducts(list.filter((p: any) => p.id !== prodData.id));
            }
          } catch (err) {
            console.warn('Failed to load related products:', err);
          }
        }
      } catch (err) {
        console.warn('Failed to load product details, using offline backup:', err);
        const allMockProducts = [
          {
            id: '1',
            slug: 'prod-buoi-duong-la-cam',
            idAlias: ['1', 'prod-buoi-duong-la-cam'],
            name: 'Bưởi Đường Lá Cam Tân Triều (OCOP 4 Sao)',
            price: 85000,
            unit: 'quả (1.2kg - 1.4kg)',
            description: 'Bưởi đường lá cam trứ danh cù lao Tân Triều, vỏ mỏng vàng ươm khi chín, tép bưởi mọng nước ngọt thanh dịu mát, không the đắng. Canh tác kết hợp hữu cơ vi sinh bồi đắp phù sa sông Đồng Nai.',
            categoryId: 'cat-fruits',
            tags: ['OCOP', 'Bưởi Tân Triều', 'VietGAP', 'Đặc sản Đồng Nai'],
            farmName: 'Hợp Tác Xã Nông Nghiệp Dịch Vụ Tân Triều',
            address: 'Phường Tân Triều, Thành phố Đồng Nai (vùng Cù lao Tân Triều lịch sử)',
            imageUrl: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&auto=format',
            images: [
              { url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&auto=format' }
            ],
            variants: [
              { name: 'Quả tiêu chuẩn (1.2kg - 1.4kg)', price: 85000 },
              { name: 'Quả chọn VIP (1.5kg+)', price: 110000 },
              { name: 'Cặp quả biếu quà Tân Triều', price: 195000 }
            ],
            batches: [
              { id: 'batch-buoi-tantrieu-01', batchCode: 'BATCH-BUOI-TANTRIEU-2026-01', harvestDate: new Date('2026-10-10'), farmingArea: 'Vườn mẫu A1 - Phường Tân Triều, TP Đồng Nai', farmingProcess: 'Canh tác sinh thái kết hợp VietGAP, tưới nước phù sa sông Đồng Nai, bao trái màng thoáng khí.' }
            ]
          },
          {
            id: '2',
            slug: 'prod-buoi-da-xanh',
            idAlias: ['2', 'prod-buoi-da-xanh'],
            name: 'Bưởi Da Xanh Tân Triều Hữu Cơ',
            price: 75000,
            unit: 'quả (1.3kg - 1.5kg)',
            description: 'Bưởi da xanh ruột hồng giòn mọng, ít hạt, vị ngọt đậm tự nhiên. Đạt tiêu chuẩn an toàn sinh thái của HTX Nông nghiệp Tân Triều.',
            categoryId: 'cat-fruits',
            tags: ['VietGAP', 'Bưởi Tân Triều', 'Hữu cơ'],
            farmName: 'Hợp Tác Xã Nông Nghiệp Dịch Vụ Tân Triều',
            address: 'Phường Tân Triều, Thành phố Đồng Nai',
            imageUrl: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&auto=format',
            images: [
              { url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&auto=format' }
            ],
            variants: [
              { name: 'Quả vừa (1.3kg)', price: 75000 },
              { name: 'Quả lớn chọn lọc (1.5kg+)', price: 95000 }
            ],
            batches: [
              { id: 'batch-buoi-tantrieu-01', batchCode: 'BATCH-BUOI-TANTRIEU-2026-01', harvestDate: new Date('2026-10-10'), farmingArea: 'Khu bưởi da xanh sinh thái Tân Triều', farmingProcess: 'Bón phân hữu cơ vi sinh, tưới tiêu nước sông Đồng Nai' }
            ]
          },
          {
            id: '3',
            slug: 'prod-saurieng-ri6-longkhanh',
            idAlias: ['3', 'prod-saurieng-ri6-longkhanh'],
            name: 'Sầu Riêng Ri6 Long Khánh (Chín Cây Tự Nhiên)',
            price: 135000,
            unit: 'kg (quả 2.5kg - 3.5kg)',
            description: 'Sầu riêng Ri6 trồng trên đất đỏ bazan Long Khánh, cơm vàng hạt lép giòn mịn béo bùi. Cam kết cắt già hoặc tự rụng, tuyệt đối không ngâm hóa chất ép chín.',
            categoryId: 'cat-fruits',
            tags: ['VietGAP', 'Sầu riêng Long Khánh', 'Chín tự nhiên'],
            farmName: 'Hợp Tác Xã Sinh Thái Long Khánh',
            address: 'Phường Xuân Lập, Thành phố Đồng Nai',
            imageUrl: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=800&auto=format',
            images: [
              { url: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=800&auto=format' }
            ],
            variants: [
              { name: 'Quả nguyên trái chín cây (2.5 - 3.5kg)', price: 135000 },
              { name: 'Khay bóc múi hút chân không (500g)', price: 180000 }
            ],
            batches: [
              { id: 'batch-saurieng-longkhanh-01', batchCode: 'BATCH-SAURIENG-LONGKHANH-2026-01', harvestDate: new Date('2026-10-12'), farmingArea: 'Vườn mẫu B2 - Phường Xuân Lập, TP Đồng Nai', farmingProcess: 'Canh tác trên đất đỏ bazan, bón phân trùn quế, không ngâm thuốc kích chín.' }
            ]
          },
          {
            id: '4',
            slug: 'prod-chom-chom-nhan',
            idAlias: ['4', 'prod-chom-chom-nhan'],
            name: 'Chôm Chôm Nhãn Long Khánh',
            price: 45000,
            unit: 'kg (chùm quả tươi)',
            description: 'Chôm chôm nhãn trái nhỏ vỏ vàng đỏ, gai ngắn, cơm dày róc hạt, vị ngọt thanh giòn rụm.',
            categoryId: 'cat-fruits',
            tags: ['Đặc sản Long Khánh', 'Đang mùa vụ'],
            farmName: 'Hợp Tác Xã Sinh Thái Long Khánh',
            address: 'Phường Xuân Lập, Thành phố Đồng Nai',
            imageUrl: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800&auto=format',
            images: [
              { url: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800&auto=format' }
            ],
            variants: [
              { name: 'Túi 1kg chùm tươi', price: 45000 },
              { name: 'Rổ quà 3kg đóng hộp', price: 130000 }
            ],
            batches: []
          },
          {
            id: '5',
            slug: 'prod-hat-dieu-rang-cui',
            idAlias: ['5', 'prod-hat-dieu-rang-cui'],
            name: 'Hạt Điều Rang Củi Vỏ Lụa Đồng Nai',
            price: 140000,
            unit: 'hộp 500g',
            description: 'Hạt điều Bình Lộc - Long Khánh rang củi truyền thống, giữ trọn độ ngậy béo thơm lừng, còn nguyên vỏ lụa bảo vệ hạt.',
            categoryId: 'cat-processed',
            tags: ['OCOP', 'Hạt điều Đồng Nai', 'Chế biến sạch'],
            farmName: 'HTX Nông Nghiệp Long Khánh',
            address: 'TP Long Khánh, Thành phố Đồng Nai',
            imageUrl: 'https://images.unsplash.com/photo-1563865436874-9aef32095fad?w=800&auto=format',
            images: [
              { url: 'https://images.unsplash.com/photo-1563865436874-9aef32095fad?w=800&auto=format' }
            ],
            variants: [
              { name: 'Hộp tròn 500g', price: 140000 },
              { name: 'Hút chân không 500g', price: 135000 }
            ],
            batches: [
              { id: 'batch-hatdieu-01', batchCode: 'BATCH-HATDIEU-DONGNAI-2026-01', harvestDate: new Date('2026-09-15'), farmingArea: 'Vùng điều xã Bình Lộc, Đồng Nai', farmingProcess: 'Thu hoạch quả chín tự nhiên, tách nhân, rang củi than đước.' }
            ]
          },
          {
            id: '6',
            slug: 'prod-ruou-buoi-tan-trieu',
            idAlias: ['6', 'prod-ruou-buoi-tan-trieu'],
            name: 'Rượu Bưởi Tân Triều Truyền Thống (Bình Gốm 750ml)',
            price: 195000,
            unit: 'bình gốm 750ml',
            description: 'Rượu lên men tự nhiên từ nước cốt bưởi đường lá cam Tân Triều và men gạo nếp truyền thống. Đựng trong bình gốm mỹ nghệ Biên Hòa đặc trưng.',
            categoryId: 'cat-processed',
            tags: ['OCOP', 'Quà biếu tặng', 'Rượu bưởi Tân Triều'],
            farmName: 'HTX Nông Nghiệp Dịch Vụ Tân Triều',
            address: 'Phường Tân Triều, Thành phố Đồng Nai',
            imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format',
            images: [
              { url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format' }
            ],
            variants: [
              { name: 'Bình gốm trái bưởi 750ml', price: 195000 }
            ],
            batches: []
          }
        ];

        const matchedProduct = allMockProducts.find((p: any) => p.id === id || p.slug === id || p.idAlias?.includes(String(id))) || null;
        setProduct(matchedProduct);
        if (matchedProduct) {
          if (matchedProduct.variants && matchedProduct.variants.length > 0) {
            setSelectedVariant(matchedProduct.variants[0]);
          } else {
            setSelectedVariant(null);
          }

          const related = allMockProducts.filter((p: any) => p.id !== matchedProduct.id && p.categoryId === matchedProduct.categoryId);
          const finalRelated = related.length > 0 ? related : allMockProducts.filter((p: any) => p.id !== matchedProduct.id);

          setRelatedProducts(finalRelated.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            unit: p.unit,
            farmName: p.farmName,
            imageUrl: p.images?.[0]?.url || p.imageUrl
          })));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndRelated();
  }, [id]);

  if (loading) {
    return (
      <Container className="py-12 animate-pulse space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="h-96 bg-[#EAECE6] rounded-xl"></div>
          <div className="space-y-4">
            <div className="h-5 bg-[#EAECE6] rounded w-1/4"></div>
            <div className="h-8 bg-[#EAECE6] rounded w-3/4"></div>
            <div className="h-6 bg-[#EAECE6] rounded w-1/3"></div>
            <div className="h-20 bg-[#EAECE6] rounded"></div>
          </div>
        </div>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-20 text-center space-y-4 max-w-md mx-auto">
        <h3 className="text-xl font-bold text-[#253129]">Không Tìm Thấy Sản Phẩm</h3>
        <p className="text-xs sm:text-sm text-[#647067]">
          Mã sản phẩm truy vấn không tồn tại trong danh mục nông sản khảo sát Đồng Nai.
        </p>
        <Link
          href="/products"
          className="inline-block bg-[#2C4939] hover:bg-[#233C2F] text-white text-xs font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          Quay lại danh mục
        </Link>
      </Container>
    );
  }

  const handleAddToCart = () => {
    const finalName = selectedVariant ? `${product.name} (${selectedVariant.name})` : product.name;
    const finalPrice = selectedVariant ? Number(selectedVariant.price) : Number(product.price);
    
    addItem({
      productId: product.id,
      name: finalName,
      price: finalPrice,
      unit: product.unit,
      quantity: 1,
      imageUrl: product.images?.[activeImageIndex]?.url || product.imageUrl
    });
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  const imagesList = product.images && product.images.length > 0 
    ? product.images 
    : [{ url: product.imageUrl || 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&auto=format' }];

  return (
    <div className="bg-[#FAF9F5] min-h-screen py-8 sm:py-12">
      <Container className="space-y-12">
        {/* Editorial Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-[#8C978F]">
          <Link href="/" className="hover:text-[#253129]">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/products" className="hover:text-[#253129]">Nông sản Đồng Nai</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#253129] font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="aspect-square rounded-xl overflow-hidden bg-[#F1EFE8] border border-[#E2E5DC]">
              <img
                src={getAssetPath(imagesList[activeImageIndex]?.url)}
                alt={product.name}
                className="object-cover w-full h-full"
              />
            </div>
            {imagesList.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {imagesList.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border flex-shrink-0 transition-colors ${
                      activeImageIndex === idx ? 'border-[#2C4939]' : 'border-[#E2E5DC] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={getAssetPath(img.url)} alt={`Hình ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Narrative & Controls */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-[#7B876C] font-medium mb-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>{product.supplier?.farmName || product.farmName}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#253129] leading-tight">
                {product.name}
              </h1>
              <p className="text-xs text-[#8C978F] mt-1">
                Xuất xứ: {product.supplier?.address || product.address}
              </p>
            </div>

            {/* Pricing Area */}
            <div className="p-4 rounded-xl bg-[#F1EFE8] border border-[#E2E5DC] flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-[#253129]">
                  {formatVND(selectedVariant ? Number(selectedVariant.price) : Number(product.price))}
                </span>
                <span className="text-xs text-[#647067]"> / {product.unit}</span>
              </div>
              <div className="text-xs text-[#647067]">
                Giá niêm yết tại vườn
              </div>
            </div>

            {/* Packaging / Variants */}
            {product.variants && Array.isArray(product.variants) && product.variants.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#647067]">Quy cách lựa chọn</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.variants.map((v: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedVariant(v)}
                      className={`p-3 rounded-lg border text-left text-xs transition-colors ${
                        selectedVariant?.name === v.name
                          ? 'bg-[#E6EAE4] border-[#2C4939] text-[#2C4939] font-medium'
                          : 'bg-white border-[#E2E5DC] text-[#253129] hover:border-[#CBD0C4]'
                      }`}
                    >
                      <div className="font-medium">{v.name}</div>
                      <div className="text-[#647067] mt-0.5">{formatVND(Number(v.price))}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#647067]">
                Mô tả đặc sản
              </h3>
              <p className="text-xs sm:text-sm text-[#647067] leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Add to Cart CTA */}
            <div className="pt-2 space-y-2">
              <button
                onClick={handleAddToCart}
                className="w-full bg-[#2C4939] hover:bg-[#233C2F] text-white py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Thêm vào giỏ hàng</span>
              </button>
              {addedNotice && (
                <div className="p-2.5 rounded-lg bg-[#E8F1EC] text-[#245436] text-xs font-medium flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Đã thêm sản phẩm vào giỏ hàng thành công!</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Traceability Batches History */}
        {product.batches && Array.isArray(product.batches) && product.batches.length > 0 && (
          <div className="pt-8 border-t border-[#E2E5DC] space-y-4">
            <h3 className="text-lg font-bold text-[#253129] flex items-center gap-2">
              <QrCode className="w-5 h-5 text-[#7B876C]" />
              <span>Mã lô thu hoạch & Nhật ký nguồn gốc</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.batches.map((b: any) => (
                <div
                  key={b.id}
                  className="p-5 rounded-xl bg-white border border-[#E2E5DC] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-sm text-[#253129]">{b.batchCode}</span>
                      <span className="text-[10px] font-medium bg-[#E6EAE4] text-[#2C4939] px-2 py-0.5 rounded">
                        Lô thu hoạch
                      </span>
                    </div>
                    <p className="text-[#647067]">Khu canh tác: {b.farmingArea}</p>
                    <p className="text-[#8C978F]">Thu hoạch: {new Date(b.harvestDate).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <Link
                    href={`/traceability/${b.batchCode}`}
                    className="bg-[#F1EFE8] hover:bg-[#E7E4DC] text-[#253129] text-xs font-medium px-3.5 py-2 rounded-lg transition-colors inline-flex items-center gap-1 self-start sm:self-center"
                  >
                    <span>Xem nhật ký QR</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#7B876C]" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="pt-8 border-t border-[#E2E5DC] space-y-6">
            <h3 className="text-lg font-bold text-[#253129]">
              Nông sản cùng loại từ nhà vườn Đồng Nai
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  price={Number(p.price)}
                  unit={p.unit}
                  farmName={p.farmName}
                  imageUrl={p.imageUrl}
                />
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
