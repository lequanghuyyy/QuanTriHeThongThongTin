import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
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
    return <div className="p-8 text-center min-h-[60vh] flex items-center justify-center font-sans">Đang tải thông tin...</div>;
  }

  const cart = cartData;
  const addresses = addressesData || [];

  if (!cart || cart.items.length === 0) {
    return <Navigate to="/gio-hang" replace />;
  }

  const handlePlaceOrder = () => {
    if (addresses.length === 0 && !isAddingAddress) {
      toast.error("Vui lòng thêm địa chỉ giao hàng");
      return;
    }
    if (!selectedAddressId && !isAddingAddress) {
      toast.error("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    const payload: CheckoutRequest = {
      addressId: selectedAddressId!,
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
  const shippingFee = 35000;
  const discount = 0;
  const total = subtotal + shippingFee - discount;
  
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-gray-900 bg-[#fafafa] min-h-screen">
      
      <div className="mb-10 mt-4">
        <h1 className="text-2xl font-bold text-center">Thanh Toán</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 xl:gap-16 items-start">
        {/* Left: Checkout Steps */}
        <div className="w-full lg:w-[60%] flex flex-col gap-10">
          
          {/* STEP 1: Address */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-lg font-bold">01</span>
              <h2 className="text-lg font-bold">Thông Tin Thanh Toán</h2>
            </div>

            {/* Address List Selection */}
            {addresses.length > 0 && !isAddingAddress ? (
              <div className="flex flex-col gap-3 mb-6">
                {addresses.map((addr: any) => (
                  <label key={addr.id} className={clsx(
                    "flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all bg-white",
                    selectedAddressId === addr.id ? "border-black" : "border-gray-200 hover:border-gray-300"
                  )}>
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm">{addr.recipientName}</span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-600 text-sm">{addr.phone}</span>
                        {addr.isDefault && (
                          <span className="ml-2 text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded uppercase">Mặc định</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {addr.addressDetail}, {addr.ward}, {addr.district}, {addr.province}
                      </p>
                    </div>
                    {selectedAddressId === addr.id ? (
                      <span className="material-symbols-outlined text-black text-[20px]">radio_button_checked</span>
                    ) : (
                      <span className="material-symbols-outlined text-gray-300 text-[20px]">radio_button_unchecked</span>
                    )}
                  </label>
                ))}
                <button 
                  onClick={() => setIsAddingAddress(true)}
                  className="mt-2 text-sm font-bold text-black flex items-center gap-2 hover:underline w-fit"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span> Thêm địa chỉ mới
                </button>
              </div>
            ) : (
              /* Add New Address Form */
              <form id="address-form" onSubmit={handleSubmit(data => addAddressMutation.mutate(data))} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-2">Họ Tên</label>
                  <input {...register('recipientName')} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black transition-colors" placeholder="Nguyễn Văn A" />
                  {errors.recipientName && <span className="text-red-500 text-xs mt-1">{errors.recipientName.message}</span>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-2">Số Điện Thoại</label>
                  <input {...register('phone')} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black transition-colors" placeholder="0901234567" />
                  {errors.phone && <span className="text-red-500 text-xs mt-1">{errors.phone.message}</span>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-2">Địa Chỉ</label>
                  <input {...register('addressDetail')} placeholder="123, Đường Trần Hưng Đạo..." className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black transition-colors" />
                  {errors.addressDetail && <span className="text-red-500 text-xs mt-1">{errors.addressDetail.message}</span>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-2">Tỉnh/Thành Phố</label>
                    <input {...register('province')} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black transition-colors" placeholder="Thành phố Hồ Chí Minh" />
                    {errors.province && <span className="text-red-500 text-xs mt-1">{errors.province.message}</span>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-2">Quận/Huyện</label>
                    <input {...register('district')} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black transition-colors" placeholder="Quận 1" />
                    {errors.district && <span className="text-red-500 text-xs mt-1">{errors.district.message}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-2">Xã/Phường</label>
                    <input {...register('ward')} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black transition-colors" placeholder="Phường Phạm Ngũ Lão" />
                    {errors.ward && <span className="text-red-500 text-xs mt-1">{errors.ward.message}</span>}
                  </div>
                </div>

                {addresses.length > 0 && (
                  <div className="flex justify-end gap-3 mt-2">
                    <button type="button" onClick={() => setIsAddingAddress(false)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-black">Hủy</button>
                    <button type="submit" disabled={addAddressMutation.isPending} className="px-6 py-2.5 text-sm font-bold bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50">Lưu địa chỉ</button>
                  </div>
                )}
              </form>
            )}

            {/* Note input placed outside form so it's always visible */}
            {!isAddingAddress && (
              <div className="mt-4">
                <label className="block text-xs font-bold text-gray-800 mb-2">Ghi Chú Đơn Hàng</label>
                <input 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black transition-colors" 
                  placeholder="Ghi chú thêm về đơn hàng..." 
                />
              </div>
            )}
          </section>

          {/* STEP 2: Shipping */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-lg font-bold">02</span>
              <h2 className="text-lg font-bold">Phương Thức Vận Chuyển</h2>
            </div>
            <label className="flex items-center justify-between p-4 border border-black rounded-lg cursor-pointer bg-white">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-600 text-[20px]">local_shipping</span>
                <span className="font-medium text-sm text-gray-900">Giao hàng tiêu chuẩn</span>
              </div>
              <span className="material-symbols-outlined text-black text-[20px]">radio_button_checked</span>
            </label>
          </section>

          {/* STEP 3: Payment */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-lg font-bold">03</span>
              <h2 className="text-lg font-bold">Phương Thức Thanh Toán</h2>
            </div>

            <div className="flex flex-col gap-3">
              <label className={clsx(
                "flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all bg-white",
                paymentMethod === 'COD' ? "border-black" : "border-gray-200 hover:border-gray-300"
              )} onClick={() => setPaymentMethod('COD')}>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-600 text-[20px]">account_balance_wallet</span>
                  <span className="font-medium text-sm text-gray-900">Thanh toán khi nhận hàng (COD)</span>
                </div>
                {paymentMethod === 'COD' ? (
                  <span className="material-symbols-outlined text-black text-[20px]">radio_button_checked</span>
                ) : (
                  <span className="material-symbols-outlined text-gray-300 text-[20px]">radio_button_unchecked</span>
                )}
              </label>

              <label className={clsx(
                "flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all bg-white",
                paymentMethod === 'BANK_TRANSFER' ? "border-black" : "border-gray-200 hover:border-gray-300"
              )} onClick={() => setPaymentMethod('BANK_TRANSFER')}>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-600 text-[20px]">credit_card</span>
                  <span className="font-medium text-sm text-gray-900">Thẻ tín dụng / Thẻ ghi nợ / VNPay QR / CK Ngân hàng</span>
                </div>
                {paymentMethod === 'BANK_TRANSFER' ? (
                  <span className="material-symbols-outlined text-black text-[20px]">radio_button_checked</span>
                ) : (
                  <span className="material-symbols-outlined text-gray-300 text-[20px]">radio_button_unchecked</span>
                )}
              </label>
            </div>
          </section>

        </div>

        {/* Right: Order Summary */}
        <div className="w-full lg:w-[40%] relative">
          <div className="bg-[#E8E8E8] rounded-[16px] p-6 sm:p-8 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Tổng quan đơn hàng</h2>
            
            {/* Items List */}
            <div className="flex flex-col gap-5 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar mt-6">
              {cart.items.map((item: any) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                    <img src={item.thumbnailUrl} alt={item.productName} className="w-[80%] h-[80%] object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 truncate pr-2 mb-1 leading-tight">{item.productName}</h4>
                    <div className="text-[11px] text-gray-500 mb-1">Màu sắc: {item.colorName}</div>
                    <div className="text-[11px] text-gray-500">Số lượng: {item.quantity}</div>
                  </div>
                  <div className="text-sm font-bold text-gray-900 shrink-0">
                    {formatVND(item.totalPrice)}
                  </div>
                </div>
              ))}
            </div>

            <hr className="border-gray-300 mb-5" />

            

            {/* Cost Breakdown */}
            <div className="flex flex-col gap-3 mb-5 text-xs">
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-medium">Tạm Tính</span>
                <span className="font-bold text-gray-900">{formatVND(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span className="font-medium">Phí Vận Chuyển</span>
                <span className="font-bold text-gray-900">{formatVND(shippingFee)}</span>
              </div>
            </div>

            <hr className="border-gray-300 mb-5" />

            {/* Total */}
            <div className="flex justify-between items-center mb-8">
              <span className="text-sm font-bold text-gray-900">Tổng Cộng</span>
              <span className="text-lg font-bold text-gray-900">{formatVND(total)}</span>
            </div>

            {/* Submit Button */}
            {/* Submit Button */}
            <button 
              onClick={() => {
                // Form hiển thị khi người dùng chủ động thêm mới HOẶC khi chưa có địa chỉ nào
                const isShowingForm = isAddingAddress || addresses.length === 0;

                if (isShowingForm) {
                  const form = document.getElementById('address-form') as HTMLFormElement;
                  if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                } else {
                  handlePlaceOrder();
                }
              }}
              // Chỉ khóa nút khi đang gọi API để tránh spam click
              disabled={checkoutMutation.isPending || addAddressMutation.isPending}
              className="w-full bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-wide"
            >
              {checkoutMutation.isPending || addAddressMutation.isPending ? (
                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>HOÀN TẤT ĐƠN HÀNG</>
              )}
            </button>
            
          </div>
        </div>

      </div>
    </div>
  );
};