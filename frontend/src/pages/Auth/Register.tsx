import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../api/authApi';
import clsx from 'clsx';
import type { RegisterRequest } from '../../types/user.types';

// Import ảnh banner từ thư mục nội bộ
import bannerImg from '../../assets/imageLogin.jpg'; 

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
    const baseUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api/v1', '') 
      : 'http://localhost:8080';
    window.location.href = `${baseUrl}/oauth2/authorization/google`;
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Left: Brand Image */}
      <div className="hidden lg:flex lg:w-[55%] relative bg-white border-r border-gray-200">
        <img 
          src={bannerImg} 
          alt="HMK Eyewear Brand" 
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </div>

      {/* Right: Form */}
      <div className="w-full lg:w-[42%] flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white animate-fade-in relative overflow-y-auto max-h-screen custom-scrollbar">
        <div className="w-full max-w-[400px] my-auto">
          
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="font-bold text-[32px] text-black mb-2">Tạo tài khoản</h1>
            <p className="text-gray-500 text-sm">Gia nhập cộng đồng HMK Eyewear</p>
          </div>

          <form onSubmit={handleSubmit(data => registerMutation.mutate(data))} className="space-y-5">
            {errors.root && (
              <div className="bg-red-50 text-red-500 text-sm p-4 rounded-lg text-center font-medium border border-red-100">
                {errors.root.message}
              </div>
            )}

            {/* Họ và tên Input */}
            <div>
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide mb-2">
                Họ và tên
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                  {/* Cập nhật màu icon */}
                  <span className="material-symbols-outlined text-[#474747] text-[20px]">person</span>
                </div>
                <input
                  type="text"
                  {...register("fullName")}
                  placeholder="Nguyễn Văn A"
                  className={clsx(
                    "w-full pl-11 pr-4 py-3.5 bg-white border rounded-md text-sm transition-all focus:outline-none focus:ring-1 focus:ring-black",
                    "[&:autofill]:shadow-[inset_0_0_0px_1000px_white] [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_white]",
                    errors.fullName ? "border-red-500 focus:border-red-500" : "border-black"
                  )}
                />
              </div>
              {errors.fullName && <span className="text-red-500 text-xs mt-1.5 block font-medium">{errors.fullName.message}</span>}
            </div>

            {/* Số điện thoại Input */}
            <div>
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide mb-2">
                Số điện thoại
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                  {/* Cập nhật màu icon */}
                  <span className="material-symbols-outlined text-[#474747] text-[20px]">phone</span>
                </div>
                <input
                  type="text"
                  {...register("phone")}
                  placeholder="0912345678"
                  className={clsx(
                    "w-full pl-11 pr-4 py-3.5 bg-white border rounded-md text-sm transition-all focus:outline-none focus:ring-1 focus:ring-black",
                    "[&:autofill]:shadow-[inset_0_0_0px_1000px_white] [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_white]",
                    errors.phone ? "border-red-500 focus:border-red-500" : "border-black"
                  )}
                />
              </div>
              {errors.phone && <span className="text-red-500 text-xs mt-1.5 block font-medium">{errors.phone.message}</span>}
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide mb-2">
                Địa chỉ Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                  {/* Cập nhật màu icon */}
                  <span className="material-symbols-outlined text-[#474747] text-[20px]">mail</span>
                </div>
                <input
                  type="email"
                  {...register("email")}
                  placeholder="nva123@example.com"
                  className={clsx(
                    "w-full pl-11 pr-4 py-3.5 bg-white border rounded-md text-sm transition-all focus:outline-none focus:ring-1 focus:ring-black",
                    "[&:autofill]:shadow-[inset_0_0_0px_1000px_white] [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_white]",
                    errors.email ? "border-red-500 focus:border-red-500" : "border-black"
                  )}
                />
              </div>
              {errors.email && <span className="text-red-500 text-xs mt-1.5 block font-medium">{errors.email.message}</span>}
            </div>

            {/* Mật khẩu Input */}
            <div>
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                  {/* Cập nhật màu icon */}
                  <span className="material-symbols-outlined text-[#474747] text-[20px]">lock</span>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="••••••••"
                  className={clsx(
                    "w-full pl-11 pr-12 py-3.5 bg-white border rounded-md text-sm transition-all focus:outline-none focus:ring-1 focus:ring-black",
                    "[&:autofill]:shadow-[inset_0_0_0px_1000px_white] [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_white]",
                    errors.password ? "border-red-500 focus:border-red-500" : "border-black"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  // Cập nhật màu icon toggle
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#474747] hover:text-black transition-colors focus:outline-none z-10"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {errors.password && <span className="text-red-500 text-xs mt-1.5 block font-medium">{errors.password.message}</span>}
            </div>

            {/* Xác nhận mật khẩu Input */}
            <div>
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide mb-2">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                  {/* Cập nhật màu icon */}
                  <span className="material-symbols-outlined text-[#474747] text-[20px]">lock</span>
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  placeholder="••••••••"
                  className={clsx(
                    "w-full pl-11 pr-12 py-3.5 bg-white border rounded-md text-sm transition-all focus:outline-none focus:ring-1 focus:ring-black",
                    "[&:autofill]:shadow-[inset_0_0_0px_1000px_white] [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_white]",
                    errors.confirmPassword ? "border-red-500 focus:border-red-500" : "border-black"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  // Cập nhật màu icon toggle
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#474747] hover:text-black transition-colors focus:outline-none z-10"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showConfirmPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {errors.confirmPassword && <span className="text-red-500 text-xs mt-1.5 block font-medium">{errors.confirmPassword.message}</span>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full bg-black text-white py-4 mt-2 rounded-full font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center text-sm tracking-widest uppercase"
            >
              {registerMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : "Đăng ký"}
            </button>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-white text-gray-400 uppercase tracking-widest font-medium">Hoặc</span>
              </div>
            </div>

            {/* Google Register */}
            <button
              type="button"
              onClick={handleGoogleRegister}
              className="w-full bg-white border border-gray-300 text-gray-700 py-3.5 rounded-full font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 text-sm"
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

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <Link to="/dang-nhap" className="font-bold text-black hover:underline">Đăng nhập</Link>
          </p>
          
        </div>
      </div>
    </div>
  );
};