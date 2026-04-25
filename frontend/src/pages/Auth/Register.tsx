import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../api/authApi';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import clsx from 'clsx';
import type { RegisterRequest } from '../../types/user.types';

const registerSchema = z.object({
  fullName: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().regex(/^(0|\+84)[0-9]{9}$/, "Số điện thoại không hợp lệ"),
  password: z.string().min(8, "Mật khẩu ít nhất 8 ký tự")
    .regex(/[A-Z]/, "Phải có ít nhất 1 chữ hoa")
    .regex(/[0-9]/, "Phải có ít nhất 1 số"),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

// Mock toast
const toast = {
  success: (msg: string) => alert(msg),
  error: (msg: string) => alert(msg)
};

export const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, setError } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: () => {
      toast.success("Đăng ký thành công! Vui lòng kiểm tra email.");
      navigate("/dang-nhap");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Đăng ký thất bại. Email có thể đã tồn tại.";
      setError("root", { message: msg });
    },
  });

  const handleGoogleRegister = () => {
    // Vite API URL usually includes /api/v1, we need the base backend URL
    const baseUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api/v1', '') 
      : 'http://localhost:8080';
    window.location.href = `${baseUrl}/oauth2/authorization/google`;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left: Brand Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&q=80&w=1200" 
          alt="HMK Eyewear Brand" 
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
        <div className="absolute bottom-20 left-20 right-20 text-white">
          <h2 className="font-serif text-5xl mb-6 leading-tight">Join the Vanguard</h2>
          <p className="text-gray-300 font-light text-lg max-w-md">Trở thành thành viên để nhận những đặc quyền riêng biệt và cập nhật sớm nhất các bộ sưu tập mới.</p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 animate-fade-in relative overflow-y-auto max-h-screen custom-scrollbar">
        <div className="w-full max-w-md my-auto">
          <div className="text-center mb-10">
            <h1 className="font-serif text-3xl text-gray-900 mb-3">Tạo tài khoản</h1>
            <p className="text-gray-500">Gia nhập cộng đồng HMK Eyewear</p>
          </div>

          <form onSubmit={handleSubmit(data => registerMutation.mutate(data))} className="space-y-5">
            {errors.root && (
              <div className="bg-danger/10 text-danger text-sm p-4 rounded-md text-center font-medium">
                {errors.root.message}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">Họ và tên</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  {...register("fullName")}
                  placeholder="Nguyễn Văn A"
                  className={clsx(
                    "w-full pl-12 pr-4 py-3.5 bg-white border rounded-md text-sm transition-all focus:outline-none focus:ring-1",
                    errors.fullName ? "border-danger focus:border-danger focus:ring-danger" : "border-gray-200 focus:border-primary focus:ring-primary"
                  )}
                />
              </div>
              {errors.fullName && <span className="text-danger text-xs mt-1 block">{errors.fullName.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">Số điện thoại</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  {...register("phone")}
                  placeholder="0912345678"
                  className={clsx(
                    "w-full pl-12 pr-4 py-3.5 bg-white border rounded-md text-sm transition-all focus:outline-none focus:ring-1",
                    errors.phone ? "border-danger focus:border-danger focus:ring-danger" : "border-gray-200 focus:border-primary focus:ring-primary"
                  )}
                />
              </div>
              {errors.phone && <span className="text-danger text-xs mt-1 block">{errors.phone.message}</span>}
            </div>

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

            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">Mật khẩu</label>
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

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">Xác nhận mật khẩu</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    placeholder="••••••••"
                    className={clsx(
                      "w-full pl-12 pr-12 py-3.5 bg-white border rounded-md text-sm transition-all focus:outline-none focus:ring-1",
                      errors.confirmPassword ? "border-danger focus:border-danger focus:ring-danger" : "border-gray-200 focus:border-primary focus:ring-primary"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="text-danger text-xs mt-1 block">{errors.confirmPassword.message}</span>}
              </div>
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full bg-primary text-white py-4 mt-2 rounded-button font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 relative overflow-hidden uppercase tracking-widest text-sm"
            >
              {registerMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
              ) : "Đăng ký"}
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
              onClick={handleGoogleRegister}
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
            Đã có tài khoản?{' '}
            <Link to="/dang-nhap" className="font-semibold text-primary hover:underline">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
