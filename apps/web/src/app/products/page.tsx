'use client';

import React, { useState, useEffect } from 'react';
import { Container } from '@cropnet/ui';
import ProductCard from '@/features/products/components/ProductCard';
import { apiClient } from '@/shared/services/api';
import { Search, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, X, Filter } from 'lucide-react';
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
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 6;

  const availableTags = ['OCOP', 'Bưởi Tân Triều', 'Sầu riêng Long Khánh', 'VietGAP', 'Hữu cơ', 'Đặc sản Đồng Nai'];

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
          { id: 'cat-fruits', name: 'Trái Cây Đặc Sản', slug: 'trai-cay-dac-san' },
          { id: 'cat-processed', name: 'Nông Sản Chế Biến & Hạt', slug: 'nong-san-che-bien-hat' }
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
      const offlineProducts = [
        { id: 'prod-buoi-duong-la-cam', name: 'Bưởi Đường Lá Cam Tân Triều (OCOP 4 Sao)', price: 85000, unit: 'quả (1.1kg - 1.3kg)', categoryId: 'cat-fruits', tags: ['OCOP 4 Sao', 'Bưởi Tân Triều', 'VietGAP', 'Đặc sản Đồng Nai', 'Chỉ dẫn địa lý'], status: 'ACTIVE', supplier: { farmName: 'HTX Nông Nghiệp Dịch Vụ Tân Triều', address: 'Ấp Vĩnh Hiệp, Xã Tân Bình, Vĩnh Cửu, Thành phố Đồng Nai' }, imageUrl: '/assets/nongsan/buoi-duong-la-cam.jpg' },
        { id: 'prod-buoi-da-xanh-tantrieu', name: 'Bưởi Da Xanh Trồng Tại Vùng Cù Lao Tân Triều', price: 75000, unit: 'quả (1.3kg - 1.5kg)', categoryId: 'cat-fruits', tags: ['VietGAP', 'Bưởi Tân Triều', 'Sinh thái cù lao'], status: 'ACTIVE', supplier: { farmName: 'HTX Nông Nghiệp Dịch Vụ Tân Triều', address: 'Ấp Vĩnh Hiệp, Xã Tân Bình, Vĩnh Cửu, Thành phố Đồng Nai' }, imageUrl: '/assets/nongsan/buoi-da-xanh-tantrieu.jpg' },
        { id: 'prod-saurieng-ri6-longkhanh', name: 'Sầu Riêng Ri6 Long Khánh (Chín Cây Tự Nhiên)', price: 135000, unit: 'kg (trái 2.5kg - 3.5kg)', categoryId: 'cat-fruits', tags: ['VietGAP', 'Sầu riêng Long Khánh', 'Chín tự nhiên', 'Không nhúng thuốc'], status: 'ACTIVE', supplier: { farmName: 'HTX Nông nghiệp - Thương mại - Dịch vụ Xuân Lập', address: 'Phường Xuân Lập, TP Long Khánh, Thành phố Đồng Nai' }, imageUrl: '/assets/nongsan/sau-rieng-ri6-longkhanh.jpg' },
        { id: 'prod-chom-chom-nhan-longkhanh', name: 'Chôm Chôm Nhãn Long Khánh Giòn Ngọt', price: 45000, unit: 'kg (chùm quả tươi hái trong ngày)', categoryId: 'cat-fruits', tags: ['Chỉ dẫn địa lý 00080', 'Chôm chôm Long Khánh', 'Bình Lộc', 'VietGAP'], status: 'ACTIVE', supplier: { farmName: 'HTX Nông nghiệp - Dịch vụ - Thương mại Bình Lộc', address: 'Ấp 2, Xã Bình Lộc, TP Long Khánh, Thành phố Đồng Nai' }, imageUrl: '/assets/nongsan/chom-chom-nhan-longkhanh.jpg' },
        { id: 'prod-hat-dieu-rang-cui', name: 'Hạt Điều Rang Củi Vỏ Lụa Đồng Nai', price: 140000, unit: 'hộp 500g (hút chân không)', categoryId: 'cat-processed', tags: ['HACCP', 'Hạt điều Đồng Nai', 'Rang củi vỏ lụa', 'Định Quán'], status: 'ACTIVE', supplier: { farmName: 'Cơ sở chế biến hạt điều sạch Định Quán', address: 'Huyện Định Quán, Thành phố Đồng Nai' }, imageUrl: '/assets/nongsan/hat-dieu-rang-cui.jpg' },
        { id: 'prod-ruou-buoi-tan-trieu', name: 'Rượu Bưởi Truyền Thống Năm Huệ Tân Triều', price: 195000, unit: 'bình gốm 750ml', categoryId: 'cat-processed', tags: ['OCOP 3 Sao', 'Rượu bưởi Tân Triều', 'Bình gốm quà tặng'], status: 'ACTIVE', supplier: { farmName: 'Cơ sở rượu bưởi truyền thống Năm Huệ Tân Triều', address: 'Cù lao Tân Triều, Xã Tân Bình, Vĩnh Cửu, Thành phố Đồng Nai' }, imageUrl: '/assets/nongsan/ruou-buoi-nam-hue.jpg' },
        { id: 'prod-tieu-den-xuanloc', name: 'Tiêu Đen Chân Núi Chứa Chan Xuân Lộc', price: 90000, unit: 'hũ 250g', categoryId: 'cat-spices', tags: ['Tiêu Xuân Lộc', 'Núi Chứa Chan', 'Gia vị sạch'], status: 'ACTIVE', supplier: { farmName: 'Tổ Hợp Tác Nông Nghiệp Núi Chứa Chan Xuân Lộc', address: 'Chân núi Chứa Chan, Huyện Xuân Lộc, Thành phố Đồng Nai' }, imageUrl: '/assets/nongsan/tieu-den-xuanloc.jpg' }
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

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[#E2E5DC] pb-3">
        <h3 className="font-semibold text-sm text-[#253129] flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#7B876C]" />
          <span>Bộ lọc nông sản</span>
        </h3>
        <button onClick={handleClearFilters} className="text-xs text-[#2C4939] hover:underline font-medium">
          Xóa lọc
        </button>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-[#647067]">Danh mục</label>
        <select
          value={selectedCategory}
          onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
          className="w-full border border-[#E2E5DC] bg-white px-3 py-2 rounded-lg text-xs text-[#253129] focus:outline-none focus:border-[#2C4939]"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-[#647067]">Khoảng giá (VNĐ)</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Từ"
            value={minPrice}
            onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
            className="border border-[#E2E5DC] px-2.5 py-1.5 rounded-lg text-xs text-[#253129] text-center focus:outline-none focus:border-[#2C4939]"
          />
          <input
            type="number"
            placeholder="Đến"
            value={maxPrice}
            onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
            className="border border-[#E2E5DC] px-2.5 py-1.5 rounded-lg text-xs text-[#253129] text-center focus:outline-none focus:border-[#2C4939]"
          />
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-[#647067]">Đặc điểm & Chứng nhận</label>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => { setSelectedTag(selectedTag === tag ? '' : tag); setPage(1); }}
              className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                selectedTag === tag
                  ? 'bg-[#2C4939] border-[#2C4939] text-white font-medium'
                  : 'bg-white border-[#E2E5DC] text-[#647067] hover:border-[#CBD0C4]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#FAF9F5] min-h-screen py-8 sm:py-12">
      <Container className="space-y-8">
        {/* Editorial Page Header */}
        <div className="border-b border-[#E2E5DC] pb-6 space-y-2">
          <span className="text-xs font-semibold text-[#7B876C] uppercase tracking-wider">
            Sản Phẩm Trực Tiếp Từ Vườn
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#253129] tracking-tight">
            Nông Sản Bản Địa Thành Phố Đồng Nai
          </h1>
          <p className="text-xs sm:text-sm text-[#647067] max-w-2xl leading-relaxed">
            Các loại trái cây đặc sản OCOP và nông sản thu hoạch theo thời vụ từ HTX Tân Triều và HTX Long Khánh. 
            Mọi sản phẩm đều có mã lô truy xuất nguồn gốc minh bạch.
          </p>
        </div>

        {/* Main Grid: Filters + Catalog */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Desktop Sidebar Filters */}
          <div className="hidden lg:block bg-white rounded-xl border border-[#E2E5DC] p-5 shadow-subtle lg:sticky lg:top-24">
            <FilterContent />
          </div>

          {/* Product Catalog Display */}
          <div className="lg:col-span-3 space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              {/* Search input */}
              <div className="relative flex-grow max-w-md">
                <input
                  type="text"
                  placeholder="Tìm theo tên bưởi, sầu riêng, HTX..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full border border-[#E2E5DC] bg-white rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-[#253129] focus:outline-none focus:border-[#2C4939]"
                />
                <Search className="w-4 h-4 text-[#8C978F] absolute left-3 top-2.5" />
              </div>

              {/* Action Buttons: Mobile Filter Trigger & Sort */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E2E5DC] rounded-lg text-xs font-medium text-[#253129]"
                >
                  <Filter className="w-3.5 h-3.5 text-[#7B876C]" />
                  <span>Bộ lọc</span>
                </button>

                <div className="flex items-center gap-1.5 bg-white border border-[#E2E5DC] rounded-lg px-2.5 py-1.5 flex-grow sm:flex-grow-0">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#8C978F]" />
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="bg-transparent text-xs text-[#253129] focus:outline-none cursor-pointer"
                  >
                    <option value="newest">Mới cập nhật</option>
                    <option value="price_asc">Giá: Thấp đến Cao</option>
                    <option value="price_desc">Giá: Cao đến Thấp</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results Counter */}
            <div className="text-xs text-[#8C978F]">
              Hiển thị <span className="font-semibold text-[#253129]">{products.length}</span> trên tổng số <span className="font-semibold text-[#253129]">{totalItems}</span> nông sản
            </div>

            {/* Product Cards Grid: 2 columns on mobile, 3 on lg */}
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-64 bg-[#EAECE6] rounded-xl"></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 text-[#647067] bg-white border border-[#E2E5DC] rounded-xl p-8 space-y-2">
                <p className="font-medium text-sm text-[#253129]">Không tìm thấy nông sản phù hợp</p>
                <p className="text-xs">Quý khách vui lòng thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.</p>
                <button
                  onClick={handleClearFilters}
                  className="mt-3 text-xs text-[#2C4939] font-medium hover:underline inline-block"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {products.map((p) => (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    price={Number(p.price)}
                    unit={p.unit}
                    farmName={p.supplier?.farmName || p.farmName}
                    imageUrl={p.images?.[0]?.url || p.imageUrl}
                    tags={p.tags || []}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 border border-[#E2E5DC] rounded-lg bg-white text-[#647067] hover:bg-[#F1EFE8] disabled:opacity-40 transition-colors"
                  aria-label="Trang trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium border transition-colors ${
                      page === p
                        ? 'bg-[#2C4939] border-[#2C4939] text-white'
                        : 'bg-white border-[#E2E5DC] text-[#647067] hover:bg-[#F1EFE8]'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 border border-[#E2E5DC] rounded-lg bg-white text-[#647067] hover:bg-[#F1EFE8] disabled:opacity-40 transition-colors"
                  aria-label="Trang sau"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter Modal / Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div
              className="fixed inset-0 bg-[#253129]/50 transition-opacity"
              onClick={() => setMobileFilterOpen(false)}
            />
            <div className="relative bg-white rounded-t-2xl sm:rounded-xl max-w-md w-full p-6 shadow-modal border border-[#E2E5DC] z-10 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#E2E5DC] pb-3 mb-4">
                <h3 className="font-semibold text-base text-[#253129]">Bộ Lọc Nông Sản</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="text-[#647067] p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FilterContent />
              <div className="mt-6 pt-4 border-t border-[#E2E5DC]">
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-2.5 bg-[#2C4939] text-white rounded-lg text-xs font-medium"
                >
                  Áp dụng bộ lọc ({totalItems} sản phẩm)
                </button>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
