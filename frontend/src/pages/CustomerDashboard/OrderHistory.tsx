import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '../../api/orderApi';
import type { OrderStatus, OrderSummary } from '../../types/order.types';
import { formatVND, formatDate, formatOrderStatus, getOrderStatusColor } from '../../utils/formatters';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { Package } from 'lucide-react';
import { toast } from '../../utils/toast';

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

  // Review Modal state - removed unused variables

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

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Lịch sử đơn hàng</h1>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm mt-8">
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
    </div>
  );
};
