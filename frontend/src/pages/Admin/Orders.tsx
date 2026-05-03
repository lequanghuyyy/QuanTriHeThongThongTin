import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import { formatVND, formatDate, formatOrderStatus, getOrderStatusColor } from '../../utils/formatters';
import { Search, Eye, X, Save, Truck, CreditCard } from 'lucide-react';
import clsx from 'clsx';
import type { OrderStatus } from '../../types/order.types';
import { useForm } from 'react-hook-form';

// Mock toast
const toast = {
  success: (msg: string) => alert(msg),
  error: (msg: string) => alert(msg)
};

const statusOptions = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

export const Orders = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['admin-orders', page, search, statusFilter],
    queryFn: () => adminApi.getOrders({ page: page - 1, size: 10, keyword: search, status: statusFilter || undefined }),
  });

  const { register, handleSubmit, reset } = useForm();

  const updateStatusMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateOrderStatus(selectedOrder.orderCode, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success("Cập nhật đơn hàng thành công");
      setDrawerOpen(false);
    }
  });
  
  // Helper to parse shippingAddress
  const parseShippingAddress = (address: any) => {
    if (typeof address === 'string') {
      try {
        return JSON.parse(address);
      } catch {
        return null;
      }
    }
    return address;
  };

  const openDrawer = (order: any) => {
    setSelectedOrder(order);
    reset({
      status: order.status,
      trackingCode: order.trackingCode || '',
      note: order.note || ''
    });
    setDrawerOpen(true);
  };

  const orders = ordersData?.content || [];

  return (
    <div className="p-8 animate-fade-in relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Quản Lý Đơn Hàng</h1>
          <p className="text-gray-500 text-sm">Theo dõi và xử lý đơn đặt hàng từ khách.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm mã đơn, email khách..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary flex-1 sm:flex-none"
            >
              <option value="">Tất cả trạng thái</option>
              {statusOptions.map(s => <option key={s} value={s}>{formatOrderStatus(s as OrderStatus)}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-white border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium">Mã Đơn</th>
                <th className="px-6 py-4 font-medium">Khách hàng</th>
                <th className="px-6 py-4 font-medium">Ngày đặt</th>
                <th className="px-6 py-4 font-medium text-right">Tổng tiền</th>
                <th className="px-6 py-4 font-medium text-center">TT Đơn</th>
                <th className="px-6 py-4 font-medium text-center">TT Thanh toán</th>
                <th className="px-6 py-4 font-medium text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-500">Không tìm thấy đơn hàng nào.</td></tr>
              ) : (
                orders.map((order: any) => {
                  const shippingAddr = parseShippingAddress(order.shippingAddress);
                  return (
                  <tr key={order.orderCode} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => openDrawer(order)}>
                    <td className="px-6 py-4 font-semibold text-gray-900">#{order.orderCode}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{shippingAddr?.recipientName || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{shippingAddr?.phone || ''}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(order.createdAt)}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">{formatVND(order.totalAmount)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={clsx("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap", getOrderStatusColor(order.status))}>
                        {formatOrderStatus(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={clsx("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap", order.paymentStatus === 'PAID' ? "bg-success/10 text-success" : "bg-orange-100 text-orange-600")}>
                        {order.paymentStatus === 'PAID' ? 'Đã thu' : 'Chưa thu'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="p-1.5 text-gray-400 hover:text-primary transition-colors" onClick={(e) => { e.stopPropagation(); openDrawer(order); }}>
                         <Eye size={18} />
                       </button>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {ordersData && ordersData.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-white">
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

      {/* Detail Drawer */}
      {drawerOpen && selectedOrder && (() => {
        const shippingAddr = parseShippingAddress(selectedOrder.shippingAddress);
        return (
        <>
          <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 transition-opacity" onClick={() => setDrawerOpen(false)}></div>
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out border-l border-gray-100">
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <div>
                 <h3 className="font-serif text-xl text-gray-900">Chi tiết #{selectedOrder.orderCode}</h3>
                 <p className="text-xs text-gray-500 mt-1">{formatDate(selectedOrder.createdAt)}</p>
               </div>
               <button onClick={() => setDrawerOpen(false)} className="text-gray-400 hover:text-gray-600 p-2"><X size={20} /></button>
             </div>

             <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
                {/* Form Update */}
                <form id="update-order-form" onSubmit={handleSubmit(data => updateStatusMutation.mutate(data))} className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                  <h4 className="font-medium text-gray-900 text-sm flex items-center gap-2"><Truck size={16}/> Cập nhật trạng thái</h4>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Trạng thái đơn</label>
                    <select {...register('status')} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary bg-white">
                      {statusOptions.map(s => <option key={s} value={s}>{formatOrderStatus(s as OrderStatus)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Mã vận đơn (Tracking Code)</label>
                    <input type="text" {...register('trackingCode')} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary bg-white" placeholder="VD: GHTK123456" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Ghi chú nội bộ</label>
                    <textarea {...register('note')} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary bg-white min-h-[80px]" placeholder="Ghi chú về đơn hàng..."></textarea>
                  </div>
                </form>

                {/* Customer Info */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 border-b pb-2 text-sm">Thông tin khách hàng</h4>
                  <div className="text-sm space-y-2">
                    <p><span className="text-gray-500">Người nhận:</span> <span className="font-medium">{shippingAddr?.recipientName || 'N/A'}</span></p>
                    <p><span className="text-gray-500">Điện thoại:</span> <span>{shippingAddr?.phone || 'N/A'}</span></p>
                    <p><span className="text-gray-500">Địa chỉ:</span> <span>{shippingAddr?.addressDetail}, {shippingAddr?.ward}, {shippingAddr?.district}, {shippingAddr?.province}</span></p>
                  </div>
                </div>

                {/* Payment Info */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 border-b pb-2 text-sm flex items-center gap-2"><CreditCard size={16}/> Thanh toán</h4>
                  <div className="text-sm space-y-2">
                    <p className="flex justify-between"><span className="text-gray-500">Hình thức:</span> <span className="font-medium">{selectedOrder.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản'}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Tạm tính:</span> <span>{formatVND(selectedOrder.subtotal)}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Phí Ship:</span> <span>{formatVND(selectedOrder.shippingFee)}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Giảm giá:</span> <span className="text-success">-{formatVND(selectedOrder.discount)}</span></p>
                    <div className="border-t pt-2 flex justify-between font-bold text-base">
                      <span>Tổng thu:</span> <span className="text-primary">{formatVND(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 border-b pb-2 text-sm">Sản phẩm ({selectedOrder.items?.length})</h4>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item: any) => (
                      <div key={item.id} className="flex gap-3 text-sm">
                        <div className="w-12 h-12 bg-gray-50 rounded border flex-shrink-0 p-1">
                           <img src={item.imageUrl} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{item.productName}</p>
                          <p className="text-gray-500 text-xs">{item.variantName}</p>
                          <p className="text-gray-500 text-xs">{formatVND(item.unitPrice)} x {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
             </div>

             <div className="px-6 py-4 border-t border-gray-100 bg-white">
                <button 
                  type="submit" 
                  form="update-order-form"
                  disabled={updateStatusMutation.isPending}
                  className="w-full bg-primary text-white py-3 rounded font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  <Save size={18} /> {updateStatusMutation.isPending ? 'Đang cập nhật...' : 'Lưu cập nhật'}
                </button>
             </div>
          </div>
        </>
        );
      })()}
    </div>
  );
};
