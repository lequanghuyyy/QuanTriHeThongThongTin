import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm as useHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cartApi } from '../../api/cartApi';
import { userApi } from '../../api/userApi';
import { orderApi } from '../../api/orderApi';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { formatVND } from '../../utils/formatters';
import type { CheckoutRequest, PaymentMethod } from '../../types/order.types';
import { CreditCard, Wallet, Plus, Lock } from 'lucide-react';
import clsx from 'clsx';

const addressSchema = z.object({
  recipientName: z.string().min(2, "Vui lòng nhập họ tên"),
  phone: z.string().min(10, "Số điện thoại không hợp lệ"),
  province: z.string().min(1, "Vui lòng chọn tỉnh/thành"),
  district: z.string().min(1, "Vui lòng chọn quận/huyện"),
  ward: z.string().min(1, "Vui lòng chọn phường/xã"),
  addressDetail: z.string().min(5, "Vui lòng nhập địa chỉ cụ thể"),
});

type AddressForm = z.infer<typeof addressSchema>;

// Mock toast
const toast = {
  success: (msg: string) => alert(msg),
  error: (msg: string) => alert(msg)
};

export const Checkout = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const clearCount = useCartStore(state => state.clearCount);

  // Default to coupon from cart state if passed
  const passedCoupon = location.state?.couponCode as string | undefined;

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [note, setNote] = useState('');
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  // Queries
  const { data: cartData, isLoading: isCartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.getCart(),
  });

  const { data: addressesData, isLoading: isAddressesLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => userApi.getAddresses(),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (addressesData && addressesData.length > 0 && !selectedAddressId) {
      const defaultAddr = addressesData.find(a => a.isDefault);
      setSelectedAddressId(defaultAddr ? defaultAddr.id : addressesData[0].id);
    }
  }, [addressesData, selectedAddressId]);

  // Mutations
  const checkoutMutation = useMutation({
    mutationFn: (data: CheckoutRequest) => orderApi.checkout(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      clearCount();
      navigate(`/tai-khoan/don-hang/${res.orderCode}`, {
        state: { isNewOrder: true }
      });
      toast.success("Đặt hàng thành công!");
    },
    onError: () => toast.error("Có lỗi xảy ra khi đặt hàng")
  });

  const addAddressMutation = useMutation({
    mutationFn: (data: AddressForm) => userApi.addAddress({ ...data, isDefault: false }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setSelectedAddressId(res.id);
      setIsAddingAddress(false);
      toast.success("Đã thêm địa chỉ mới");
      reset();
    },
    onError: () => toast.error("Không thể thêm địa chỉ")
  });

  const { register, handleSubmit, formState: { errors }, reset } = useHookForm<AddressForm>({
    resolver: zodResolver(addressSchema)
  });

  if (!isAuthenticated) {
    return <Navigate to="/dang-nhap" state={{ from: location.pathname }} replace />;
  }

  if (isCartLoading || isAddressesLoading) {
    return <div className="p-8 text-center min-h-[60vh] flex items-center justify-center">Đang tải thông tin...</div>;
  }

  const cart = cartData;
  const addresses = addressesData || [];

  if (!cart || cart.items.length === 0) {
    return <Navigate to="/gio-hang" replace />;
  }

  const handlePlaceOrder = () => {
    if (addresses.length === 0) {
      toast.error("Vui lòng thêm địa chỉ giao hàng");
      return;
    }
    if (!selectedAddressId) {
      toast.error("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    const payload: CheckoutRequest = {
      addressId: selectedAddressId,
      paymentMethod,
      note: note.trim() || undefined,
      couponCode: passedCoupon,
      items: cart.items.map((item: any) => ({
        productVariantId: item.productVariantId,
        quantity: item.quantity
      }))
    };

    checkoutMutation.mutate(payload);
  };

  const subtotal = cart.subtotal;
  const shippingFee = 0; // TBD logic
  // Since we don't have discountAmount fetched here natively if we didn't revalidate,
  // ideally we should call validateCoupon again or backend handles it on checkout.
  // For UI mockup, we will assume backend applies it based on couponCode.
  // To be safe, let's just show couponCode text without amount if we didn't re-fetch.
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left: Checkout Steps */}
        <div className="w-full lg:w-[60%] flex flex-col gap-12">
          
          {/* STEP 1: Address */}
          <section>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-serif text-gray-200">01</span>
              <h2 className="text-2xl font-serif text-gray-900">Địa chỉ giao hàng</h2>
            </div>

            {addresses.length === 0 ? (
              <div className="bg-yellow-50 text-yellow-800 p-4 rounded mb-4 text-sm">
                Bạn chưa có địa chỉ giao hàng nào. Vui lòng thêm địa chỉ.
              </div>
            ) : (
              <div className="flex flex-col gap-4 mb-6">
                {addresses.map((addr: any) => (
                  <label 
                    key={addr.id} 
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={clsx(
                      "flex items-start p-4 border rounded-lg cursor-pointer transition-all",
                      selectedAddressId === addr.id ? "border-primary bg-gray-50" : "border-gray-200 hover:border-gray-300 bg-white"
                    )}
                  >
                    <div className="pt-1 mr-4">
                      <div className={clsx(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        selectedAddressId === addr.id ? "border-primary" : "border-gray-300"
                      )}>
                        {selectedAddressId === addr.id && <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{addr.recipientName}</span>
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-600 text-sm">{addr.phone}</span>
                        {addr.isDefault && (
                          <span className="ml-2 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">Mặc định</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {addr.addressDetail}, {addr.ward}, {addr.district}, {addr.province}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {!isAddingAddress ? (
              <button 
                onClick={() => setIsAddingAddress(true)}
                className="text-sm font-medium text-primary flex items-center gap-2 hover:underline"
              >
                <Plus size={16} /> Thêm địa chỉ mới
              </button>
            ) : (
              <form onSubmit={handleSubmit(data => addAddressMutation.mutate(data))} className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                <h3 className="font-medium text-gray-900 mb-4">Thêm địa chỉ mới</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Họ tên</label>
                    <input {...register('recipientName')} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                    {errors.recipientName && <span className="text-danger text-xs mt-1">{errors.recipientName.message}</span>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Số điện thoại</label>
                    <input {...register('phone')} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                    {errors.phone && <span className="text-danger text-xs mt-1">{errors.phone.message}</span>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Tỉnh/Thành</label>
                    <input {...register('province')} placeholder="VD: Hà Nội" className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                    {errors.province && <span className="text-danger text-xs mt-1">{errors.province.message}</span>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Quận/Huyện</label>
                    <input {...register('district')} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                    {errors.district && <span className="text-danger text-xs mt-1">{errors.district.message}</span>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Phường/Xã</label>
                    <input {...register('ward')} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                    {errors.ward && <span className="text-danger text-xs mt-1">{errors.ward.message}</span>}
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Địa chỉ cụ thể</label>
                  <input {...register('addressDetail')} placeholder="Số nhà, tên đường..." className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                  {errors.addressDetail && <span className="text-danger text-xs mt-1">{errors.addressDetail.message}</span>}
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setIsAddingAddress(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded transition-colors">Hủy</button>
                  <button type="submit" disabled={addAddressMutation.isPending} className="px-6 py-2 text-sm font-medium bg-primary text-white rounded hover:bg-gray-800 transition-colors disabled:opacity-50">Lưu địa chỉ</button>
                </div>
              </form>
            )}
          </section>

          <hr className="border-gray-100" />

          {/* STEP 2: Payment */}
          <section>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-serif text-gray-200">02</span>
              <h2 className="text-2xl font-serif text-gray-900">Phương thức thanh toán</h2>
            </div>

            <div className="flex flex-col gap-4">
              <label 
                onClick={() => setPaymentMethod('COD')}
                className={clsx(
                  "flex items-center p-4 border rounded-lg cursor-pointer transition-all",
                  paymentMethod === 'COD' ? "border-primary bg-gray-50" : "border-gray-200 hover:border-gray-300 bg-white"
                )}
              >
                <div className="mr-4">
                  <div className={clsx(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    paymentMethod === 'COD' ? "border-primary" : "border-gray-300"
                  )}>
                    {paymentMethod === 'COD' && <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>}
                  </div>
                </div>
                <Wallet size={24} className="text-gray-400 mr-4" />
                <div className="flex-1">
                  <span className="font-semibold text-gray-900 block">Thanh toán khi nhận hàng (COD)</span>
                  <span className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi đơn hàng được giao đến</span>
                </div>
              </label>

              <label 
                onClick={() => setPaymentMethod('BANK_TRANSFER')}
                className={clsx(
                  "flex items-center p-4 border rounded-lg cursor-pointer transition-all",
                  paymentMethod === 'BANK_TRANSFER' ? "border-primary bg-gray-50" : "border-gray-200 hover:border-gray-300 bg-white"
                )}
              >
                <div className="mr-4">
                  <div className={clsx(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    paymentMethod === 'BANK_TRANSFER' ? "border-primary" : "border-gray-300"
                  )}>
                    {paymentMethod === 'BANK_TRANSFER' && <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>}
                  </div>
                </div>
                <CreditCard size={24} className="text-gray-400 mr-4" />
                <div className="flex-1">
                  <span className="font-semibold text-gray-900 block">Chuyển khoản ngân hàng</span>
                  <span className="text-sm text-gray-500">Chuyển khoản qua số tài khoản hoặc quét mã QR</span>
                </div>
              </label>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* STEP 3: Notes */}
          <section>
             <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-serif text-gray-200">03</span>
              <h2 className="text-2xl font-serif text-gray-900">Ghi chú đơn hàng</h2>
            </div>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ghi chú cho người bán hoặc người giao hàng (Tùy chọn)..."
              className="w-full p-4 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary min-h-[100px] resize-y"
            ></textarea>
          </section>

        </div>

        {/* Right: Order Summary */}
        <div className="w-full lg:w-[40%] relative">
          <div className="bg-gray-50 rounded-card p-6 sm:p-8 sticky top-24">
            <h2 className="text-xl font-serif text-gray-900 mb-6">Tóm tắt đơn hàng</h2>
            
            <div className="flex flex-col gap-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {cart.items.map((item: any) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 bg-white border border-gray-100 rounded flex items-center justify-center shrink-0">
                    <img src={item.thumbnailUrl} alt={item.productName} className="w-full h-full object-contain mix-blend-multiply p-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate pr-2">{item.productName}</h4>
                    <div className="text-xs text-gray-500 mb-1">{item.colorName}</div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">SL: {item.quantity}</span>
                      <span className="font-medium text-gray-900">{formatVND(item.totalPrice)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <hr className="border-gray-200 mb-6" />

            <div className="flex flex-col gap-3 mb-6 text-sm">
              <div className="flex justify-between items-center text-gray-600">
                <span>Tạm tính</span>
                <span className="font-medium text-gray-900">{formatVND(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Phí vận chuyển</span>
                <span className="font-medium text-gray-900">Miễn phí</span>
              </div>
              {passedCoupon && (
                <div className="flex justify-between items-center text-success font-medium">
                  <span>Mã giảm giá ({passedCoupon})</span>
                  <span>Đã áp dụng</span>
                </div>
              )}
            </div>

            <hr className="border-gray-200 mb-6" />

            <div className="flex justify-between items-end mb-8">
              <span className="text-base font-medium text-gray-900">Tổng cộng</span>
              <span className="text-2xl font-bold text-gray-900">{formatVND(subtotal + shippingFee)}</span>
            </div>

            <button 
              onClick={handlePlaceOrder}
              disabled={checkoutMutation.isPending || !selectedAddressId}
              className="w-full bg-primary text-white py-4 rounded-button font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm tracking-widest relative overflow-hidden"
            >
              {checkoutMutation.isPending ? (
                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>HOÀN TẤT ĐẶT HÀNG — {formatVND(subtotal + shippingFee)}</>
              )}
            </button>

            <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-xs">
               <Lock size={12} />
               <span>Hệ thống thanh toán bảo mật</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
