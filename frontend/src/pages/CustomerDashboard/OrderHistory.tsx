import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '../../api/orderApi';
import { reviewApi } from '../../api/reviewApi';
import type { OrderStatus, OrderSummary, OrderItem } from '../../types/order.types';
import { formatVND, formatDate, formatOrderStatus, getOrderStatusColor } from '../../utils/formatters';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { Package, X } from 'lucide-react';
import { useForm } from 'react-hook-form';

// Mock toast
const toast = {
  success: (msg: string) => alert(msg),
  error: (msg: string) => alert(msg)
};

const tabs = [
  { label: 'Tất cả', value: undefined },
  { label: 'Chờ xác nhận', value: 'PENDING' },
  { label: 'Đang xử lý', value: 'PROCESSING' },
  { label: 'Đang giao', value: 'SHIPPING' },
  { label: 'Đã giao', value: 'DELIVERED' },
  { label: 'Đã hủy', value: 'CANCELLED' },
];

export const OrderHistory = () => {
  const [activeTab, setActiveTab] = useState<OrderStatus | undefined>(undefined);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Review Modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [itemToReview, setItemToReview] = useState<OrderItem | null>(null);

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders', page, activeTab],
    queryFn: () => orderApi.getMyOrders({ page: page - 1, size: 10, status: activeTab }),
  });

  const cancelMutation = useMutation({
    mutationFn: (orderCode: string) => orderApi.cancel(orderCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success("Đã hủy đơn hàng thành công");
    },
    onError: () => toast.error("Không thể hủy đơn hàng này")
  });

  const handleCancel = (orderCode: string) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
      cancelMutation.mutate(orderCode);
    }
  };

  const openReviewModal = (item: OrderItem) => {
    setItemToReview(item);
    setReviewModalOpen(true);
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-serif text-gray-900 mb-6">Lịch sử đơn hàng</h1>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm mb-6">
        <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => { setActiveTab(tab.value as OrderStatus | undefined); setPage(1); }}
              className={clsx(
                "px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                activeTab === tab.value 
                  ? "border-primary text-primary" 
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Đang tải đơn hàng...</div>
          ) : ordersData?.content.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center">
              <Package size={48} className="text-gray-200 mb-4" />
              <p className="text-gray-500">Bạn chưa có đơn hàng nào.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {ordersData?.content.map((order: OrderSummary) => (
                <div key={order.id} className="border border-gray-100 rounded-lg p-6 hover:shadow-sm transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                    <div>
                      <span className="font-semibold text-gray-900">#{order.orderCode}</span>
                      <span className="text-gray-400 mx-2">|</span>
                      <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                    </div>
                    <span className={clsx("px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider", getOrderStatusColor(order.status))}>
                      {formatOrderStatus(order.status)}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      Số lượng sản phẩm: <span className="font-medium">{order.itemCount}</span>
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-gray-100 gap-4">
                    <div className="text-sm">
                      <span className="text-gray-500">Thành tiền: </span>
                      <span className="text-lg font-bold text-gray-900">{formatVND(order.totalAmount)}</span>
                    </div>
                    
                    <div className="flex gap-3">
                      {order.status === 'PENDING' && (
                        <button 
                          onClick={() => handleCancel(order.orderCode)}
                          className="px-4 py-2 text-sm font-medium text-danger border border-danger hover:bg-danger/5 rounded transition-colors"
                        >
                          Hủy đơn
                        </button>
                      )}
                      <Link 
                        to={`/tai-khoan/don-hang/${order.orderCode}`}
                        className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination (if applicable) */}
              {ordersData && ordersData.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {[...Array(ordersData.totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={clsx(
                        "w-8 h-8 rounded text-sm font-medium transition-colors",
                        page === i + 1 ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewModalOpen && itemToReview && (
        <ReviewModal 
          item={itemToReview} 
          onClose={() => setReviewModalOpen(false)} 
        />
      )}
    </div>
  );
};

// Review Modal Component
const ReviewModal = ({ item, onClose }: { item: OrderItem, onClose: () => void }) => {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const reviewMutation = useMutation({
    mutationFn: (data: any) => reviewApi.createReview({ 
      orderItemId: item.id, 
      rating, 
      title: data.title, 
      content: data.content 
    }),
    onSuccess: () => {
      toast.success("Cảm ơn bạn đã đánh giá!");
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      // Invalidate product reviews if necessary
      onClose();
    },
    onError: () => toast.error("Không thể gửi đánh giá")
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="font-serif text-xl text-gray-900">Đánh giá sản phẩm</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <img src={item.productVariant.imageUrl ?? undefined} alt="" className="w-16 h-16 object-contain bg-gray-50 border rounded" />
            <div>
              <p className="font-medium text-sm text-gray-900">{item.productName}</p>
              <p className="text-xs text-gray-500">{item.variantName}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(data => reviewMutation.mutate(data))} className="space-y-4">
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map(star => (
                <button 
                  key={star} 
                  type="button" 
                  onClick={() => setRating(star)}
                  className={clsx("text-3xl focus:outline-none transition-colors", star <= rating ? "text-yellow-400" : "text-gray-200")}
                >
                  ★
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Tiêu đề đánh giá</label>
              <input 
                {...register("title", { required: "Vui lòng nhập tiêu đề" })} 
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="Tóm tắt ngắn gọn..."
              />
              {errors.title && <p className="text-xs text-danger mt-1">{errors.title.message as string}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Chi tiết trải nghiệm</label>
              <textarea 
                {...register("content", { required: "Vui lòng nhập nội dung" })} 
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary min-h-[100px]"
                placeholder="Bạn có hài lòng về sản phẩm này không?"
              ></textarea>
              {errors.content && <p className="text-xs text-danger mt-1">{errors.content.message as string}</p>}
            </div>

            <button 
              type="submit"
              disabled={reviewMutation.isPending}
              className="w-full bg-primary text-white py-3 rounded font-medium hover:bg-gray-800 transition-colors mt-2"
            >
              Gửi đánh giá
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
