import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import { formatVND } from '../../utils/formatters';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import clsx from 'clsx';

const COLORS = ['#059668', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

export const Dashboard = () => {
  const [period, setPeriod] = useState('30d');

  const { data: overviewData, error: overviewError } = useQuery({
    queryKey: ['admin-dashboard', 'overview'],
    queryFn: () => adminApi.getDashboardOverview(),
  });

  const { data: revenueData, error: revenueError } = useQuery({
    queryKey: ['admin-dashboard', 'revenue', period],
    queryFn: () => adminApi.getRevenueChart({ period }),
  });

  const { data: statusData, error: statusError } = useQuery({
    queryKey: ['admin-dashboard', 'order-status'],
    queryFn: () => adminApi.getOrderStatusChart(),
  });

  const { data: topProductsData, error: topProductsError } = useQuery({
    queryKey: ['admin-dashboard', 'top-products'],
    queryFn: () => adminApi.getTopProducts(),
  });

  const { data: lowStockData, error: lowStockError } = useQuery({
    queryKey: ['admin-dashboard', 'low-stock'],
    queryFn: () => adminApi.getLowStockAlerts(),
  });
  
  // Debug logging
  console.log('=== Dashboard Data Debug ===');
  console.log('Overview data:', overviewData);
  console.log('Overview error:', overviewError);
  console.log('Revenue data:', revenueData);
  console.log('Revenue error:', revenueError);
  console.log('Status data:', statusData);
  console.log('Status error:', statusError);
  console.log('Top products data:', topProductsData);
  console.log('Top products data type:', typeof topProductsData?.data, Array.isArray(topProductsData?.data));
  console.log('Top products error:', topProductsError);
  console.log('Low stock data:', lowStockData);
  console.log('Low stock data type:', typeof lowStockData?.data, 'has content:', lowStockData?.data?.content);
  console.log('Low stock error:', lowStockError);

  const overview = overviewData || { 
    today: { revenue: 0, orders: 0, newCustomers: 0 },
    thisMonth: { revenue: 0, orders: 0, newCustomers: 0 },
    thisYear: { revenue: 0, orders: 0, newCustomers: null },
    pendingOrders: 0,
    lowStockProducts: 0
  };
  
  console.log('Processed overview:', overview);
  
  // Revenue chart data - axios already unwrapped to { data: [...] }
  const revenueChart = revenueData?.data || [];
  console.log('Processed revenueChart:', revenueChart);
  
  // Transform status chart from { PENDING: 5, CONFIRMED: 10 } to [{ status, count }]
  const statusChart = statusData ? Object.entries(statusData).map(([status, count]) => ({
    status,
    count
  })) : [];
  console.log('Processed statusChart:', statusChart);
  
  // Transform top products data - axios already unwrapped to array
  const topProducts = Array.isArray(topProductsData) 
    ? topProductsData.map((item: any) => ({
        id: item.product?.id,
        name: item.product?.name,
        imageUrl: item.product?.thumbnailUrl,
        soldCount: item.totalSold,
        revenue: item.totalRevenue
      }))
    : [];
  console.log('Processed topProducts:', topProducts);
  
  // Transform low stock alerts - axios unwrapped to Page object with content array
  const lowStockAlerts = Array.isArray(lowStockData?.content)
    ? lowStockData.content.map((item: any) => ({
        id: item.variantId,
        name: item.productName,
        variantName: item.variantName,
        sku: item.sku,
        stockQuantity: item.stockQuantity,
        imageUrl: item.thumbnailUrl
      }))
    : [];
  console.log('Processed lowStockAlerts:', lowStockAlerts);

  return (
    <div className="p-8 animate-fade-in space-y-8 font-sans">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-sans font-bold text-gray-900 mb-2">Executive Overview</h1>
          <p className="text-gray-500">Tóm tắt hoạt động kinh doanh và hiệu suất.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between">
           <div>
             <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">Doanh thu hôm nay</p>
             <h3 className="text-2xl font-sans font-bold text-gray-900">{formatVND(overview.today.revenue)}</h3>
           </div>
           <div className="w-12 h-12 bg-green-50 text-success rounded-full flex items-center justify-center">
             <span className="material-symbols-outlined text-[24px]">trending_up</span>
           </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between">
           <div>
             <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">Đơn hàng hôm nay</p>
             <h3 className="text-2xl font-sans font-bold text-gray-900">{overview.today.orders}</h3>
           </div>
           <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
             <span className="material-symbols-outlined text-[24px]">shopping_bag</span>
           </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between">
           <div>
             <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">Khách mới</p>
             <h3 className="text-2xl font-sans font-bold text-gray-900">{overview.today.newCustomers || 0}</h3>
           </div>
           <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center">
             <span className="material-symbols-outlined text-[24px]">group</span>
           </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between border-l-4 border-l-orange-500">
           <div>
             <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">Chờ xử lý</p>
             <h3 className="text-2xl font-sans font-bold text-orange-500">{overview.pendingOrders}</h3>
           </div>
           <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center">
             <span className="material-symbols-outlined text-[24px]">error</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-sans font-semibold text-gray-900 uppercase tracking-widest text-sm">Biểu đồ doanh thu</h2>
            <div className="flex gap-2">
              {['7d', '30d', '3m', '12m'].map(p => (
                <button 
                  key={p} 
                  onClick={() => setPeriod(p)}
                  className={clsx(
                    "px-3 py-1 text-xs font-medium rounded transition-colors",
                    period === p ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {p === '7d' ? '7 Ngày' : p === '30d' ? '30 Ngày' : p === '3m' ? '3 Tháng' : '12 Tháng'}
                </button>
              ))}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#888', fontFamily: 'Inter, sans-serif' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(val) => `${val / 1000000}M`} tick={{ fontSize: 12, fill: '#888', fontFamily: 'Inter, sans-serif' }} axisLine={false} tickLine={false} />
                <RechartsTooltip formatter={(value) => formatVND(Number(value))} labelStyle={{ color: '#333', fontFamily: 'Inter, sans-serif' }} contentStyle={{ fontFamily: 'Inter, sans-serif' }} />
                <Line type="monotone" dataKey="revenue" stroke="#000" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Pie Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex flex-col">
          <h2 className="font-sans font-semibold text-gray-900 uppercase tracking-widest text-sm mb-6">Trạng thái đơn hàng</h2>
          <div className="flex-1 min-h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="status"
                >
                  {statusChart.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ fontFamily: 'Inter, sans-serif' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontFamily: 'Inter, sans-serif' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <h2 className="font-sans font-semibold text-gray-900 uppercase tracking-widest text-sm mb-6">Top sản phẩm bán chạy (Tháng)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3 rounded-l">Sản phẩm</th>
                  <th className="px-4 py-3 text-right">Đã bán</th>
                  <th className="px-4 py-3 text-right rounded-r">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product: any) => (
                  <tr key={product.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded border border-gray-100 flex-shrink-0">
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain mix-blend-multiply p-1" />
                      </div>
                      <span className="font-medium text-gray-900 truncate max-w-[200px]" title={product.name}>{product.name}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{product.soldCount}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{formatVND(product.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {topProducts.length === 0 && <div className="text-center py-6 text-gray-500 text-sm">Chưa có dữ liệu</div>}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-sm text-white">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-sans font-semibold text-white uppercase tracking-widest text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-orange-400">error</span> Cảnh báo tồn kho
            </h2>
          </div>
          <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
            {lowStockAlerts.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">Kho hàng đang ổn định</div>
            ) : (
              lowStockAlerts.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center bg-gray-800 p-4 rounded border border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded flex-shrink-0">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain mix-blend-multiply p-1" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-100 text-sm line-clamp-1">{item.name}</div>
                      <div className="text-xs text-gray-400">SKU: {item.sku} | {item.variantName}</div>
                    </div>
                  </div>
                  <div className="bg-danger/20 text-red-400 px-3 py-1 rounded text-xs font-bold whitespace-nowrap">
                    CÒN {item.stockQuantity}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};