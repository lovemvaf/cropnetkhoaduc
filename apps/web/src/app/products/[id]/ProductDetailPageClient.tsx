'use client';

import React, { useEffect, useState } from 'react';
import { useCartStore } from '@/shared/stores/cart';
import { Container, Card } from '@cropnet/ui';
import { formatVND } from '@cropnet/utils';
import { ShoppingCart, QrCode, Leaf, ShieldCheck, Truck, ChevronRight } from 'lucide-react';
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

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/products/${id}`);
        if (res.data.success) {
          const prodData = res.data.data;
          setProduct(prodData);

          // Auto-select first variant if available
          if (prodData.variants && Array.isArray(prodData.variants) && prodData.variants.length > 0) {
            setSelectedVariant(prodData.variants[0]);
          }

          // Fetch related products (same category)
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
        // Mock data fallback with authentic Dong Nai agricultural products
        const allMockProducts = [
          {
            id: '1',
            name: 'Bưởi Đường Lá Cam Tân Triều (OCOP 4 Sao)',
            price: 85000,
            unit: 'quả (1.1kg - 1.3kg)',
            description: 'Bưởi đường lá cam trứ danh cù lao Tân Triều, da vàng xanh mỏng dính, tép bưởi mọng nước ngọt thanh đậm đà, không the đắng. Trồng theo quy chuẩn sinh thái và đạt OCOP 4 sao.',
            categoryId: 'cat-fruits',
            tags: ['OCOP', 'Bưởi Tân Triều', 'VietGAP', 'Đặc sản Đồng Nai'],
            farmName: 'Hợp Tác Xã Nông Nghiệp Dịch Vụ Tân Triều',
            address: 'Xã Tân Bình, Vĩnh Cửu, Thành phố Đồng Nai',
            imageUrl: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&auto=format',
            images: [
              { url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&auto=format' }
            ],
            variants: [
              { name: 'Quả tiêu chuẩn (1.1kg - 1.3kg)', price: 85000 },
              { name: 'Quả tuyển chọn VIP (1.4kg - 1.6kg)', price: 110000 },
              { name: 'Cặp quả biếu Tết Tân Triều', price: 195000 }
            ],
            batches: [
              { id: 'batch-buoi-tantrieu-01', batchCode: 'BATCH-BUOI-TANTRIEU-2026-01', harvestDate: new Date('2026-10-10'), farmingArea: 'Vườn mẫu A1 - Xã Tân Bình, Vĩnh Cửu, TP Đồng Nai', farmingProcess: 'Canh tác sinh thái VietGAP, nước ngọt phù sa sông Đồng Nai bồi đắp, bao trái an toàn vi sinh.' }
            ]
          },
          {
            id: '2',
            name: 'Bưởi Da Xanh Tân Triều Hữu Cơ',
            price: 75000,
            unit: 'quả (1.3kg - 1.5kg)',
            description: 'Bưởi da xanh ruột hồng giòn ngọt, vỏ xanh bóng, ít hạt, canh tác theo quy chuẩn an toàn sinh thái tại Vĩnh Cửu, vị ngọt đậm thơm mát.',
            categoryId: 'cat-fruits',
            tags: ['VietGAP', 'Bưởi Tân Triều', 'Hữu cơ'],
            farmName: 'Hợp Tác Xã Nông Nghiệp Dịch Vụ Tân Triều',
            address: 'Xã Tân Bình, Vĩnh Cửu, Thành phố Đồng Nai',
            imageUrl: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&auto=format',
            images: [
              { url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&auto=format' }
            ],
            variants: [
              { name: 'Quả vừa (1.3kg)', price: 75000 },
              { name: 'Quả lớn chọn lọc (1.5kg+)', price: 95000 }
            ],
            batches: [
              { id: 'batch-buoi-tantrieu-01', batchCode: 'BATCH-BUOI-TANTRIEU-2026-01', harvestDate: new Date('2026-10-10'), farmingArea: 'Khu bưởi da xanh sinh thái Tân Triều', farmingProcess: 'Bón phân hữu cơ vi sinh, không thuốc diệt cỏ' }
            ]
          },
          {
            id: '3',
            name: 'Sầu Riêng Ri6 Long Khánh (Chín Cây Tự Nhiên)',
            price: 135000,
            unit: 'kg (quả 2.5kg - 3.5kg)',
            description: 'Sầu riêng Ri6 đất đỏ bazan Long Khánh thu hoạch già đủ ngày, chín tự nhiên không nhúng thuốc kích chín. Cơm vàng óng, dẻo béo ngậy, hạt lép đậm đà.',
            categoryId: 'cat-fruits',
            tags: ['VietGAP', 'Sầu riêng Long Khánh', 'Chín tự nhiên'],
            farmName: 'Hợp Tác Xã Nông Nghiệp Sinh Thái Long Khánh',
            address: 'Phường Xuân Lập, Thành phố Long Khánh, Thành phố Đồng Nai',
            imageUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df53f7ec?w=800&auto=format',
            images: [
              { url: 'https://images.unsplash.com/photo-1589330694653-ded6df53f7ec?w=800&auto=format' }
            ],
            variants: [
              { name: 'Quả nguyên trái chín cây (2.5kg - 3.0kg)', price: 337500 },
              { name: 'Hộp cơm sầu bóc sẵn hút chân không 500g', price: 185000 }
            ],
            batches: [
              { id: 'batch-saurieng-longkhanh-01', batchCode: 'BATCH-SAURIENG-LONGKHANH-2026-01', harvestDate: new Date('2026-10-12'), farmingArea: 'Vườn sầu riêng mẫu B2 - Phường Xuân Lập, TP Long Khánh, TP Đồng Nai', farmingProcess: 'Đất đỏ bazan màu mỡ, bón phân trùn quế vi sinh, neo trái già tự rụng' }
            ]
          },
          {
            id: '4',
            name: 'Chôm Chôm Nhãn Long Khánh',
            price: 45000,
            unit: 'kg (chùm quả tươi)',
            description: 'Chôm chôm nhãn đặc sản Long Khánh vỏ vàng ửng đỏ, cùi dày giòn tróc hạt, vị ngọt thanh mát, hái tươi trong ngày từ các nhà vườn đất đỏ bazan.',
            categoryId: 'cat-fruits',
            tags: ['Đặc sản Long Khánh', 'Đang mùa vụ'],
            farmName: 'Hợp Tác Xã Nông Nghiệp Sinh Thái Long Khánh',
            address: 'Phường Xuân Lập, Thành phố Long Khánh, Thành phố Đồng Nai',
            imageUrl: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800&auto=format',
            images: [
              { url: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800&auto=format' }
            ],
            variants: [
              { name: 'Chùm tươi 1kg', price: 45000 },
              { name: 'Thùng quà 5kg tuyển chọn', price: 210000 }
            ],
            batches: [
              { id: 'batch-chomchom-longkhanh-01', batchCode: 'BATCH-CHOMCHOM-LONGKHANH-2026-01', harvestDate: new Date('2026-10-11'), farmingArea: 'Vườn chôm chôm hữu cơ Xuân Lập, Long Khánh', farmingProcess: 'Tưới nước suối ngầm tự nhiên, bón phân hữu cơ vi sinh' }
            ]
          },
          {
            id: '5',
            name: 'Hạt Điều Rang Muối Vỏ Lụa Đồng Nai (Hộp 500g)',
            price: 120000,
            unit: 'hộp 500g',
            description: 'Hạt điều Đồng Nai loại A tuyển chọn xuất khẩu, hạt to mẩy đều, rang củi thủ công cùng muối tinh giữ nguyên lớp vỏ lụa thơm bùi giòn rụm.',
            categoryId: 'cat-processed',
            tags: ['OCOP', 'Hạt điều Đồng Nai', 'Chế biến sạch'],
            farmName: 'Hợp Tác Xã Nông Nghiệp Sinh Thái Long Khánh',
            address: 'Huyện Xuân Lộc / TP Long Khánh, Thành phố Đồng Nai',
            imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format',
            images: [
              { url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format' }
            ],
            variants: [
              { name: 'Hộp 500g tròn hút chân không', price: 120000 },
              { name: 'Combo 2 hộp (1kg) quà tặng', price: 230000 }
            ],
            batches: [
              { id: 'batch-hatdieu-dongnai-01', batchCode: 'BATCH-HATDIEU-DONGNAI-2026-01', harvestDate: new Date('2026-10-05'), farmingArea: 'Xưởng chế biến Nông sản Đồng Nai - Xuân Lộc, TP Đồng Nai', farmingProcess: 'Chế biến nhiệt củi truyền thống, đạt tiêu chuẩn HACCP và OCOP' }
            ]
          },
          {
            id: '6',
            name: 'Rượu Bưởi Tân Triều Truyền Thống (Bình Gốm 750ml)',
            price: 195000,
            unit: 'bình gốm 750ml',
            description: 'Đặc sản trứ danh lên men tự nhiên từ nước cốt bưởi đường lá cam Tân Triều và men thảo mộc cổ truyền, hương vị êm dịu, vị ngọt hậu thanh tao.',
            categoryId: 'cat-processed',
            tags: ['OCOP', 'Quà biếu tặng', 'Rượu bưởi Tân Triều'],
            farmName: 'Hợp Tác Xã Nông Nghiệp Dịch Vụ Tân Triều',
            address: 'Xã Tân Bình, Vĩnh Cửu, Thành phố Đồng Nai',
            imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format',
            images: [
              { url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format' }
            ],
            variants: [
              { name: 'Bình gốm hoa văn thổ cẩm 750ml (15% vol)', price: 195000 },
              { name: 'Cặp bình quà biếu hộp gỗ sang trọng', price: 420000 }
            ],
            batches: [
              { id: 'batch-ruoubuoi-tantrieu-01', batchCode: 'BATCH-RUOUBUOI-TANTRIEU-2026-01', harvestDate: new Date('2026-09-20'), farmingArea: 'Cơ sở ủ rượu truyền thống làng bưởi Tân Triều, Vĩnh Cửu', farmingProcess: 'Lên men tự nhiên từ tép bưởi đường lá cam và gạo nếp cái hoa vàng trong vò sành 6 tháng' }
            ]
          }
        ];

        const matchedProduct = allMockProducts.find(p => p.id === id) || allMockProducts[0];
        setProduct(matchedProduct);
        if (matchedProduct.variants && matchedProduct.variants.length > 0) {
          setSelectedVariant(matchedProduct.variants[0]);
        } else {
          setSelectedVariant(null);
        }

        // Mock related products
        const related = allMockProducts.filter(p => p.id !== matchedProduct.id && p.categoryId === matchedProduct.categoryId);
        const finalRelated = related.length > 0 ? related : allMockProducts.filter(p => p.id !== matchedProduct.id);

        setRelatedProducts(finalRelated.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          unit: p.unit,
          farmName: p.farmName,
          imageUrl: p.images?.[0]?.url || p.imageUrl
        })));
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndRelated();
  }, [id]);

  if (loading) {
    return (
      <Container className="py-12 animate-pulse space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="h-96 bg-gray-100 rounded-3xl"></div>
          <div className="space-y-4">
            <div className="h-6 bg-gray-100 rounded w-1/4"></div>
            <div className="h-10 bg-gray-100 rounded w-3/4"></div>
            <div className="h-8 bg-gray-100 rounded w-1/3"></div>
            <div className="h-24 bg-gray-100 rounded"></div>
          </div>
        </div>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-20 text-center text-gray-500">
        Không tìm thấy nông sản.
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
    alert(`Đã thêm ${finalName} vào giỏ hàng thành công!`);
  };

  const imagesList = product.images && product.images.length > 0 
    ? product.images 
    : [{ url: product.imageUrl || 'https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?w=800&auto=format' }];

  return (
    <Container className="py-12 space-y-16">
      {/* Product Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square sm:aspect-[4/3] rounded-3xl overflow-hidden shadow-sm bg-gray-50 border border-gray-100">
            <img
              src={getAssetPath(imagesList[activeImageIndex]?.url)}
              alt={product.name}
              className="object-cover w-full h-full transition-all duration-300"
            />
          </div>
          {/* Thumbnails */}
          {imagesList.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {imagesList.map((img: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    activeImageIndex === idx ? 'border-primary-500 scale-95 shadow-sm' : 'border-gray-100 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={getAssetPath(img.url)} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary-500 uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full">
              {product.supplier?.farmName || product.farmName}
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">{product.name}</h1>
            <p className="text-xs text-gray-400">Xuất xứ: {product.supplier?.address || product.address}</p>
          </div>

          {/* Pricing area */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-3xl font-black text-primary-500">
                {formatVND(selectedVariant ? Number(selectedVariant.price) : Number(product.price))}
              </span>
              <span className="text-sm font-normal text-gray-400"> / {product.unit}</span>
            </div>
            <div className="text-right text-xs text-gray-500">
              Tồn kho: <span className="font-bold text-gray-900">{product.stock} {product.unit}</span>
            </div>
          </div>

          {/* Tag badges */}
          {product.tags && Array.isArray(product.tags) && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs text-gray-400 font-bold mr-1">Nhãn:</span>
              {product.tags.map((tag: string) => (
                <span key={tag} className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-xl">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Variant Selector */}
          {product.variants && Array.isArray(product.variants) && product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-gray-400">Lựa chọn đóng gói / Quy cách</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {product.variants.map((v: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedVariant(v)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedVariant?.name === v.name
                        ? 'bg-primary-55 border-primary-500 ring-2 ring-primary-100'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="text-xs font-bold text-gray-900">{v.name}</p>
                    <p className="text-xs font-black text-primary-500 mt-1">{formatVND(Number(v.price))}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="text-gray-500 leading-relaxed text-sm">{product.description}</p>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-3 gap-4 border-y border-gray-100 py-4 text-center">
            <div className="flex flex-col items-center gap-1">
              <Leaf className="w-5 h-5 text-primary-500" />
              <span className="text-[10px] font-bold text-gray-600">100% Hữu cơ</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="w-5 h-5 text-primary-500" />
              <span className="text-[10px] font-bold text-gray-600">VietGAP Đạt chuẩn</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Truck className="w-5 h-5 text-primary-500" />
              <span className="text-[10px] font-bold text-gray-600">D2C Giao siêu tốc</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={handleAddToCart} className="flex-grow bg-primary-500 text-white py-4 rounded-2xl font-bold hover:bg-primary-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20">
              <ShoppingCart className="w-5 h-5" />
              <span>Thêm vào giỏ hàng</span>
            </button>
          </div>
        </div>
      </div>

      {/* Traceability Batches History */}
      {product.batches && Array.isArray(product.batches) && product.batches.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary-500" />
            Lịch sử lô hàng thu hoạch và truy xuất nguồn gốc
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.batches.map((b: any) => (
              <Card key={b.id} className="p-5 flex justify-between items-center bg-gray-50 border border-gray-150 rounded-2xl">
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gray-900 text-base">{b.batchCode}</span>
                    <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded">Đã kiểm nghiệm</span>
                  </div>
                  <p className="text-gray-500 text-xs">Vùng canh tác: <span className="font-semibold text-gray-700">{b.farmingArea}</span></p>
                  <p className="text-gray-400 text-xs">Thu hoạch: {new Date(b.harvestDate).toLocaleDateString('vi-VN')}</p>
                </div>
                <Link
                  href={`/traceability/${b.batchCode}`}
                  className="bg-white border border-gray-200 text-gray-700 text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1"
                >
                  <span>Xem nguồn gốc</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-primary-500" />
            Nông sản liên quan cùng chuyên mục
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={Number(p.price)}
                unit={p.unit}
                farmName={p.supplier?.farmName || p.farmName}
                imageUrl={p.images?.[0]?.url || p.imageUrl}
              />
            ))}
          </div>
        </div>
      )}
    </Container>
  );
}
