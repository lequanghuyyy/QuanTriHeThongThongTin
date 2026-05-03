import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../api/authApi';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export const ForgotPassword = () => {
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, setError } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: ({ email }: ForgotPasswordForm) => authApi.forgotPassword(email),
    onSuccess: () => {
      setIsSuccess(true);
    },
    onError: () => {
      setError("root", { message: "Không thể gửi yêu cầu. Vui lòng thử lại sau." });
    },
  });

  return (
    <div className="flex min-h-screen bg-gray-50 items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 sm:p-12 animate-fade-in border border-gray-100">
        {!isSuccess ? (
          <>
            <div className="text-center mb-8">
              <h1 className="font-bold text-3xl text-black mb-3">Quên mật khẩu?</h1>
              <p className="text-[#474747] text-sm mt-3">Nhập email của bạn và chúng tôi sẽ gửi liên kết để đặt lại mật khẩu.</p>
            </div>

            <form onSubmit={handleSubmit(data => forgotPasswordMutation.mutate(data))} className="space-y-6">
              {errors.root && (
                <div className="bg-danger/10 text-danger text-sm p-4 rounded-md text-center font-medium">
                  {errors.root.message}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#474747] uppercase tracking-widest mb-2">Địa chỉ Email</label>
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

              <button
                type="submit"
                disabled={forgotPasswordMutation.isPending}
                className="w-full bg-primary text-white py-4 rounded-button font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 relative overflow-hidden uppercase tracking-widest text-sm"
              >
                {forgotPasswordMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                ) : "Gửi yêu cầu"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="font-serif text-2xl text-gray-900 mb-3">Kiểm tra email của bạn</h2>
            <p className="text-gray-500 mb-8 text-sm leading-relaxed">
              Chúng tôi đã gửi một liên kết khôi phục mật khẩu đến email của bạn. Vui lòng kiểm tra cả hộp thư rác (spam).
            </p>
            <button
              onClick={() => setIsSuccess(false)}
              className="text-primary text-sm font-medium hover:underline"
            >
              Gửi lại email
            </button>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link to="/dang-nhap" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors">
            <ArrowLeft size={16} /> Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};
