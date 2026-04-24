import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { SlidersHorizontal, SearchX, X } from 'lucide-react';
import { productApi } from '../../api/productApi';
import { ProductFilterParams, Category } from '../../types/product.types';
import { ProductCard } from '../../components/common/ProductCard';
import { ProductCardSkeleton } from '../../components/common/ProductCardSkeleton';
import { ProductSidebar } from '../../components/common/ProductSidebar';
import { Pagination } from '../../components/common/Pagination';

export const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const filterParams: ProductFilterParams = {
    page: Number(searchParams.get("page")) || 0,
    size: 20,
    sort: searchParams.get("sort") || "createdAt,desc",
    categorySlug: searchParams.get("categorySlug") || undefined,
    brand: searchParams.get("brand") || undefined,
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    gender: searchParams.get("gender") || undefined,
    lensIndex: searchParams.get("lensIndex") || undefined,
    keyword: searchParams.get("keyword") || undefined,
    isBestSeller: searchParams.get("isBestSeller") === "true" || undefined,
  };

  const { data, isLoading } = useQuery({
    queryKey: ["products", filterParams],
    queryFn: () => productApi.getList(filterParams),
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
      if (value === null || value === "") {
        next.delete(key);
      } else {
        next.set(key, value);
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

  const hasActiveFilters = Array.from(searchParams.keys()).some(
    key => key !== 'page' && key !== 'sort' && key !== 'keyword'
  );

  // Breadcrumb path logic
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

  return (
    <div className="container mx-auto px-4 md:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-8 flex gap-2 items-center overflow-x-auto whitespace-nowrap scrollbar-hide">
        <Link to="/" className="hover:text-primary">Trang chủ</Link>
        <span>&gt;</span>
        <Link to="/san-pham" className="hover:text-primary">Sản phẩm</Link>
        {breadcrumbPath.map((cat, idx) => (
          <span key={cat.id} className="flex gap-2 items-center">
            <span>&gt;</span>
            <span className={idx === breadcrumbPath.length - 1 ? 'text-gray-900 font-medium' : ''}>
              {cat.name}
            </span>
          </span>
        ))}
      </nav>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-[240px] flex-shrink-0 sticky top-24">
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
            <h2 className="font-bold text-lg font-serif">BỘ LỌC</h2>
            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="text-xs text-danger hover:underline">Xóa tất cả</button>
            )}
          </div>
          <ProductSidebar searchParams={searchParams} onFilterChange={updateFilter} />
        </aside>

        {/* Main Content */}
        <div className="flex-1 w-full min-w-0">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-4">
              {/* Mobile Filter Toggle */}
              <button 
                className="lg:hidden flex items-center gap-2 border border-gray-300 px-4 py-2 rounded bg-white hover:bg-gray-50 text-sm font-medium"
                onClick={() => setIsMobileFilterOpen(true)}
              >
                <SlidersHorizontal size={16} />
                Lọc
              </button>
              
              <div className="text-sm text-gray-600">
                {filterParams.keyword ? (
                  <span>Kết quả tìm kiếm cho "{filterParams.keyword}" - Tìm thấy <span className="font-bold text-gray-900">{data?.totalElements || 0}</span> sản phẩm</span>
                ) : (
                  <span>Tìm thấy <span className="font-bold text-gray-900">{data?.totalElements || 0}</span> sản phẩm</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto">
              <span className="text-sm text-gray-500 whitespace-nowrap">Sắp xếp:</span>
              <select 
                value={filterParams.sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-primary bg-white"
              >
                <option value="createdAt,desc">Mới nhất</option>
                <option value="totalSold,desc">Bán chạy nhất</option>
                <option value="price,asc">Giá tăng dần</option>
                <option value="price,desc">Giá giảm dần</option>
                <option value="averageRating,desc">Đánh giá cao nhất</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : data?.content.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <SearchX size={64} className="text-gray-300 mb-6" />
              <h3 className="text-xl font-bold mb-2">Không tìm thấy sản phẩm phù hợp</h3>
              <p className="text-gray-500 mb-8">Vui lòng điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm</p>
              <div className="flex gap-4">
                {hasActiveFilters && (
                  <button onClick={clearAllFilters} className="px-6 py-2 border border-primary text-primary rounded-button font-medium hover:bg-primary/5 transition-colors">
                    Xóa bộ lọc
                  </button>
                )}
                <Link to="/san-pham" className="px-6 py-2 bg-primary text-white rounded-button font-medium hover:bg-gray-800 transition-colors">
                  Xem tất cả sản phẩm
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {data?.content.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {data && (
                <Pagination 
                  currentPage={data.number} 
                  totalPages={data.totalPages} 
                  onPageChange={handlePageChange} 
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet Overlay */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="absolute bottom-0 left-0 w-full bg-white rounded-t-3xl h-[85vh] flex flex-col transform transition-transform duration-300 ease-out">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-3xl shrink-0">
              <h2 className="font-bold text-lg">BỘ LỌC</h2>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
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
  );
};
