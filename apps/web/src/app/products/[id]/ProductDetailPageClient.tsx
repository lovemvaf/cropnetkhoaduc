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
            unit: 'quả (1.1kg - 1.3kg)',
            description: 'Bưởi đường lá cam trứ danh Cù lao Tân Triều, vỏ mỏng vàng ươm khi chín, tép bưởi mọng nước ngọt thanh dịu mát, không the đắng. Canh tác kết hợp hữu cơ vi sinh bồi đắp phù sa sông Đồng Nai theo quy chuẩn VietGAP.',
            categoryId: 'cat-fruits',
            tags: ['OCOP 4 Sao', 'Bưởi Tân Triều', 'VietGAP', 'Đặc sản Đồng Nai', 'Chỉ dẫn địa lý'],
            farmName: 'Hợp Tác Xã Nông Nghiệp Dịch Vụ Tân Triều',
            address: 'Ấp Vĩnh Hiệp, Xã Tân Bình (Cù lao Tân Triều), Huyện Vĩnh Cửu, Thành phố Đồng Nai',
            imageUrl: '/assets/nongsan/buoi-duong-la-cam.jpg',
            images: [
              { url: '/assets/nongsan/buoi-duong-la-cam.jpg' },
              { url: '/assets/nongsan/buoi-da-xanh-tantrieu.jpg' }
            ],
            variants: [
              { name: 'Quả tiêu chuẩn (1.1kg - 1.3kg)', price: 85000 },
              { name: 'Quả chọn VIP (1.4kg+)', price: 110000 },
              { name: 'Cặp quả biếu quà Tân Triều', price: 195000 }
            ],
            batches: [
              { id: 'batch-buoi-tantrieu-01', batchCode: 'BATCH-BUOI-TANTRIEU-2026-01', harvestDate: new Date('2026-10-10'), farmingArea: 'Vườn mẫu liếp 04 - HTX Tân Triều, Xã Tân Bình, Vĩnh Cửu, TP Đồng Nai', farmingProcess: 'Canh tác sinh thái kết hợp VietGAP, tưới nước phù sa sông Đồng Nai, bao trái màng thoáng khí.' }
            ]
          },
          {
            id: '2',
            slug: 'prod-buoi-da-xanh',
            idAlias: ['2', 'prod-buoi-da-xanh', 'prod-buoi-da-xanh-tantrieu'],
            name: 'Bưởi Da Xanh Trồng Tại Vùng Cù Lao Tân Triều',
            price: 75000,
            unit: 'quả (1.3kg - 1.5kg)',
            description: 'Bưởi da xanh ruột hồng giòn mọng, ít hạt, vị ngọt đậm tự nhiên. Đạt tiêu chuẩn an toàn sinh thái của HTX Nông nghiệp Tân Triều.',
            categoryId: 'cat-fruits',
            tags: ['VietGAP', 'Bưởi Tân Triều', 'Sinh thái cù lao'],
            farmName: 'Hợp Tác Xã Nông Nghiệp Dịch Vụ Tân Triều',
            address: 'Ấp Vĩnh Hiệp, Xã Tân Bình, Vĩnh Cửu, Thành phố Đồng Nai',
            imageUrl: '/assets/nongsan/buoi-da-xanh-tantrieu.jpg',
            images: [
              { url: '/assets/nongsan/buoi-da-xanh-tantrieu.jpg' }
            ],
            variants: [
              { name: 'Quả vừa (1.3kg)', price: 75000 },
              { name: 'Quả lớn chọn lọc (1.5kg+)', price: 95000 }
            ],
            batches: [
              { id: 'batch-buoi-tantrieu-01', batchCode: 'BATCH-BUOI-TANTRIEU-2026-01', harvestDate: new Date('2026-10-10'), farmingArea: 'Khu bưởi da xanh sinh thái Tân Triều, Vĩnh Cửu', farmingProcess: 'Bón phân hữu cơ vi sinh, tưới tiêu nước sông Đồng Nai' }
            ]
          },
          {
            id: '3',
            slug: 'prod-saurieng-ri6-longkhanh',
            idAlias: ['3', 'prod-saurieng-ri6-longkhanh'],
            name: 'Sầu Riêng Ri6 Long Khánh (Chín Cây Tự Nhiên)',
            price: 135000,
            unit: 'kg (quả 2.5kg - 3.5kg)',
            description: 'Sầu riêng Ri6 trồng trên đất đỏ bazan Long Khánh, cơm vàng hạt lép giòn mịn béo bùi. Cam kết neo cuống chín cây tự nhiên 100%, tuyệt đối không ngâm hóa chất ép chín.',
            categoryId: 'cat-fruits',
            tags: ['VietGAP', 'Sầu riêng Long Khánh', 'Chín tự nhiên', 'Không nhúng thuốc'],
            farmName: 'Hợp Tác Xã Nông nghiệp - Thương mại - Dịch vụ Xuân Lập',
            address: 'Phường Xuân Lập, Thành phố Long Khánh, Thành phố Đồng Nai',
            imageUrl: '/assets/nongsan/sau-rieng-ri6-longkhanh.jpg',
            images: [
              { url: '/assets/nongsan/sau-rieng-ri6-longkhanh.jpg' }
            ],
            variants: [
              { name: 'Quả nguyên trái chín cây (2.5 - 3.5kg)', price: 135000 },
              { name: 'Khay bóc múi hút chân không (500g)', price: 180000 }
            ],
            batches: [
              { id: 'batch-saurieng-longkhanh-01', batchCode: 'BATCH-SAURIENG-LONGKHANH-2026-01', harvestDate: new Date('2026-10-12'), farmingArea: 'Vườn mẫu B2 - Phường Xuân Lập, TP Long Khánh, TP Đồng Nai', farmingProcess: 'Canh tác trên đất đỏ bazan, bón phân hữu cơ trùn quế, không ngâm thuốc kích chín.' }
            ]
          },
          {
            id: '4',
            slug: 'prod-chom-chom-nhan',
            idAlias: ['4', 'prod-chom-chom-nhan', 'prod-chom-chom-nhan-longkhanh'],
            name: 'Chôm Chôm Nhãn Long Khánh Giòn Ngọt',
            price: 45000,
            unit: 'kg (chùm quả tươi)',
            description: 'Chôm chôm nhãn trái nhỏ vỏ vàng đỏ, gai ngắn, cùi dày giòn tróc hạt, vị ngọt lịm đặc trưng. Đạt Chỉ dẫn địa lý Chôm chôm Long Khánh số 00080 của Cục Sở hữu trí tuệ.',
            categoryId: 'cat-fruits',
            tags: ['Chỉ dẫn địa lý 00080', 'Chôm chôm Long Khánh', 'Bình Lộc', 'VietGAP'],
            farmName: 'Hợp Tác Xã Nông nghiệp - Dịch vụ - Thương mại Bình Lộc',
            address: 'Ấp 2, Xã Bình Lộc, Thành phố Long Khánh, Thành phố Đồng Nai',
            imageUrl: '/assets/nongsan/chom-chom-nhan-longkhanh.jpg',
            images: [
              { url: '/assets/nongsan/chom-chom-nhan-longkhanh.jpg' }
            ],
            variants: [
              { name: 'Túi 1kg chùm tươi hái trong ngày', price: 45000 },
              { name: 'Rổ quà 3kg đóng hộp', price: 130000 }
            ],
            batches: [
              { id: 'batch-chomchom-binhloc-01', batchCode: 'BATCH-CHOMCHOM-BINHLOC-2026-01', harvestDate: new Date('2026-10-11'), farmingArea: 'Vườn sinh thái Ấp 2, Xã Bình Lộc, TP Long Khánh, TP Đồng Nai', farmingProcess: 'Thu hái tươi bằng tay, tưới tiêu vi sinh, đạt tiêu chuẩn kiểm nghiệm vi sinh TCVN.' }
            ]
          },
          {
            id: '5',
            slug: 'prod-hat-dieu-rang-cui',
            idAlias: ['5', 'prod-hat-dieu-rang-cui'],
            name: 'Hạt Điều Rang Củi Vỏ Lụa Đồng Nai',
            price: 140000,
            unit: 'hộp 500g',
            description: 'Hạt điều rang củi thủ công giữ nguyên vỏ lụa từ vùng nguyên liệu Định Quán và Đông Nam Bộ, giòn bùi béo tự nhiên, đạt tiêu chuẩn quốc tế HACCP Codex.',
            categoryId: 'cat-processed',
            tags: ['HACCP', 'Hạt điều Đồng Nai', 'Rang củi vỏ lụa', 'Định Quán'],
            farmName: 'Cơ Sở Chế Biến Nông Sản Sạch Định Quán',
            address: 'Huyện Định Quán, Thành phố Đồng Nai',
            imageUrl: '/assets/nongsan/hat-dieu-rang-cui.jpg',
            images: [
              { url: '/assets/nongsan/hat-dieu-rang-cui.jpg' }
            ],
            variants: [
              { name: 'Hộp tròn 500g', price: 140000 },
              { name: 'Hút chân không 500g', price: 135000 }
            ],
            batches: [
              { id: 'batch-hatdieu-01', batchCode: 'BATCH-HATDIEU-DONGNAI-2026-01', harvestDate: new Date('2026-10-08'), farmingArea: 'Phân xưởng chế biến nông sản sạch Định Quán, TP Đồng Nai', farmingProcess: 'Phân loại chuẩn W240, rang than củi tự nhiên, đóng gói vô trùng.' }
            ]
          },
          {
            id: '6',
            slug: 'prod-ruou-buoi-tan-trieu',
            idAlias: ['6', 'prod-ruou-buoi-tan-trieu'],
            name: 'Rượu Bưởi Truyền Thống Năm Huệ Tân Triều',
            price: 195000,
            unit: 'bình gốm 750ml',
            description: 'Rượu lên men tự nhiên từ nước cốt bưởi đường lá cam cù lao Tân Triều và men gạo nếp truyền thống. Đựng trong bình gốm mỹ nghệ Biên Hòa đặc trưng, đạt OCOP 3 sao.',
            categoryId: 'cat-processed',
            tags: ['OCOP 3 Sao', 'Quà biếu tặng', 'Rượu bưởi Tân Triều'],
            farmName: 'Cơ Sở Rượu Bưởi Truyền Thống Năm Huệ Tân Triều',
            address: 'Cù lao Tân Triều, Xã Tân Bình, Vĩnh Cửu, Thành phố Đồng Nai',
            imageUrl: '/assets/nongsan/ruou-buoi-nam-hue.jpg',
            images: [
              { url: '/assets/nongsan/ruou-buoi-nam-hue.jpg' }
            ],
            variants: [
              { name: 'Bình gốm trái bưởi 750ml', price: 195000 }
            ],
            batches: []
          },
          {
            id: '7',
            slug: 'prod-tieu-den-xuanloc',
            idAlias: ['7', 'prod-tieu-den-xuanloc'],
            name: 'Tiêu Đen Chân Núi Chứa Chan Xuân Lộc',
            price: 90000,
            unit: 'hũ 250g',
            description: 'Hạt tiêu đen cay nồng thơm đượm từ vùng chuyên canh hồ tiêu đồi đá bazan chân núi Chứa Chan Xuân Lộc, phơi sấy tự nhiên trên bạt sạch.',
            categoryId: 'cat-spices',
            tags: ['Tiêu Xuân Lộc', 'Núi Chứa Chan', 'Gia vị sạch'],
            farmName: 'Tổ Hợp Tác Nông Nghiệp Núi Chứa Chan Xuân Lộc',
            address: 'Chân núi Chứa Chan, Huyện Xuân Lộc, Thành phố Đồng Nai',
            imageUrl: '/assets/nongsan/tieu-den-xuanloc.jpg',
            images: [
              { url: '/assets/nongsan/tieu-den-xuanloc.jpg' }
            ],
            variants: [
              { name: 'Hũ thủy tinh 250g', price: 90000 }
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
    : [{ url: product.imageUrl || '/assets/nongsan/placeholder-nongsan.svg' }];

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
                src={getAssetPath(imagesList[activeImageIndex]?.url) || '/assets/nongsan/placeholder-nongsan.svg'}
                alt={product.name}
                className="object-cover w-full h-full"
                onError={(e) => {
                  e.currentTarget.src = '/assets/nongsan/placeholder-nongsan.svg';
                }}
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
