import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../../api/orderApi';
import { Link } from 'react-router-dom';

export const Overview = () => {

  const { data: ordersData } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderApi.getMyOrders({ page: 1, size: 5 }),
  });

  const recentOrders = ordersData?.content || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tăng mb-5 lên mb-8 và thêm font-sans font-bold */}
      <h1 className="text-2xl font-sans font-bold text-gray-900 mb-8">Tổng quan tài khoản</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        {/* Card: Đơn hàng */}
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[20px]">inventory_2</span>
          </div>
          <h3 className="font-sans font-bold text-gray-900 mb-1">Đơn hàng của bạn</h3>
          <p className="text-sm text-gray-500 mb-4">Kiểm tra trạng thái và lịch sử đơn hàng</p>
          <Link to="/tai-khoan/don-hang" className="text-sm text-primary font-medium hover:underline">Xem đơn hàng &rarr;</Link>
        </div>
        
        {/* Card: Địa chỉ */}
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[20px]">location_on</span>
          </div>
          <h3 className="font-sans font-bold text-gray-900 mb-1">Sổ địa chỉ</h3>
          <p className="text-sm text-gray-500 mb-4">Quản lý địa chỉ nhận hàng của bạn</p>
          <Link to="/tai-khoan/dia-chi" className="text-sm text-primary font-medium hover:underline">Quản lý địa chỉ &rarr;</Link>
        </div>
        
        {/* Card: Thông tin cá nhân */}
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[20px]">person</span>
          </div>
          <h3 className="font-sans font-bold text-gray-900 mb-1">Thông tin cá nhân</h3>
          <p className="text-sm text-gray-500 mb-4">Cập nhật thông tin và bảo mật</p>
          <Link to="/tai-khoan/thong-tin" className="text-sm text-primary font-medium hover:underline">Cập nhật ngay &rarr;</Link>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-sans font-bold text-gray-900">Đơn hàng gần đây</h2>
          <Link to="/tai-khoan/don-hang" className="text-sm text-gray-500 hover:text-primary">Xem tất cả</Link>
        </div>
        <div className="p-6">
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">Bạn chưa có đơn hàng nào.</p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                  <div>
                    <div className="font-medium text-gray-900">#{order.orderCode}</div>
                    <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</div>
                  </div>
                  <Link to={`/tai-khoan/don-hang/${order.orderCode}`} className="text-sm border border-gray-200 px-3 py-1.5 rounded hover:border-primary hover:text-primary transition-colors">
                    Chi tiết
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};