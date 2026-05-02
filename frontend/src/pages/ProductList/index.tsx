import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { productApi } from '../../api/productApi';
import type { ProductFilterParams, Category } from '../../types/product.types';
import { ProductCard } from '../../components/common/ProductCard';
import { ProductCardSkeleton } from '../../components/common/ProductCardSkeleton';
import { ProductSidebar } from '../../components/common/ProductSidebar';
import { Pagination } from '../../components/common/Pagination';
import mainBanner from '../../assets/Group90.jpg';

const mapCategorySlugToProductType = (slug?: string | null): ProductFilterParams['productType'] => {
  if (!slug) return undefined;

  const normalized = slug.trim().toLowerCase();
  if (normalized === 'gong-kinh') return 'FRAME';
  if (normalized === 'trong-kinh') return 'LENS';
  if (normalized === 'kinh-mat') return 'SUNGLASSES';
  if (normalized === 'phu-kien') return 'ACCESSORY';

  return undefined;
};

// --- Component phụ trợ FilterPill ---
const FilterPill = ({ label, value, onChange, options = [] }: any) => (
  <div className="relative inline-block">
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value || null)}
      className="appearance-none border border-black bg-transparent text-gray-900 rounded-full pl-4 pr-8 py-1.5 text-sm hover:bg-gray-50 focus:outline-none cursor-pointer transition-colors max-w-[150px] truncate"
    >
      <option value="">{label}</option>
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[18px] text-gray-600">
      expand_more
    </span>
  </div>
);

