import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, ShoppingBag, User as UserIcon, Menu, LogOut, LayoutDashboard, FileText } from 'lucide-react';
import { productApi } from '../../../api/productApi';
import { useAuthStore } from '../../../store/authStore';
import { useCartStore } from '../../../store/cartStore';
import { useDebounce } from '../../../hooks/useDebounce';
import { authApi } from '../../../api/authApi';

export const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const { itemCount, clearCount } = useCartStore();
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch categories for mega menu
  useQuery({
    queryKey: ['categories'],
    queryFn: productApi.getCategories,
    staleTime: 5 * 60 * 1000,
  });

  // Search products
  const { data: searchResults, isLoading: isSearchLoading } = useQuery({
    queryKey: ['search', debouncedSearchTerm],
    queryFn: () => productApi.search(debouncedSearchTerm),
    enabled: debouncedSearchTerm.length > 1,
  });

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error(error);
    } finally {
      clearAuth();
      clearCount();
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
        {/* Left: Mobile Menu & Logo */}
        <div className="flex items-center gap-4">
          <button className="md:hidden text-gray-800">
            <Menu size={24} />
          </button>
          <Link to="/" className="flex flex-col items-center">
            {/* Logo placeholder, using text based on image */}
            <span className="font-serif font-bold text-2xl tracking-widest leading-none text-primary">HMK</span>
            <span className="text-[10px] tracking-[0.3em] font-sans text-primary">EYEWEAR</span>
          </Link>
        </div>

        {/* Center: Navigation */}
        <nav className="hidden md:flex items-center gap-8 font-medium text-sm">
          <Link to="/" className="hover:text-primary/70 transition-colors uppercase">Trang Chủ</Link>
          <div className="group relative py-8">
            <Link to="/san-pham?category=gong-kinh" className="hover:text-primary/70 transition-colors uppercase">Gọng Kính</Link>
          </div>
          <div className="group relative py-8">
            <Link to="/san-pham?category=trong-kinh" className="hover:text-primary/70 transition-colors uppercase">Tròng Kính</Link>
          </div>
          <Link to="/san-pham?category=phu-kien" className="hover:text-primary/70 transition-colors uppercase">Phụ Kiện</Link>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-6">
          {/* Search */}
          <div className="relative">
            {isSearchOpen ? (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center bg-gray-100 rounded-full px-4 py-2 w-64 transition-all">
                <Search size={18} className="text-gray-500 mr-2" />
                <input 
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="bg-transparent border-none outline-none w-full text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                  onBlur={() => !searchTerm && setIsSearchOpen(false)}
                />
                {/* Dropdown Results */}
                {debouncedSearchTerm.length > 1 && (
                  <div className="absolute top-12 right-0 w-80 bg-white shadow-lg rounded-card border border-gray-100 py-2 max-h-96 overflow-y-auto">
                    {isSearchLoading ? (
                      <div className="p-4 text-center text-sm text-gray-500">Đang tìm...</div>
                    ) : searchResults && searchResults.length > 0 ? (
                      searchResults.slice(0, 5).map(product => (
                        <Link key={product.id} to={`/san-pham/${product.slug}`} className="flex gap-3 p-3 hover:bg-gray-50 transition-colors">
                          <img src={product.thumbnailUrl} alt={product.name} className="w-12 h-12 object-cover rounded" />
                          <div>
                            <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                            <p className="text-sm text-danger">{product.salePrice || product.basePrice}đ</p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-500">Không tìm thấy sản phẩm</div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setIsSearchOpen(true)} className="hover:text-primary/70 transition-colors">
                <Search size={20} />
              </button>
            )}
          </div>

          {/* Cart */}
          <Link to="/gio-hang" className="relative hover:text-primary/70 transition-colors">
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-danger text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Auth */}
          {isAuthenticated ? (
            <div className="group relative py-2 cursor-pointer">
              <div className="flex items-center gap-2 hover:text-primary/70 transition-colors">
                <UserIcon size={20} />
              </div>
              <div className="absolute right-0 top-full mt-1 w-48 bg-white shadow-lg rounded-card border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="px-4 py-2 border-b border-gray-100 mb-2">
                  <p className="text-sm font-medium truncate">{user?.fullName}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                {user?.role === 'ADMIN' && (
                  <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
                    <LayoutDashboard size={16} />
                    <span>Admin Panel</span>
                  </Link>
                )}
                <Link to="/tai-khoan" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
                  <UserIcon size={16} />
                  <span>Tài khoản</span>
                </Link>
                <Link to="/tai-khoan/don-hang" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
                  <FileText size={16} />
                  <span>Đơn hàng</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-danger hover:bg-gray-50 transition-colors text-left mt-2 border-t border-gray-100">
                  <LogOut size={16} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          ) : (
            <Link to="/dang-nhap" className="hover:text-primary/70 transition-colors">
              <UserIcon size={20} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
