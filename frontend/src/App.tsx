import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from './store/authStore';
import { MainLayout } from './layouts/MainLayout';
import { AdminLayout } from './layouts/AdminLayout';

import { Home } from './pages/Home';
import { ProductList } from './pages/ProductList';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { ForgotPassword } from './pages/Auth/ForgotPassword';
import { OAuth2RedirectHandler } from './pages/Auth/OAuth2RedirectHandler';
import { CollectionDetail } from './pages/CollectionDetail';

const StoreLocator = () => <div className="p-8">StoreLocator</div>

import { Checkout } from './pages/Checkout';
import { CustomerDashboardLayout } from './pages/CustomerDashboard';
import { Overview } from './pages/CustomerDashboard/Overview';
import { OrderHistory } from './pages/CustomerDashboard/OrderHistory';
import { OrderDetail } from './pages/CustomerDashboard/OrderDetail';
import { Profile } from './pages/CustomerDashboard/Profile';
import { Addresses } from './pages/CustomerDashboard/Addresses';
import { Reviews } from './pages/CustomerDashboard/Reviews';

import { Dashboard as AdminDashboard } from './pages/Admin/Dashboard';
import { Products as AdminProducts } from './pages/Admin/Products';
import { Orders as AdminOrders } from './pages/Admin/Orders';
import { Categories as AdminCategories } from './pages/Admin/CategoriesMasterDetail';
import { Collections as AdminCollections } from './pages/Admin/Collections';
import AdminUsers from './pages/Admin/Users';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/dang-nhap" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/dang-nhap" state={{ from: location.pathname }} replace />;
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
        
       
        <Route path="/dang-nhap" element={<Login />} />
        <Route path="/dang-ky" element={<Register />} />
        <Route path="/quen-mat-khau" element={<ForgotPassword />} />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

        
        <Route element={<MainLayout><ProtectedRoute><Outlet /></ProtectedRoute></MainLayout>}>
          <Route path="/thanh-toan" element={<Checkout />} />
          <Route path="/tai-khoan" element={<CustomerDashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="don-hang" element={<OrderHistory />} />
            <Route path="don-hang/:orderCode" element={<OrderDetail />} />
            <Route path="thong-tin" element={<Profile />} />
            <Route path="dia-chi" element={<Addresses />} />
            <Route path="danh-gia" element={<Reviews />} />
          </Route>
        </Route>

      
        <Route element={<MainLayout><Outlet /></MainLayout>}>
          <Route path="/" element={<Home />} />
          <Route path="/san-pham" element={<ProductList />} />
          <Route path="/san-pham/:slug" element={<ProductDetail />} />
          <Route path="/gio-hang" element={<Cart />} />
          <Route path="/bo-suu-tap/:slug" element={<CollectionDetail />} />
          <Route path="/cua-hang" element={<StoreLocator />} />
        </Route>

        
        <Route element={<AdminLayout><AdminRoute><Outlet /></AdminRoute></AdminLayout>}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/san-pham" element={<AdminProducts />} />
          <Route path="/admin/don-hang" element={<AdminOrders />} />
          <Route path="/admin/danh-muc" element={<AdminCategories />} />
          <Route path="/admin/bo-suu-tap" element={<AdminCollections />} />
          <Route path="/admin/nguoi-dung" element={<AdminUsers />} />
        </Route>

      </Routes>
    </>
  )
}

export default App;