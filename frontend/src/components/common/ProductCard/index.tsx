import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Product } from '../../../types/product.types';
import { formatVND } from '../../../utils/formatters';
import { useCartStore } from '../../../store/cartStore';
import { cartApi } from '../../../api/cartApi';
import { toast } from '../../../utils/toast';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setItemCount } = useCartStore();
  const [isHovered, setIsHovered] = useState(false);

  const primaryImage = product.images?.find(img => img.isPrimary)?.imageUrl || product.thumbnailUrl;
  const secondaryImage = product.images?.find(img => !img.isPrimary)?.imageUrl || primaryImage;
  const displayImage = isHovered ? secondaryImage : primaryImage;

  const addToCartMutation = useMutation({
    mutationFn: ({ variantId, quantity }: { variantId: number; quantity: number }) => {
      return cartApi.addItem(variantId, quantity);
    },
    onSuccess: (response) => {
      const cart = response;
      if (cart && typeof cart.itemCount === 'number') {
        setItemCount(cart.itemCount);
      }
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: () => toast.error("Không thể thêm vào giỏ"),
  });

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const availableVariant = product.variants?.find(v => v.stockQuantity > 0);
    
    if (!availableVariant || !availableVariant.id) {
      toast.error('Sản phẩm đã hết hàng hoặc không có biến thể');
      console.error('[ProductCard] No available variant found:', { product, variants: product.variants });
      return;
    }

    console.log('[ProductCard] Adding variant to cart:', { variantId: availableVariant.id, quantity: 1 });
    
    addToCartMutation.mutate(
      { variantId: availableVariant.id, quantity: 1 },
      {
        onSuccess: () => {
          toast.success("Đã thêm vào giỏ hàng!");
          navigate('/gio-hang');
        },
        onError: (error) => {
          console.error('[ProductCard] Add to cart failed:', error);
          toast.error('Không thể thêm vào giỏ');
        }
      }
    );
  };

  const colors = product.variants?.map(v => v.colorHex).filter((v, i, a) => a.indexOf(v) === i) || [];
  const maxColors = 4;

  return (
    <Link 
      to={`/san-pham/${product.slug}`} 
      // Tăng padding lên p-3 (nhỉnh hơn p-2.5 một chút)
      className="group flex flex-col block bg-[#E8E8E8] p-4 rounded-[20px] hover:shadow-md transition-all duration-300 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges: Chỉnh lại vị trí top/left tương ứng với padding */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
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

      {/* Khối chứa hình ảnh: Thêm rounded-xl để bo tròn */}
      <div className="relative aspect-square flex items-center justify-center overflow-hidden mb-3 rounded-xl">
        <img 
          src={displayImage || 'https://placehold.co/400x400/E8E8E8/474747?text=No+Image'} 
          alt={product.name} 
          // Thêm rounded-xl cho ảnh để bo góc mượt mà
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 mix-blend-multiply rounded-xl"
        />
        
        {/* Nút mua ngay */}
        <button 
          onClick={handleBuyNow}
          disabled={addToCartMutation.isPending || !product.variants?.some(v => v.stockQuantity > 0)}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-primary text-white w-[90%] py-2.5 rounded-button font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-800 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[16px]">shopping_cart</span> Mua ngay
        </button>
      </div>

      {/* Thông tin sản phẩm nằm trực tiếp trên nền xám */}
      <div className="px-1 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-black leading-normal mb-2">
          {product.name}
        </h3>
        
        <div className="mt-auto">
          {/* Box giá tiền */}
          <div className="flex items-center gap-2 mb-2.5">
            {product.salePrice ? (
              <>
                <span className="font-bold text-[15px] text-danger">{formatVND(product.salePrice)}</span>
                <span className="text-[13px] text-black line-through">{formatVND(product.basePrice)}</span>
              </>
            ) : (
              <span className="font-bold text-[15px] text-gray-900">{formatVND(product.basePrice)}</span>
            )}
          </div>

          {/* Dải màu sắc variants */}
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
              <span className="text-[11px] text-gray-500 font-medium ml-1">+{colors.length - maxColors}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};