import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '../../../types/product.types';
import { formatVND } from '../../../utils/formatters';
import { useCartStore } from '../../../store/cartStore';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { incrementCount } = useCartStore();
  const [isHovered, setIsHovered] = useState(false);

  const primaryImage = product.images?.find(img => img.isPrimary)?.imageUrl || product.thumbnailUrl;
  const secondaryImage = product.images?.find(img => !img.isPrimary)?.imageUrl || primaryImage;
  const displayImage = isHovered ? secondaryImage : primaryImage;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const availableVariant = product.variants?.find(v => v.stockQuantity > 0);
    if (availableVariant || product.variants?.length === 0) {
      incrementCount(1);
      alert('Đã thêm vào giỏ hàng');
    } else {
      alert('Sản phẩm đã hết hàng');
    }
  };

  const colors = product.variants?.map(v => v.colorHex).filter((v, i, a) => a.indexOf(v) === i) || [];
  const maxColors = 4;

  return (
    <Link 
      to={`/san-pham/${product.slug}`} 
      className="group flex flex-col block bg-white border border-gray-100 rounded-card overflow-hidden hover:shadow-lg transition-all duration-300 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {product.salePrice && product.discountPercent > 0 && (
          <span className="bg-danger text-white text-[10px] font-bold px-2 py-1 rounded">
            GIẢM {product.discountPercent}%
          </span>
        )}
        {product.isBestSeller && (
          <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded">
            BÁN CHẠY
          </span>
        )}
      </div>

      <div className="relative aspect-square overflow-hidden bg-gray-50 flex items-center justify-center p-4">
        <img 
          src={displayImage || 'https://placehold.co/400x400/E8E8E8/474747?text=No+Image'} 
          alt={product.name} 
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 mix-blend-multiply"
        />
        
        <button 
          onClick={handleAddToCart}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-primary text-white w-[90%] py-2.5 rounded-button font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-800 shadow-md"
        >
          <ShoppingCart size={16} /> Mua ngay
        </button>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-sm line-clamp-2 mb-2 text-gray-800 group-hover:text-primary transition-colors h-10">
          {product.name}
        </h3>
        
        <div className="mt-auto">
          <div className="flex items-center gap-2 mb-3">
            {product.salePrice ? (
              <>
                <span className="font-bold text-danger">{formatVND(product.salePrice)}</span>
                <span className="text-xs text-gray-400 line-through">{formatVND(product.basePrice)}</span>
              </>
            ) : (
              <span className="font-bold text-gray-900">{formatVND(product.basePrice)}</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 h-4">
            {colors.slice(0, maxColors).map((color, idx) => (
              <div 
                key={idx} 
                className="w-4 h-4 rounded-full border border-gray-200 shadow-sm"
                style={{ backgroundColor: color }}
                title="Color variant"
              />
            ))}
            {colors.length > maxColors && (
              <span className="text-xs text-gray-500 font-medium ml-1">+{colors.length - maxColors}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
