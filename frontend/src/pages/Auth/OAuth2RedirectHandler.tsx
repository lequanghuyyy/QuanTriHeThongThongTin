import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { userApi } from '../../api/userApi';
import { toast } from 'sonner';

export const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const updateUser = useAuthStore((state) => state.updateUser);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      // 1. Save tokens first
      setAuth({
        accessToken,
        refreshToken,
        user: {} as any, // Placeholder until profile fetch
      });

      // 2. Fetch full profile
      const fetchProfile = async () => {
        try {
          const profile = await userApi.getProfile();
          updateUser(profile);
          toast.success('Đăng nhập thành công!');
          navigate('/', { replace: true });
        } catch (error) {
          console.error('Failed to fetch profile:', error);
          toast.error('Lỗi khi lấy thông tin người dùng');
          navigate('/dang-nhap', { replace: true });
        }
      };

      fetchProfile();
    } else {
      toast.error('Đăng nhập thất bại!');
      navigate('/dang-nhap', { replace: true });
    }
  }, [searchParams, setAuth, updateUser, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};
