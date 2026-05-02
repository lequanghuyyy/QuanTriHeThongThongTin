import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import clsx from 'clsx';
import { authApi } from '../../api/authApi';

export const CustomerDashboardLayout = () => {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/dang-nhap" state={{ from: location.pathname }} replace />;
  }

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {}
    clearAuth();
  };

  const navItems = [
    { name: 'Tổng quan', path: '/tai-khoan', icon: 'dashboard' },
    { name: 'Đơn hàng', path: '/tai-khoan/don-hang', icon: 'inventory_2' },
    { name: 'Thông tin cá nhân', path: '/tai-khoan/thong-tin', icon: 'person' },
    { name: 'Địa chỉ', path: '/tai-khoan/dia-chi', icon: 'location_on' },
    { name: 'Đánh giá của tôi', path: '/tai-khoan/danh-gia', icon: 'star' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white border border-gray-100 rounded-lg p-6 mb-6 text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 overflow-hidden border-2 border-white shadow flex items-center justify-center text-gray-500 text-2xl font-bold">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                user?.fullName.charAt(0).toUpperCase()
              )}
            </div>
            <h3 className="font-semibold text-gray-900">{user?.fullName}</h3>
            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
          </div>

          <nav className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm">
            <ul className="flex flex-col">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/tai-khoan' && location.pathname.startsWith(item.path));
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={clsx(
                        "flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors border-l-4",
                        isActive 
                          ? "bg-gray-50 text-primary border-primary" 
                          : "text-gray-600 border-transparent hover:bg-gray-50 hover:text-primary"
                      )}
                    >
                      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                      {item.name}
                    </Link>
                  </li>
                );
              })}
              <li>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-6 py-4 text-sm font-medium text-danger border-l-4 border-transparent hover:bg-danger/5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Đăng xuất
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};