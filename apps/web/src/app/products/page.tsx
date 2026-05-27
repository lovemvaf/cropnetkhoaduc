'use client';

import React, { useState, useEffect } from 'react';
import { Container, Card } from '@cropnet/ui';
import ProductCard from '@/features/products/components/ProductCard';
import { apiClient } from '@/shared/services/api';
import { formatVND } from '@cropnet/utils';
import { Search, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import Link from 'next/link';
import { getAssetPath } from '@/shared/utils/path';


export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sort, setSort] = useState('newest');

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 6; // smaller limit for easier pagination demonstration

  // Mock agricultural tags for search filter
  const availableTags = ['VietGAP', 'Hữu cơ', 'D2C', 'Đặc sản', 'Bến Tre', 'Đà Lạt'];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiClient.get('/categories');
        if (res.data.success) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.warn('Failed to load categories, using fallback:', err);
        setCategories([
          { id: 'cat-fruits', name: 'Trái Cây Sạch', slug: 'trai-cay-sach' },
          { id: 'cat-veggies', name: 'Rau Củ Hữu Cơ', slug: 'rau-cu-huu-co' }
        ]);
      }
    };
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit,
        sort,
        status: 'ACTIVE'
      };

      if (search) params.search = search;
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedTag) params.tag = selectedTag;
      if (minPrice) params.minPrice = Number(minPrice);
      if (maxPrice) params.maxPrice = Number(maxPrice);

      const res = await apiClient.get('/products', { params });
      if (res.data.success) {
        setProducts(res.data.data.products || res.data.data);
        if (res.data.data.pagination) {
          setTotalPages(res.data.data.pagination.totalPages || 1);
          setTotalItems(res.data.data.pagination.total || 0);
        } else {
          setTotalPages(1);
          setTotalItems(res.data.data.length || 0);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch products, using offline backup:', err);
      // Offline search fallback
      const offlineProducts = [
        { id: '1', name: 'Bưởi Da Xanh Cái Mơn', price: 65000, unit: 'quả 1.2kg', categoryId: 'cat-fruits', tags: ['VietGAP', 'Đặc sản', 'Bến Tre'], status: 'ACTIVE', supplier: { farmName: 'Hợp Tác Xã Trái Cây Sạch Cái Mơn', address: 'Bến Tre' }, imageUrl: '/buoi-da-xanh-cai-mon.jpg' },
        { id: '2', name: 'Cà Chua Bi Đà Lạt', price: 35000, unit: 'túi 500g', categoryId: 'cat-veggies', tags: ['Hữu cơ', 'Đà Lạt'], status: 'ACTIVE', supplier: { farmName: 'Dalat Bio Farm', address: 'Đà Lạt' }, imageUrl: '/cachuabidalat.jpg' },
        { id: '3', name: 'Rau Muống Hữu Cơ', price: 15000, unit: 'bó 500g', categoryId: 'cat-veggies', tags: ['Hữu cơ', 'D2C'], status: 'ACTIVE', supplier: { farmName: 'Vườn Rau Sạch Bến Tre', address: 'Bến Tre' }, imageUrl: '/rau-muong-huu-co.jpg' },
        { id: '4', name: 'Sầu Riêng Ri6 Vĩnh Long', price: 145000, unit: 'kg (quả 2.5kg)', categoryId: 'cat-fruits', tags: ['VietGAP', 'Đặc sản', 'Vĩnh Long'], status: 'ACTIVE', supplier: { farmName: 'HTX Sầu Riêng Vĩnh Long', address: 'Vĩnh Long' }, imageUrl: '/sau-rieng-vinh-long.jpg' },
        { id: '5', name: 'Xoài Cát Hòa Lộc', price: 85000, unit: 'kg (2 quả)', categoryId: 'cat-fruits', tags: ['VietGAP', 'Đặc sản', 'Tiền Giang'], status: 'ACTIVE', supplier: { farmName: 'HTX Xoài Cát Hòa Lộc', address: 'Tiền Giang' }, imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format' },
        { id: '6', name: 'Bơ Sáp 034 Tây Nguyên', price: 55000, unit: 'túi 1kg', categoryId: 'cat-fruits', tags: ['VietGAP', 'Đặc sản', 'Đắk Lắk'], status: 'ACTIVE', supplier: { farmName: 'Vườn Bơ Sáp Đắk Lắk', address: 'Đắk Lắk' }, imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&auto=format' },
        { id: '7', name: 'Nấm Đùi Gà Hữu Cơ', price: 45000, unit: 'hộp 300g', categoryId: 'cat-veggies', tags: ['Hữu cơ', 'Lâm Đồng'], status: 'ACTIVE', supplier: { farmName: 'Lâm Đồng Organics', address: 'Lâm Đồng' }, imageUrl: '/nam-dui-ga.jpg' },
        { id: '8', name: 'Măng Tây Xanh Loại 1', price: 85000, unit: 'bó 500g', categoryId: 'cat-veggies', tags: ['VietGAP', 'Đặc sản', 'Ninh Thuận'], status: 'ACTIVE', supplier: { farmName: 'HTX Măng Tây Ninh Thuận', address: 'Ninh Thuận' }, imageUrl: '/mang-tay-xanh.jpg' }
      ];
      
      let filtered = offlineProducts;
      if (search) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
      }
      if (selectedCategory) {
        filtered = filtered.filter(p => p.categoryId === selectedCategory);
      }
      if (selectedTag) {
        filtered = filtered.filter(p => p.tags.includes(selectedTag));
      }
      if (minPrice) {
        filtered = filtered.filter(p => p.price >= Number(minPrice));
      }
      if (maxPrice) {
        filtered = filtered.filter(p => p.price <= Number(maxPrice));
      }
      
      setProducts(filtered);
      setTotalPages(Math.ceil(filtered.length / limit) || 1);
      setTotalItems(filtered.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, selectedCategory, selectedTag, minPrice, maxPrice, sort, page]);

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedTag('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setPage(1);
  };

  // Find featured products (active, high pricing/rating representation)
  const featuredProducts = products.slice(0, 2);

  return (
    <Container className="py-12 space-y-10">
      {/* Featured Header Showcase */}
      {featuredProducts.length > 0 && !search && !selectedCategory && !selectedTag && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-primary-500 uppercase tracking-widest">Nông sản nổi bật</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredProducts.map((p) => (
              <Card key={`featured-${p.id}`} className="overflow-hidden border border-primary-100 bg-primary-50/10 hover:shadow-md transition-shadow flex flex-col sm:flex-row p-0">
                <div className="w-full sm:w-2/5 aspect-[4/3] sm:aspect-square relative flex-shrink-0 bg-gray-100">
                  <img src={getAssetPath(p.images?.[0]?.url || p.imageUrl)} alt={p.name} className="object-cover w-full h-full" />
                  <div className="absolute top-2 left-2 bg-primary-500 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-sm">
                    Hot D2C
                  </div>
                </div>
                <div className="p-6 flex flex-col justify-between flex-grow">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{p.supplier?.farmName || p.farmName}</span>
                    <h4 className="font-extrabold text-xl text-gray-900 leading-tight">{p.name}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2">{p.description || 'Nông sản hữu cơ canh tác trực tiếp đảm bảo vệ sinh an toàn thực phẩm.'}</p>
                  </div>
                  <div className="flex items-end justify-between mt-4">
                    <div className="flex flex-col min-w-0">
                      <span className="text-lg font-black text-primary-500 leading-tight">
                        {formatVND(Number(p.price))}
                      </span>
                      <span className="text-xs text-gray-400 truncate mt-0.5" title={p.unit}>
                        / {p.unit}
                      </span>
                    </div>
                    <Link
                      href={`/products/${p.id}`}
                      className="bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm flex-shrink-0 whitespace-nowrap ml-2 active:scale-95 duration-150"
                    >
                      Mua ngay
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Filters */}
        <Card className="space-y-6 lg:sticky lg:top-24">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-primary-500" />
              Bộ lọc tìm kiếm
            </h3>
            <button onClick={handleClearFilters} className="text-xs font-bold text-primary-500 hover:underline">
              Xóa tất cả
            </button>
          </div>

          {/* Categories select */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase text-gray-400">Danh mục</label>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
              className="w-full border border-gray-200 bg-white px-4 py-2.5 rounded-xl text-sm focus:outline-primary-500"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase text-gray-400">Khoảng giá (VNĐ)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Từ"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                className="border border-gray-200 px-3 py-2 rounded-xl text-xs w-full text-center focus:outline-primary-500"
              />
              <input
                type="number"
                placeholder="Đến"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                className="border border-gray-200 px-3 py-2 rounded-xl text-xs w-full text-center focus:outline-primary-500"
              />
            </div>
          </div>

          {/* Tags cloud */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase text-gray-400 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-primary-500" />
              Nhãn sản phẩm
            </label>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => { setSelectedTag(selectedTag === tag ? '' : tag); setPage(1); }}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                    selectedTag === tag
                      ? 'bg-primary-500 border-primary-500 text-white font-bold'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Product Catalog Display */}
        <div className="lg:col-span-3 space-y-8">
          {/* Top toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            <div className="relative flex-grow max-w-md">
              <input
                type="text"
                placeholder="Tìm nông sản, nhà vườn..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 w-full focus:outline-primary-500 text-sm"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <ArrowUpDown className="w-4 h-4 text-gray-400" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="border border-gray-200 bg-white px-4 py-2.5 rounded-xl text-sm focus:outline-primary-500"
              >
                <option value="newest">Mới đăng tải</option>
                <option value="price_asc">Giá: Thấp đến Cao</option>
                <option value="price_desc">Giá: Cao đến Thấp</option>
              </select>
            </div>
          </div>

          {/* Results Info */}
          <div className="text-xs text-gray-400 font-medium">
            Tìm thấy <span className="font-bold text-gray-700">{totalItems}</span> nông sản phù hợp
          </div>

          {/* Grid Products */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-72 bg-gray-100 rounded-3xl"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 text-gray-400 border border-dashed rounded-3xl bg-gray-50/50">
              Không tìm thấy sản phẩm nào khớp với bộ lọc của bạn.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
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
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold border transition-all ${
                    page === p
                      ? 'bg-primary-500 border-primary-500 text-white'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
