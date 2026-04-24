import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../../api/orderApi';
import { formatVND, formatDate } from '../../utils/formatters';
import { CheckCircle2, Package, Truck, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';

const steps = [
  { status: 'PENDING', label: 'Đặt hàng' },
  { status: 'CONFIRMED', label: 'Đã xác nhận' },
  { status: 'PROCESSING', label: 'Đang xử lý' },
  { status: 'SHIPPING', label: 'Đang giao' },
  { status: 'DELIVERED', label: 'Thành công' },
];

export const OrderDetail = () => {
  const { orderCode } = useParams();
  const location = useLocation();
  const [showConfetti, setShowConfetti] = useState(false);

  const { data: orderData, isLoading } = useQuery({
    queryKey: ['order', orderCode],
    queryFn: () => orderApi.getByCode(orderCode!),
    enabled: !!orderCode,
  });

  useEffect(() => {
    if (location.state?.isNewOrder) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  if (isLoading) return <div className="py-12 text-center text-gray-500">Đang tải chi tiết đơn hàng...</div>;
  if (!orderData) return <div className="py-12 text-center text-danger">Không tìm thấy đơn hàng.</div>;

  const order = orderData;

  // Determine current step index
  let currentStepIndex = steps.findIndex(s => s.status === order.status);
  if (order.status === 'CANCELLED' || order.status === 'REFUNDED') {
    currentStepIndex = -1; // Specific handling for cancelled
  }

  return (
    <div className="animate-fade-in relative">
      {/* Confetti overlay simulation */}
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="text-center animate-bounce">
             <div className="text-6xl mb-4">🎉</div>
             <h2 className="text-3xl font-serif text-success font-bold">ĐẶT HÀNG THÀNH CÔNG!</h2>
             <p className="text-gray-500 mt-2">Cảm ơn bạn đã mua sắm tại HMK Eyewear.</p>
          </div>
        </div>
      )}

      <Link to="/tai-khoan/don-hang" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-6 transition-colors">
        <ArrowLeft size={16} /> Quay lại danh sách
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-serif text-gray-900">Chi tiết đơn hàng #{order.orderCode}</h1>
          <p className="text-sm text-gray-500 mt-1">Đặt ngày {formatDate(order.createdAt)}</p>
        </div>
        {order.status === 'CANCELLED' && (
          <span className="bg-danger/10 text-danger px-4 py-2 rounded-full font-medium text-sm">Đã hủy</span>
        )}
      </div>

      {/* Stepper */}
      {order.status !== 'CANCELLED' && order.status !== 'REFUNDED' && (
        <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm mb-8">
          <div className="relative flex justify-between items-center max-w-3xl mx-auto">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded"></div>
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded transition-all duration-1000"
              style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
            ></div>
            
            {steps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isActive = index === currentStepIndex;
              return (
                <div key={step.status} className="relative z-10 flex flex-col items-center">
                  <div className={clsx(
                    "w-10 h-10 rounded-full flex items-center justify-center border-4 border-white transition-colors duration-500",
                    isCompleted ? "bg-primary text-white" : "bg-gray-200 text-gray-400"
                  )}>
                    {isCompleted ? <CheckCircle2 size={20} /> : <div className="w-2.5 h-2.5 bg-current rounded-full"></div>}
                  </div>
                  <span className={clsx(
                    "absolute top-12 text-xs font-medium whitespace-nowrap transition-colors",
                    isActive ? "text-primary font-bold" : isCompleted ? "text-gray-900" : "text-gray-400"
                  )}>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-12 text-center">
            {order.trackingCode && (
              <p className="text-sm text-gray-600 bg-gray-50 inline-block px-4 py-2 rounded">
                Mã vận đơn: <span className="font-semibold text-primary">{order.trackingCode}</span>
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Items & Payment */}
        <div className="md:col-span-2 space-y-8">
          <section className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2"><Package size={18}/> Sản phẩm</h3>
            <div className="space-y-4">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex gap-4 items-center pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded p-1 shrink-0">
                    <img src={item.productVariant.imageUrl} alt={item.productName} className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900">{item.productName}</h4>
                    <p className="text-sm text-gray-500 mt-1">{item.variantName}</p>
                    <p className="text-sm text-gray-500 mt-1">{formatVND(item.unitPrice)} x {item.quantity}</p>
                  </div>
                  <div className="font-medium text-gray-900 text-right">
                    {formatVND(item.totalPrice)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-6">Tóm tắt thanh toán</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span className="font-medium text-gray-900">{formatVND(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span className="font-medium text-gray-900">{formatVND(order.shippingFee)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Giảm giá {order.couponCode ? `(${order.couponCode})` : ''}</span>
                  <span className="font-medium">-{formatVND(order.discount)}</span>
                </div>
              )}
              <hr className="border-gray-100 my-2" />
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Tổng cộng</span>
                <span className="text-xl font-bold text-primary">{formatVND(order.totalAmount)}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-gray-500">Phương thức thanh toán</span>
                <span className="font-medium text-gray-900">{order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản'}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-500">Trạng thái thanh toán</span>
                <span className={clsx("font-medium", order.paymentStatus === 'PAID' ? "text-success" : "text-orange-500")}>
                  {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Right: Shipping Info */}
        <div className="space-y-8">
          <section className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Truck size={18}/> Giao hàng đến</h3>
            <div className="text-sm space-y-2">
              <p className="font-medium text-gray-900">{order.shippingAddress.recipientName}</p>
              <p className="text-gray-600">{order.shippingAddress.phone}</p>
              <p className="text-gray-600 leading-relaxed mt-2">
                {order.shippingAddress.addressDetail}<br/>
                {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.province}
              </p>
            </div>
          </section>

          {order.note && (
             <section className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
               <h3 className="font-semibold text-gray-900 mb-2">Ghi chú</h3>
               <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded">{order.note}</p>
             </section>
          )}
        </div>
      </div>
    </div>
  );
};
