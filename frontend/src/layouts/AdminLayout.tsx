import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/authApi';
import logoUrl from "../assets/logo1.png";

export const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error(error);
    } finally {
      clearAuth();
      navigate('/dang-nhap');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full flex flex-col z-20">
        <div className="p-6 border-b border-gray-200">
          <Link to="/" className="flex flex-col items-center">
            <img 
          src={logoUrl} // Sử dụng biến đã import ở Bước 1
          alt="HMK Eyewear Logo" 
          className="h-30 w-auto object-contain" // Đặt chiều cao (h-10 tương đương 40px), w-auto để giữ tỷ lệ
        />
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-gray-100 text-gray-700 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[18px]">dashboard</span> Tổng quan
          </Link>
          <Link to="/admin/san-pham" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-gray-100 text-gray-700 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[18px]">inventory_2</span> Sản phẩm
          </Link>
          <Link to="/admin/don-hang" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-gray-100 text-gray-700 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[18px]">shopping_cart</span> Đơn hàng
          </Link>
          <Link to="/admin/danh-muc" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-gray-100 text-gray-700 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[18px]">sell</span> Danh mục
          </Link>
          <Link to="/admin/bo-suu-tap" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-gray-100 text-gray-700 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[18px]">collections</span> Bộ sưu tập
          </Link>
          <Link to="/admin/nguoi-dung" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-gray-100 text-gray-700 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[18px]">group</span> Người dùng
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <Link to="/" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mb-2">
            <span className="material-symbols-outlined text-[18px]">home</span> Về trang chủ
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-danger hover:bg-red-50 rounded-lg transition-colors w-full text-left">
            <span className="material-symbols-outlined text-[18px]">logout</span> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-semibold text-gray-800">Bảng điều khiển</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Xin chào, {user?.fullName || 'Admin'}</span>
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};