export const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const rawCategoryParam = searchParams.get("categorySlug") || searchParams.get("category");
  const mappedProductType = mapCategorySlugToProductType(rawCategoryParam);
  const productTypeParam = (searchParams.get("productType") || mappedProductType || undefined) as ProductFilterParams['productType'];
  const categorySlugParam = mappedProductType ? undefined : (searchParams.get("categorySlug") || searchParams.get("category") || undefined);

  const filterParams: ProductFilterParams = {
    page: Number(searchParams.get("page")) || 0,
    size: 20,
    sort: searchParams.get("sort") || "createdAt,desc",
    categorySlug: categorySlugParam,
    productType: productTypeParam,
    brand: searchParams.get("brand") || undefined,
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    gender: searchParams.get("gender") || undefined,
    lensIndex: searchParams.get("lensIndex") || undefined,
    keyword: searchParams.get("keyword") || undefined,
    isBestSeller: searchParams.get("isBestSeller") === "true" || undefined,
  };

  const { data, isLoading } = useQuery({
    // Đã thêm 'style' vào queryKey để React Query biết khi nào cần fetch lại data
    queryKey: [
      "products", 
      filterParams, 
      searchParams.get('material'), 
      searchParams.get('shape'), 
      searchParams.get('feature'),
      searchParams.get('style') // New
    ],
    queryFn: () => productApi.getList({
      ...filterParams,
      material: searchParams.get("material") || undefined,
      shape: searchParams.get("shape") || undefined,
      feature: searchParams.get("feature") || undefined,
      style: searchParams.get("style") || undefined, // Truyền tham số style xuống API
    } as any),
    placeholderData: keepPreviousData,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: productApi.getCategories,
    staleTime: Infinity,
  });

  const updateFilter = (key: string, value: string | null) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);

      if (key === 'categorySlug') {
        const mappedFromCategory = mapCategorySlugToProductType(value);
        next.delete('category');

        if (mappedFromCategory) {
          next.delete('categorySlug');
          next.set('productType', mappedFromCategory);
          next.set('page', '0');
          return next;
        }
      }

      if (value === null || value === "") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      next.set("page", "0");
      return next;
    });
  };

  const handlePriceRangeChange = (val: string | null) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (!val) {
        next.delete('minPrice');
        next.delete('maxPrice');
      } else {
        const [min, max] = val.split('-');
        if (min) next.set('minPrice', min); else next.delete('minPrice');
        if (max) next.set('maxPrice', max); else next.delete('maxPrice');
      }
      next.set("page", "0");
      return next;
    });
  };

  const handlePageChange = (page: number) => {
    updateFilter("page", page.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  let hasActiveFilters = false;
  searchParams.forEach((_, key) => {
    if (key !== 'page' && key !== 'sort' && key !== 'keyword') {
      hasActiveFilters = true;
    }
  });

  const breadcrumbPath = useMemo(() => {
    if (!categories || !filterParams.categorySlug) return [];
    
    let path: Category[] = [];
    const findPath = (cats: Category[], targetSlug: string, currentPath: Category[]): boolean => {
      for (const cat of cats) {
        const newPath = [...currentPath, cat];
        if (cat.slug === targetSlug) {
          path = newPath;
          return true;
        }
        if (cat.children && findPath(cat.children, targetSlug, newPath)) {
          return true;
        }
      }
      return false;
    };
    
    findPath(categories, filterParams.categorySlug, []);
    return path;
  }, [categories, filterParams.categorySlug]);

  const currentCategoryTitle = useMemo(() => {
    if (filterParams.keyword) return `Kết quả tìm kiếm: "${filterParams.keyword}"`;
    if (breadcrumbPath.length > 0) return breadcrumbPath[breadcrumbPath.length - 1].name;
    if (filterParams.productType === 'FRAME') return 'Gọng Kính';
    if (filterParams.productType === 'SUNGLASSES') return 'Kính Mát';
    if (filterParams.productType === 'LENS') return 'Tròng Kính';
    return 'Tất Cả Sản Phẩm';
  }, [breadcrumbPath, filterParams]);


return (
    <div className="w-full flex flex-col">
      
      {/* 1. HÌNH ẢNH BANNER PHÍA TRÊN CÙNG (DÍNH SÁT HEADER) */}
      <div className="w-full max-w-[1200px] mx-auto">
        <img 
          src={mainBanner} 
          alt="Banner Gọng Kính" 
          className="w-full h-auto max-h-[400px] object-cover"
        />
      </div>

      {/* 2. PHẦN NỘI DUNG CHÍNH (Giữ nguyên khoảng cách 2 bên và ở dưới) */}
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8 overflow-hidden">
        
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 flex gap-2 items-center overflow-x-auto whitespace-nowrap scrollbar-hide max-w-full mb-6">
          <Link to="/" className="hover:text-primary">Trang chủ</Link>
          <span>/</span>
          <Link to="/san-pham" className="hover:text-primary">Sản phẩm</Link>
          {breadcrumbPath.map((cat) => (
            <span key={cat.id} className="flex gap-2 items-center">
              <span>/</span>
              <span className="text-gray-900">{cat.name}</span>
            </span>
          ))}
        </nav>

        {/* Tiêu đề chính nằm ở giữa */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-[28px] font-bold text-gray-900 leading-tight">
            {currentCategoryTitle}
          </h1>
        </div>

        {/* Filter Pills nằm dưới tiêu đề và được căn giữa */}
        <div className="hidden lg:flex flex-wrap justify-center items-center gap-2.5 mb-8">
          <FilterPill 
            label="Tất cả" 
            value={filterParams.productType} 
            onChange={(val: string) => updateFilter('productType', val)}
            options={[
              {label: 'Nam', value: 'MALE'},
              { label: 'Nữ', value: 'FEMALE' },
            ]}
          />
          <FilterPill 
            label="Chất liệu" 
            value={searchParams.get('material')} 
            onChange={(val: string) => updateFilter('material', val)}
            options={[
              { label: 'Kim loại', value: 'METAL' },
              { label: 'Nhựa', value: 'PLASTIC' },
              { label: 'Titanium', value: 'TITANIUM' }
            ]}
          />
          <FilterPill 
            label="Hình dáng" 
            value={searchParams.get('shape')} 
            onChange={(val: string) => updateFilter('shape', val)}
            options={[
              { label: 'Tròn', value: 'ROUND' },
              { label: 'Vuông', value: 'SQUARE' },
              { label: 'Chữ nhật', value: 'RECTANGLE' },
              { label: 'Mắt mèo', value: 'CATEYE' }
            ]}
          />
          
          <FilterPill 
            label="Thương hiệu" 
            value={filterParams.brand} 
            onChange={(val: string) => updateFilter('brand', val)}
            options={[
              { label: 'HMK Eyewear', value: 'HMK' },
              { label: 'Dior', value: 'DIOR' },
              { label: 'Gucci', value: 'GUCCI' }
            ]}
          />
          <FilterPill 
            label="Tính năng" 
            value={searchParams.get('feature')} 
            onChange={(val: string) => updateFilter('feature', val)}
            options={[
              { label: 'Chống tia UV', value: 'UV' },
              { label: 'Chống ánh sáng xanh', value: 'BLUE_LIGHT' },
              { label: 'Đổi màu', value: 'PHOTOCHROMIC' }
            ]}
          />
          <FilterPill 
            label="Giá" 
            value={
              searchParams.get('minPrice') && searchParams.get('maxPrice') 
                ? `${searchParams.get('minPrice')}-${searchParams.get('maxPrice')}`
                : searchParams.get('minPrice') 
                ? `${searchParams.get('minPrice')}-`
                : searchParams.get('maxPrice')
                ? `0-${searchParams.get('maxPrice')}`
                : ''
            } 
            onChange={handlePriceRangeChange}
            options={[
              { label: 'Dưới 500.000đ', value: '0-500000' },
              { label: '500.000đ - 1.000.000đ', value: '500000-1000000' },
              { label: 'Trên 1.000.000đ', value: '1000000-' }
            ]}
          />

          {hasActiveFilters && (
            <button onClick={clearAllFilters} className="text-sm text-danger hover:underline ml-2 whitespace-nowrap">
              Xóa lọc
            </button>
          )}
        </div>

        {/* Nút lọc Mobile và Số lượng */}
        <div className="flex justify-between items-center mb-6">
          <button 
            className="lg:hidden flex items-center gap-2 border border-gray-400 px-4 py-1.5 rounded-full bg-white hover:bg-gray-50 text-sm"
            onClick={() => setIsMobileFilterOpen(true)}
          >
            <span className="material-symbols-outlined text-[18px]">tune</span> Lọc
          </button>
          
          <div className="text-sm text-gray-500 lg:hidden">
            Tìm thấy <span className="font-bold text-gray-900">{data?.totalElements || 0}</span> SP
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="w-full">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : data?.content.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="material-symbols-outlined text-[64px] text-gray-300 mb-6">search_off</span>
              <h3 className="text-xl font-bold mb-2">Không tìm thấy sản phẩm phù hợp</h3>
              <p className="text-gray-500 mb-8">Vui lòng điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm</p>
              {hasActiveFilters && (
                <button onClick={clearAllFilters} className="px-6 py-2 border border-primary text-primary rounded-button font-medium hover:bg-primary/5 transition-colors">
                  Xóa tất cả bộ lọc
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {data?.content.map(product => (
                  <div key={product.id} className="w-full max-w-full overflow-hidden">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {data && (
                <div className="mt-8">
                  <Pagination 
                    currentPage={data.number} 
                    totalPages={data.totalPages} 
                    onPageChange={handlePageChange} 
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile Filter Bottom Sheet Overlay */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={() => setIsMobileFilterOpen(false)} />
            <div className="absolute bottom-0 left-0 w-full bg-white rounded-t-3xl h-[85vh] flex flex-col transform transition-transform duration-300 ease-out">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-3xl shrink-0">
                <h2 className="font-bold text-lg">BỘ LỌC</h2>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <ProductSidebar searchParams={searchParams} onFilterChange={updateFilter} />
              </div>

              <div className="p-4 border-t border-gray-200 flex gap-4 bg-white shrink-0">
                <button onClick={() => { clearAllFilters(); setIsMobileFilterOpen(false); }} className="flex-1 py-3 border border-gray-300 rounded font-medium text-sm">
                  Thiết lập lại
                </button>
                <button onClick={() => setIsMobileFilterOpen(false)} className="flex-1 py-3 bg-primary text-white rounded font-medium text-sm">
                  Áp dụng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};