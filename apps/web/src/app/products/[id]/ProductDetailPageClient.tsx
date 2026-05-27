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
        // Mock data fallback
        const allMockProducts = [
          {
            id: '1',
            name: 'Bưởi Da Xanh Cái Mơn',
            price: 65000,
            unit: 'quả 1.2kg',
            description: 'Bưởi da xanh ngon ngọt đậm đà, vỏ mỏng ruột hồng tiêu biểu của vương quốc trái cây Cái Mơn, thu hoạch trực tiếp tại vườn Cái Mơn đạt chuẩn VietGAP. Quy trình thu hoạch thủ công và kiểm định an toàn thực phẩm nghiêm ngặt.',
            categoryId: 'cat-fruits',
            tags: ['VietGAP', 'Đặc sản', 'Bến Tre'],
            farmName: 'Hợp Tác Xã Trái Cây Sạch Cái Mơn',
            address: 'Huyện Chợ Lách, Tỉnh Bến Tre',
            imageUrl: '/buoi-da-xanh-cai-mon.jpg',
            images: [
              { url: '/buoi-da-xanh-cai-mon.jpg' }
            ],
            variants: [
              { name: 'Quả vừa (1.2kg)', price: 65000 },
              { name: 'Quả to VIP (1.5kg)', price: 95000 },
              { name: 'Combo 3 Quả (3.6kg)', price: 180000 }
            ],
            batches: [
              { id: 'mock-batch-1', batchCode: 'BATCH-BUOI-CAIMON-01', harvestDate: new Date(), farmingArea: 'Phân khu A3', farmingProcess: 'Tưới sông Hàm Luông, phân hữu cơ Cái Mơn' }
            ]
          },
          {
            id: '2',
            name: 'Cà Chua Bi Đà Lạt',
            price: 35000,
            unit: 'túi 500g',
            description: 'Cà chua chín mọng thơm mát, giàu vitamin, được trồng trong nhà kính theo quy chuẩn hữu cơ khép kín tại Đà Lạt, đảm bảo không dư lượng thuốc bảo vệ thực vật.',
            categoryId: 'cat-veggies',
            tags: ['Hữu cơ', 'Đà Lạt'],
            farmName: 'Dalat Bio Farm',
            address: 'Đường Hồ Xuân Hương, Phường 9, TP. Đà Lạt, Tỉnh Lâm Đồng',
            imageUrl: '/cachuabidalat.jpg',
            images: [
              { url: '/cachuabidalat.jpg' }
            ],
            variants: [
              { name: 'Túi 500g', price: 35000 },
              { name: 'Hộp giấy cao cấp 1kg', price: 68000 }
            ],
            batches: [
              { id: 'mock-batch-tomato-1', batchCode: 'BATCH-CACHUA-DALAT-01', harvestDate: new Date(), farmingArea: 'Nhà màng khu B', farmingProcess: 'Hệ thống tưới nhỏ giọt công nghệ Israel' }
            ]
          },
          {
            id: '3',
            name: 'Rau Muống Hữu Cơ',
            price: 15000,
            unit: 'bó 500g',
            description: 'Rau muống non xanh, giòn ngọt, trồng hoàn toàn bằng phương pháp hữu cơ tự nhiên tại Bến Tre, không dùng phân hóa học hay chất kích thích tăng trưởng.',
            categoryId: 'cat-veggies',
            tags: ['Hữu cơ', 'D2C'],
            farmName: 'Vườn Rau Sạch Bến Tre',
            address: 'Huyện Châu Thành, Tỉnh Bến Tre',
            imageUrl: '/rau-muong-huu-co.jpg',
            images: [
              { url: '/rau-muong-huu-co.jpg' }
            ],
            variants: [
              { name: 'Bó 500g', price: 15000 },
              { name: 'Combo 3 Bó (1.5kg)', price: 42000 }
            ],
            batches: [
              { id: 'mock-batch-spinach-1', batchCode: 'BATCH-RAUMUONG-01', harvestDate: new Date(), farmingArea: 'Phân khu C1', farmingProcess: 'Bón phân trùn quế vi sinh tự ủ' }
            ]
          },
          {
            id: '4',
            name: 'Sầu Riêng Ri6 Vĩnh Long',
            price: 145000,
            unit: 'kg (quả 2.5kg)',
            description: 'Sầu riêng Ri6 cơm vàng hạt lép, béo ngậy ngọt ngào đặc sản trứ danh Vĩnh Long, chín tự nhiên không hóa chất nhúng thuốc. Hương vị đậm đà đẳng cấp.',
            categoryId: 'cat-fruits',
            tags: ['VietGAP', 'Đặc sản', 'Vĩnh Long'],
            farmName: 'HTX Sầu Riêng Vĩnh Long',
            address: 'Huyện Long Hồ, Tỉnh Vĩnh Long',
            imageUrl: '/sau-rieng-vinh-long.jpg',
            images: [
              { url: '/sau-rieng-vinh-long.jpg' }
            ],
            variants: [
              { name: 'Quả 2.5kg', price: 362500 },
              { name: 'Khay bóc múi sẵn 500g', price: 185000 }
            ],
            batches: [
              { id: 'mock-batch-durian-1', batchCode: 'BATCH-SAURIENG-RI6-01', harvestDate: new Date(), farmingArea: 'Phân khu D1', farmingProcess: 'Bón phân trùn quế, không thuốc trừ sâu sinh học' }
            ]
          },
          {
            id: '5',
            name: 'Xoài Cát Hòa Lộc',
            price: 85000,
            unit: 'kg (2 quả)',
            description: 'Xoài cát Hòa Lộc Tiền Giang quả to thuôn dài, khi chín vàng tươi, thịt xoài cát mịn màng ngọt lịm và thơm lừng.',
            categoryId: 'cat-fruits',
            tags: ['VietGAP', 'Đặc sản', 'Tiền Giang'],
            farmName: 'HTX Xoài Cát Hòa Lộc',
            address: 'Huyện Cái Bè, Tỉnh Tiền Giang',
            imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format',
            images: [
              { url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format' }
            ],
            variants: [
              { name: 'Hộp 2 quả (1kg)', price: 85000 },
              { name: 'Hộp VIP làm quà 3kg', price: 270000 }
            ],
            batches: [
              { id: 'mock-batch-mango-1', batchCode: 'BATCH-XOAICAT-HOALOC-01', harvestDate: new Date(), farmingArea: 'Khu vực bao quả A2', farmingProcess: 'Bao quả tránh sâu bệnh, bón phân hữu cơ vi sinh' }
            ]
          },
          {
            id: '6',
            name: 'Bơ Sáp 034 Tây Nguyên',
            price: 55000,
            unit: 'túi 1kg',
            description: "Bơ sáp 034 dáng dài đặc trưng Tây Nguyên, cơm vàng dẻo quánh, vị ngậy béo tự nhiên, vỏ xanh bóng đẹp mắt, thích hợp cho cả gia đình ăn dặm hoặc làm sinh tố.",
            categoryId: 'cat-fruits',
            tags: ['VietGAP', 'Đặc sản', 'Đắk Lắk'],
            farmName: 'Vườn Bơ Sáp Đắk Lắk',
            address: "Huyện Cư M'gar, Tỉnh Đắk Lắk",
            imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&auto=format',
            images: [
              { url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&auto=format' }
            ],
            variants: [
              { name: 'Túi 1kg (3-4 quả)', price: 55000 },
              { name: 'Túi VIP 2kg (được chọn quả)', price: 105000 }
            ],
            batches: [
              { id: 'mock-batch-avocado-1', batchCode: 'BATCH-BOSAP-034-01', harvestDate: new Date(), farmingArea: 'Đồi bơ phân khu B3', farmingProcess: 'Tưới nước tưới tự động, bón phân compost tự nhiên' }
            ]
          },
          {
            id: '7',
            name: 'Nấm Đùi Gà Hữu Cơ',
            price: 45000,
            unit: 'hộp 300g',
            description: 'Nấm đùi gà thân trắng ngần, chắc thịt, giòn ngọt giàu dinh dưỡng trồng phòng lạnh khép kín tại Lâm Đồng. Đảm bảo an toàn sinh học tuyệt đối.',
            categoryId: 'cat-veggies',
            tags: ['Hữu cơ', 'Lâm Đồng'],
            farmName: 'Lâm Đồng Organics',
            address: 'Đức Trọng, Tỉnh Lâm Đồng',
            imageUrl: '/nam-dui-ga.jpg',
            images: [
              { url: '/nam-dui-ga.jpg' }
            ],
            variants: [
              { name: 'Hộp 300g', price: 45000 },
              { name: 'Combo 2 Hộp (600g)', price: 85000 }
            ],
            batches: [
              { id: 'mock-batch-mushroom-1', batchCode: 'BATCH-NAMDUIGA-HUYEN-01', harvestDate: new Date(), farmingArea: 'Phòng lạnh nuôi cấy nấm số 4', farmingProcess: 'Kiểm soát nhiệt độ 18 độ C, độ ẩm 85%, sử dụng mùn cưa hữu cơ tiệt trùng' }
            ]
          },
          {
            id: '8',
            name: 'Măng Tây Xanh Loại 1',
            price: 85000,
            unit: 'bó 500g',
            description: 'Măng tây xanh Ninh Thuận loại 1 thân mập non tơ giòn ngọt, giàu chất xơ và khoáng chất tốt cho sức khỏe. Thích hợp cho các món xào, luộc hoặc nướng.',
            categoryId: 'cat-veggies',
            tags: ['VietGAP', 'Đặc sản', 'Ninh Thuận'],
            farmName: 'HTX Măng Tây Ninh Thuận',
            address: 'Huyện Ninh Phước, Tỉnh Ninh Thuận',
            imageUrl: '/mang-tay-xanh.jpg',
            images: [
              { url: '/mang-tay-xanh.jpg' }
            ],
            variants: [
              { name: 'Bó 500g loại mập', price: 85000 },
              { name: 'Bó 1kg', price: 160000 }
            ],
            batches: [
              { id: 'mock-batch-asparagus-1', batchCode: 'BATCH-MANGTAY-NINHTHUAN-01', harvestDate: new Date(), farmingArea: 'Cánh đồng cát Ninh Phước', farmingProcess: 'Tưới nhỏ giọt tiết kiệm nước, bón phân phân bò hoai mục sinh học' }
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
          imageUrl: p.imageUrl
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
              src={imagesList[activeImageIndex]?.url}
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
                  <img src={img.url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
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
