import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../../api/cartApi';
import { useCartStore } from '../../store/cartStore';
import { formatVND } from '../../utils/formatters';
import { useDebounce } from '../../hooks/useDebounce';
import type { CartItem } from '../../types/cart.types';
import { toast } from '../../utils/toast';

const CartItemRow = ({ item }: { item: CartItem }) => {
  const queryClient = useQueryClient();
  const setItemCount = useCartStore(state => state.setItemCount);
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const debouncedQuantity = useDebounce(localQuantity, 500);

  const updateMutation = useMutation({
    mutationFn: (qty: number) => cartApi.updateItem(item.id, qty),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      if (res?.itemCount !== undefined) {
         setItemCount(res.itemCount);
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
    mutationFn: () => cartApi.removeItem(item.id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      if (res?.itemCount !== undefined) {
         setItemCount(res.itemCount);
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
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 py-8 border-b border-gray-100 last:border-0 relative font-sans">
      {/* Product Image */}
      <Link to={`/san-pham/${item.slug}`} className="w-32 h-32 bg-[#f8f9fa] rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center">
        <img 
          src={item.thumbnailUrl || 'https://placehold.co/200x200'} 
          alt={item.productName} 
          className="w-[85%] h-[85%] object-contain mix-blend-multiply transition-transform duration-300 hover:scale-105" 
        />
      </Link>
      
      {/* Product Details & Actions */}
      <div className="flex-1 w-full flex flex-col sm:flex-row justify-between h-full min-h-[128px]">
        
        {/* Left Side: Info & Quantity */}
        <div className="flex flex-col justify-start">
          <Link to={`/san-pham/${item.slug}`} className="font-bold text-base text-gray-900 hover:text-black transition-colors mb-1 pr-4 line-clamp-2">
            {item.productName}
          </Link>
          <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
            Màu sắc: {item.colorName}
            {(!item.isAvailable || item.stockQuantity === 0) && (
               <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-sm ml-2 tracking-wide uppercase">Hết hàng</span>
            )}
          </div>

          <div className="mt-auto flex items-center gap-4">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">Số lượng</span>
            <div className="flex items-center border border-gray-300 rounded-full h-8 bg-white px-1">
              <button onClick={handleDecrease} disabled={localQuantity <= 1 || updateMutation.isPending} className="w-7 h-full flex items-center justify-center text-gray-500 hover:text-black disabled:opacity-50 transition-colors">
                <span className="material-symbols-outlined text-[16px]">remove</span>
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
                className="w-8 h-full text-center text-sm font-medium focus:outline-none appearance-none bg-transparent"
              />
              <button onClick={handleIncrease} disabled={localQuantity >= item.stockQuantity || updateMutation.isPending} className="w-7 h-full flex items-center justify-center text-gray-500 hover:text-black disabled:opacity-50 transition-colors">
                <span className="material-symbols-outlined text-[16px]">add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Price & Delete */}
        <div className="flex flex-col justify-between items-end h-full min-h-[128px] mt-4 sm:mt-0">
          <span className="font-bold text-base text-gray-900 whitespace-nowrap">{formatVND(item.unitPrice)}</span>
          <button 
            onClick={() => removeMutation.mutate()} 
            disabled={removeMutation.isPending} 
            className="text-gray-400 hover:text-gray-900 transition-colors disabled:opacity-50 mt-auto mb-1 p-1"
            title="Xóa sản phẩm"
          >
            <span className="material-symbols-outlined text-[24px]">delete</span>
          </button>
        </div>
      </div>
      
      {/* Loading Overlay */}
      {(updateMutation.isPending || removeMutation.isPending) && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 rounded">
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
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
    queryFn: async () => {
      const result = await cartApi.getCart();
      return result;
    },
  });

  const validateCouponMutation = useMutation({
    mutationFn: (code: string) => cartApi.validateCoupon(code, cart?.subtotal || 0),
    onSuccess: (res) => {
      if (res.valid) {
        setDiscountInfo({ discountAmount: res.discountAmount, finalPrice: res.finalPrice });
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
  if (isError) return <div className="p-8 text-center text-red-500 min-h-[60vh] flex items-center justify-center">Lỗi tải giỏ hàng. Vui lòng thử lại.</div>;

  const cart = cartData;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 min-h-[60vh] flex flex-col items-center justify-center animate-fade-in text-center font-sans">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-[48px] text-gray-300">local_mall</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h2>
        <p className="text-gray-500 mb-8">Bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
        <Link to="/san-pham" className="bg-black text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  const hasOutOfStock = cart.items.some(item => !item.isAvailable || item.stockQuantity === 0);
  const subtotal = cart.subtotal;
  const shippingFee = 0;
  const total = discountInfo ? discountInfo.finalPrice + shippingFee : subtotal + shippingFee;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in font-sans">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 text-center">Giỏ Hàng</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">
        
        {/* Left: Cart Items */}
        <div className="w-full lg:w-[60%] flex flex-col">
          <div className="flex flex-col">
             {cart.items.map((item: CartItem) => (
               <CartItemRow key={item.id} item={item} />
             ))}
          </div>
          
          <div className="mt-8 pt-4">
            <Link to="/san-pham" className="inline-block bg-black text-white px-8 py-3.5 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">
              Tiếp tục mua hàng
            </Link>
          </div>
        </div>

        {/* Right: Summary - Được chuyển thành Card trắng nổi bật */}
        <div className="w-full lg:w-[40%]">
          <div className="bg-white rounded-[24px] p-8 sm:p-10 sticky top-24 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100">
            {/* THÊM PHẦN ĐẾM SẢN PHẨM Ở ĐÂY */}
            <div className="mb-8 flex justify-between items-end border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900">Tổng sản phẩm</h2>
              <p className="text-gray-500 text-sm uppercase tracking-widest">{cart.itemCount} sản phẩm</p>
            </div>
            
            <div className="flex flex-col gap-5 mb-6 text-sm">
              <div className="flex justify-between items-center text-gray-600">
                <span>Tạm tính</span>
                <span className="font-medium text-gray-900">{formatVND(subtotal)}</span>
              </div>
              
              {discountInfo && (
                <div className="flex justify-between items-center text-green-600 font-medium">
                  <span>Giảm giá</span>
                  <span>-{formatVND(discountInfo.discountAmount)}</span>
                </div>
              )}
            </div>

            <hr className="border-gray-200 mb-6" />

            <div className="flex justify-between items-center mb-8">
              <span className="text-base font-bold text-gray-900">Tổng tiền</span>
              <span className="text-xl font-bold text-gray-900">{formatVND(total)}</span>
            </div>

            {/* Khung nhập mã giảm giá */}
            <div className="mb-6">
               <div className="flex gap-2">
                 <input
                   type="text"
                   placeholder="Mã giảm giá (Nếu có)"
                   value={couponCode}
                   onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                   className="flex-1 px-4 py-3 bg-[#f8f9fa] border border-transparent rounded-full text-sm focus:outline-none focus:border-gray-300 focus:bg-white transition-all uppercase"
                 />
                 <button 
                   onClick={handleApplyCoupon}
                   disabled={!couponCode.trim() || validateCouponMutation.isPending}
                   className="px-6 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50"
                 >
                   Áp dụng
                 </button>
               </div>
            </div>

            <button 
              onClick={() => navigate('/thanh-toan', { state: { couponCode: discountInfo ? couponCode : undefined } })}
              disabled={cart.items.length === 0 || hasOutOfStock}
              className="w-full bg-black text-white py-4.5 rounded-full font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm tracking-widest flex items-center justify-center gap-2 h-[54px]"
            >
              THANH TOÁN
            </button>
            
            {hasOutOfStock && (
              <p className="text-red-500 text-xs text-center mt-4 font-medium">Vui lòng xóa các sản phẩm hết hàng để tiếp tục thanh toán.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};