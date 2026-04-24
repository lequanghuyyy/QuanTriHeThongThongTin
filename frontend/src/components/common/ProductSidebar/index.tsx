import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../../../api/productApi';
import type { Category } from '../../../types/product.types';
import { useDebounce } from '../../../hooks/useDebounce';

interface ProductSidebarProps {
  searchParams: URLSearchParams;
  onFilterChange: (key: string, value: string | null) => void;
}

const CategoryNode = ({ category, activeSlug, onSelect }: { category: Category, activeSlug?: string, onSelect: (s: string) => void }) => {
  const isActive = activeSlug === category.slug;
  const hasActiveChild = category.children?.some(c => c.slug === activeSlug || c.children?.some(cc => cc.slug === activeSlug));
  const [isExpanded, setIsExpanded] = useState(hasActiveChild || false);

  return (
    <div className="mb-2">
      <div 
        className={`flex justify-between items-center cursor-pointer py-1 text-sm ${isActive ? 'text-primary font-semibold border-l-2 border-primary pl-2' : 'text-gray-700 hover:text-primary'}`}
        onClick={() => onSelect(category.slug)}
      >
        <span>{category.name}</span>
        {category.children && category.children.length > 0 && (
          <span onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className="px-2 text-gray-400 hover:text-primary">
            {isExpanded ? '▲' : '▼'}
          </span>
        )}
      </div>
      {isExpanded && category.children && (
        <div className="pl-4 mt-2 space-y-1 border-l border-gray-100 ml-1">
          {category.children.map(child => (
            <CategoryNode key={child.id} category={child} activeSlug={activeSlug} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

export const ProductSidebar = ({ searchParams, onFilterChange }: ProductSidebarProps) => {
  const activeCategorySlug = searchParams.get('categorySlug') || undefined;
  const activeBrand = searchParams.get('brand') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const activeGender = searchParams.get('gender') || '';
  const activeLensIndex = searchParams.get('lensIndex') || '';

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: productApi.getCategories,
    staleTime: Infinity,
  });

  const [minPrice, setMinPrice] = useState(minPriceParam);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam);
  const debouncedMin = useDebounce(minPrice, 600);
  const debouncedMax = useDebounce(maxPrice, 600);

  useEffect(() => {
    if (debouncedMin !== minPriceParam) onFilterChange('minPrice', debouncedMin || null);
  }, [debouncedMin, minPriceParam, onFilterChange]);

  useEffect(() => {
    if (debouncedMax !== maxPriceParam) onFilterChange('maxPrice', debouncedMax || null);
  }, [debouncedMax, maxPriceParam, onFilterChange]);

  const isTrongKinh = activeCategorySlug?.includes('trong-kinh');
  const isGongKinhOrMat = activeCategorySlug?.includes('gong-kinh') || activeCategorySlug?.includes('kinh-mat') || !isTrongKinh;

  return (
    <div className="w-full">
      {/* SECTION 1: DANH MỤC */}
      <div className="mb-8">
        <h3 className="font-bold text-sm tracking-wider mb-4 uppercase">Danh mục</h3>
        <div className="space-y-1">
          {categories?.map(cat => (
            <CategoryNode key={cat.id} category={cat} activeSlug={activeCategorySlug} onSelect={(slug) => onFilterChange('categorySlug', slug)} />
          ))}
        </div>
      </div>

      {/* SECTION 2: THƯƠNG HIỆU */}
      <div className="mb-8">
        <h3 className="font-bold text-sm tracking-wider mb-4 uppercase">Thương hiệu</h3>
        <div className="space-y-2">
          {['HMK', ...(isTrongKinh ? ['Rocky', 'Chemi', 'Essilor'] : [])].map(brand => (
            <label key={brand} className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="radio" 
                name="brand"
                checked={activeBrand === brand}
                onChange={() => onFilterChange('brand', brand)}
                className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
              />
              <span className="text-sm text-gray-700 group-hover:text-primary">{brand}</span>
            </label>
          ))}
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="radio" 
              name="brand"
              checked={!activeBrand}
              onChange={() => onFilterChange('brand', null)}
              className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
            />
            <span className="text-sm text-gray-700 group-hover:text-primary">Tất cả</span>
          </label>
        </div>
      </div>

      {/* SECTION 3: KHOẢNG GIÁ */}
      <div className="mb-8">
        <h3 className="font-bold text-sm tracking-wider mb-4 uppercase">Khoảng giá</h3>
        <div className="flex items-center gap-2">
          <input 
            type="number" 
            placeholder="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded text-sm outline-none focus:border-primary"
          />
          <span className="text-gray-400">-</span>
          <input 
            type="number" 
            placeholder="5.000.000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* SECTION 4: GIỚI TÍNH */}
      {isGongKinhOrMat && (
        <div className="mb-8">
          <h3 className="font-bold text-sm tracking-wider mb-4 uppercase">Giới tính</h3>
          <div className="space-y-2">
            {[
              { label: 'Tất cả', value: '' },
              { label: 'Nam', value: 'MALE' },
              { label: 'Nữ', value: 'FEMALE' },
              { label: 'Trẻ em', value: 'KIDS' },
            ].map(gender => (
              <label key={gender.label} className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  name="gender"
                  checked={activeGender === gender.value}
                  onChange={() => onFilterChange('gender', gender.value || null)}
                  className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                />
                <span className="text-sm text-gray-700 group-hover:text-primary">{gender.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: CHỈ SỐ TRÒNG */}
      {isTrongKinh && (
        <div className="mb-8">
          <h3 className="font-bold text-sm tracking-wider mb-4 uppercase">Chỉ số tròng</h3>
          <div className="space-y-2">
            {['', '1.56', '1.61', '1.67', '1.74'].map(index => (
              <label key={index || 'all'} className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  name="lensIndex"
                  checked={activeLensIndex === index}
                  onChange={() => onFilterChange('lensIndex', index || null)}
                  className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                />
                <span className="text-sm text-gray-700 group-hover:text-primary">{index ? index : 'Tất cả'}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
