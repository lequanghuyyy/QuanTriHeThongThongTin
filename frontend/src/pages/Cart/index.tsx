import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../../api/cartApi';
import { useCartStore } from '../../store/cartStore';
import { formatVND } from '../../utils/formatters';
import { useDebounce } from '../../hooks/useDebounce';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import clsx from 'clsx';
import { CartItem } from '../../types/cart.types';

// Mock toast
const toast = {
  success: (msg: string) => alert(msg),
  error: (msg: string) => alert(msg)
};

const CartItemRow = ({ item }: { item: CartItem }) => {
  const queryClient = useQueryClient();
  const setItemCount = useCartStore(state => state.setItemCount);
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const debouncedQuantity = useDebounce(localQuantity, 500);

  const updateMutation = useMutation({
    mutationFn: (qty: number) => cartApi.updateItem(item.cartItemId, qty),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      // Assuming res.data returns the updated Cart
      if (res.data?.itemCount !== undefined) {
         setItemCount(res.data.itemCount);
      }
    },
    onError: () => {
      toast.error("Không thể cập nhật số lượng");
      setLocalQuantity(item.quantity);
    }
  });

  useEffect(() => {
    if (debouncedQuantity !== item.quantity && debouncedQuantity > 0) {
      updateMutation.mutate(debouncedQuantity);
    }
  }, [debouncedQuantity, item.quantity]);

  const removeMutation = useMutation({
    mutationFn: () => cartApi.removeItem(item.cartItemId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      if (res.data?.itemCount !== undefined) {
         setItemCount(res.data.itemCount);
      }
      toast.success("Đã xóa sản phẩm khỏi giỏ");
    }
  });

  const handleDecrease = () => {
    if (localQuantity > 1) setLocalQuantity(localQuantity - 1);
  };
  
  const handleIncrease = () => {
    if (localQuantity < item.stockQuantity) setLocalQuantity(localQuantity + 1);
  };

  return (
    <div className="flex items-start gap-4 py-6 border-b border-gray-100 last:border-0 relative">
      <Link to={`/san-pham/${item.product.slug}`} className="w-24 h-24 bg-gray-50 rounded-image overflow-hidden flex-shrink-0 border border-gray-100 group">
        <img src={item.product.thumbnailUrl || 'https://placehold.co/200x200'} alt={item.product.name} className="w-full h-full object-contain mix-blend-multiply p-2 transition-transform duration-300 group-hover:scale-105" />
      </Link>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <Link to={`/san-pham/${item.product.slug}`} className="font-serif font-medium text-lg text-gray-900 hover:text-primary truncate pr-4 transition-colors">
            {item.product.name}
          </Link>
          <span className="font-medium text-gray-900 whitespace-nowrap">{formatVND(item.unitPrice)}</span>
        </div>
        
        <div className="text-sm text-gray-500 mb-3 flex items-center gap-2">
          {item.variant.colorName} {item.variant.size ? `/ ${item.variant.size}` : ''}
          {(!item.isAvailable || item.stockQuantity === 0) && (
             <span className="text-[10px] font-bold text-danger bg-danger/10 px-2 py-0.5 rounded-sm ml-2 tracking-wide uppercase">Hết hàng</span>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center border border-gray-200 rounded h-9 w-28 bg-white">
            <button onClick={handleDecrease} disabled={localQuantity <= 1 || updateMutation.isPending} className="w-9 h-full flex items-center justify-center text-gray-500 hover:text-primary hover:bg-gray-50 disabled:opacity-50 transition-colors">
              <Minus size={14} />
            </button>
            <input 
              type="number" 
              value={localQuantity} 
              onChange={e => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val >= 1 && val <= item.stockQuantity) {
                  setLocalQuantity(val);
                }
              }}
              disabled={updateMutation.isPending}
              className="w-10 h-full text-center text-sm font-medium focus:outline-none appearance-none bg-transparent"
            />
            <button onClick={handleIncrease} disabled={localQuantity >= item.stockQuantity || updateMutation.isPending} className="w-9 h-full flex items-center justify-center text-gray-500 hover:text-primary hover:bg-gray-50 disabled:opacity-50 transition-colors">
              <Plus size={14} />
            </button>
          </div>

          <button onClick={() => removeMutation.mutate()} disabled={removeMutation.isPending} className="text-gray-400 hover:text-danger p-2 transition-colors disabled:opacity-50">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      
      {(updateMutation.isPending || removeMutation.isPending) && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 rounded">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export const Cart = () => {
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState<{ discountAmount: number, finalPrice: number } | null>(null);

  const { data: cartData, isLoading, isError } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.getCart(),
  });

  const validateCouponMutation = useMutation({
    mutationFn: (code: string) => cartApi.validateCoupon(code, cart?.subtotal || 0),
    onSuccess: (res) => {
      if (res.data.valid) {
        setDiscountInfo({ discountAmount: res.data.discountAmount, finalPrice: res.data.finalPrice });
        toast.success("Áp dụng mã thành công!");
      } else {
        toast.error("Mã giảm giá không hợp lệ");
        setDiscountInfo(null);
      }
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi áp dụng mã");
      setDiscountInfo(null);
    }
  });

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    validateCouponMutation.mutate(couponCode);
  };

  if (isLoading) return <div className="p-8 text-center min-h-[60vh] flex items-center justify-center">Đang tải giỏ hàng...</div>;
  if (isError) return <div className="p-8 text-center text-danger min-h-[60vh] flex items-center justify-center">Lỗi tải giỏ hàng. Vui lòng thử lại.</div>;

  const cart = cartData?.data;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 min-h-[60vh] flex flex-col items-center justify-center animate-fade-in text-center">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={48} className="text-gray-300" />
        </div>
        <h2 className="text-2xl font-serif text-gray-900 mb-2">Giỏ hàng trống</h2>
        <p className="text-gray-500 mb-8">Bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
        <Link to="/san-pham" className="btn btn-primary">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  const hasOutOfStock = cart.items.some(item => !item.isAvailable || item.stockQuantity === 0);
  const subtotal = cart.subtotal;
  const shippingFee = 0; // "Tính khi thanh toán" - Assuming 0 for now
  const total = discountInfo ? discountInfo.finalPrice + shippingFee : subtotal + shippingFee;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="mb-10">
        <h1 className="text-4xl font-serif text-gray-900 mb-2">Giỏ hàng của bạn</h1>
        <p className="text-gray-500 text-sm uppercase tracking-widest">{cart.itemCount} sản phẩm</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 xl:gap-16">
        {/* Left: Cart Items */}
        <div className="w-full lg:w-[60%] flex flex-col">
          <div className="border-t border-gray-900">
             {cart.items.map(item => (
               <CartItemRow key={item.cartItemId} item={item} />
             ))}
          </div>
        </div>

        {/* Right: Summary */}
        <div className="w-full lg:w-[40%]">
          <div className="bg-gray-50 rounded-card p-8 sticky top-24">
            <h2 className="text-xl font-serif text-gray-900 mb-6">Tóm tắt đơn hàng</h2>
            
            <div className="flex flex-col gap-4 mb-6 text-sm">
              <div className="flex justify-between items-center text-gray-600">
                <span>Tạm tính</span>
                <span className="font-medium text-gray-900">{formatVND(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Phí vận chuyển</span>
                <span className="text-gray-400 italic">Tính khi thanh toán</span>
              </div>
              {discountInfo && (
                <div className="flex justify-between items-center text-success font-medium">
                  <span>Giảm giá</span>
                  <span>-{formatVND(discountInfo.discountAmount)}</span>
                </div>
              )}
            </div>

            <hr className="border-gray-200 mb-6" />

            <div className="flex justify-between items-end mb-8">
              <span className="text-base font-medium text-gray-900">Tổng cộng</span>
              <span className="text-2xl font-bold text-gray-900">{formatVND(total)}</span>
            </div>

            <div className="mb-8">
               <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Mã ưu đãi</label>
               <div className="flex gap-2">
                 <div className="relative flex-1">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Tag size={16} className="text-gray-400" />
                   </div>
                   <input
                     type="text"
                     placeholder="Nhập mã..."
                     value={couponCode}
                     onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                     className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow uppercase"
                   />
                 </div>
                 <button 
                   onClick={handleApplyCoupon}
                   disabled={!couponCode.trim() || validateCouponMutation.isPending}
                   className="px-6 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
                 >
                   Áp dụng
                 </button>
               </div>
            </div>

            <button 
              onClick={() => navigate('/thanh-toan', { state: { couponCode: discountInfo ? couponCode : undefined } })}
              disabled={cart.items.length === 0 || hasOutOfStock}
              className="w-full bg-primary text-white py-4 rounded-button font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm tracking-widest"
            >
              Tiến hành thanh toán <ArrowRight size={18} />
            </button>
            
            {hasOutOfStock && (
              <p className="text-danger text-xs text-center mt-4">Vui lòng xóa các sản phẩm hết hàng để tiếp tục thanh toán.</p>
            )}

            <div className="mt-6 flex items-center justify-center gap-4 text-gray-400">
               <span className="material-symbols-outlined text-[20px]">credit_card</span>
               <span className="material-symbols-outlined text-[20px]">local_shipping</span>
               <span className="material-symbols-outlined text-[20px]">lock</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
