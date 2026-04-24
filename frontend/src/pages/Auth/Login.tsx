import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../api/authApi';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import clsx from 'clsx';

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type LoginForm = z.infer<typeof loginSchema>;

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore(state => state.setAuth);
  const setItemCount = useCartStore(state => state.setItemCount);

  const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: LoginForm) => authApi.login(email, password),
    onSuccess: (tokens) => {
      setAuth(tokens);
      // As per requirement, if backend returns cartItemCount in user object
      setItemCount((tokens.user as any).cartItemCount || 0);
      const redirect = searchParams.get("redirect") || "/";
      navigate(redirect, { replace: true });
    },
    onError: () => setError("root", { message: "Email hoặc mật khẩu không đúng" }),
  });

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/auth/google`;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left: Brand Image (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=1200" 
          alt="HMK Eyewear Brand" 
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
        <div className="absolute bottom-20 left-20 right-20 text-white">
          <h2 className="font-serif text-5xl mb-6 leading-tight">The Visionary Edit</h2>
          <p className="text-gray-300 font-light text-lg max-w-md">Khám phá bộ sưu tập kính mắt thiết kế mới nhất, mang đậm phong cách kiến trúc và đương đại.</p>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 animate-fade-in relative">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="font-serif text-3xl text-gray-900 mb-3">Chào mừng trở lại</h1>
            <p className="text-gray-500">Đăng nhập để tiếp tục hành trình của bạn</p>
          </div>

          <form onSubmit={handleSubmit(data => loginMutation.mutate(data))} className="space-y-6">
            {errors.root && (
              <div className="bg-danger/10 text-danger text-sm p-4 rounded-md text-center font-medium">
                {errors.root.message}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">Địa chỉ Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  {...register("email")}
                  placeholder="name@example.com"
                  className={clsx(
                    "w-full pl-12 pr-4 py-3.5 bg-white border rounded-md text-sm transition-all focus:outline-none focus:ring-1",
                    errors.email ? "border-danger focus:border-danger focus:ring-danger" : "border-gray-200 focus:border-primary focus:ring-primary"
                  )}
                />
              </div>
              {errors.email && <span className="text-danger text-xs mt-1 block">{errors.email.message}</span>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest">Mật khẩu</label>
                <Link to="/quen-mat-khau" className="text-xs font-medium text-gray-500 hover:text-primary transition-colors">Quên mật khẩu?</Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="••••••••"
                  className={clsx(
                    "w-full pl-12 pr-12 py-3.5 bg-white border rounded-md text-sm transition-all focus:outline-none focus:ring-1",
                    errors.password ? "border-danger focus:border-danger focus:ring-danger" : "border-gray-200 focus:border-primary focus:ring-primary"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className="text-danger text-xs mt-1 block">{errors.password.message}</span>}
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-primary text-white py-4 rounded-button font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 relative overflow-hidden uppercase tracking-widest text-sm"
            >
              {loginMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
              ) : "Đăng nhập"}
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-gray-50 text-gray-400 uppercase tracking-widest">Hoặc</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white border border-gray-200 text-gray-700 py-3.5 rounded-button font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 text-sm"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Tiếp tục với Google
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Chưa có tài khoản?{' '}
            <Link to="/dang-ky" className="font-semibold text-primary hover:underline">Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
