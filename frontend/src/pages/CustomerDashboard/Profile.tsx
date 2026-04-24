import { useState, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useMutation } from '@tanstack/react-query';
import { userApi } from '../../api/userApi';
import { useForm } from 'react-hook-form';
import { Camera, Save } from 'lucide-react';
import clsx from 'clsx';

// Mock toast
const toast = {
  success: (msg: string) => alert(msg),
  error: (msg: string) => alert(msg)
};

export const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: profileErrors } } = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      phone: user?.phone || '',
    }
  });

  const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: pwdErrors }, reset: resetPassword } = useForm();

  const profileMutation = useMutation({
    mutationFn: async (data: any) => {
      let avatarUrl = user?.avatar;
      
      // Giả lập upload Cloudinary (trong thực tế sẽ gọi API Cloudinary)
      if (avatarFile) {
         // avatarUrl = await uploadToCloudinary(avatarFile);
         avatarUrl = URL.createObjectURL(avatarFile); // Mock cho preview
      }

      return userApi.updateProfile({ ...data, avatar: avatarUrl });
    },
    onSuccess: (res) => {
      updateUser(res.data);
      toast.success("Cập nhật thông tin thành công");
    },
    onError: () => toast.error("Không thể cập nhật thông tin")
  });

  const passwordMutation = useMutation({
    mutationFn: (data: any) => userApi.changePassword(data),
    onSuccess: () => {
      toast.success("Đổi mật khẩu thành công");
      resetPassword();
    },
    onError: () => toast.error("Đổi mật khẩu thất bại")
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
      <h1 className="text-2xl font-serif text-gray-900 mb-6">Thông tin cá nhân</h1>

      <div className="bg-white p-6 md:p-8 rounded-lg border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Hồ sơ của bạn</h2>
        
        <form onSubmit={handleSubmitProfile(data => profileMutation.mutate(data))}>
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-32 h-32 rounded-full border-4 border-gray-50 overflow-hidden bg-gray-100 flex items-center justify-center text-4xl text-gray-400 font-bold">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.fullName.charAt(0).toUpperCase()
                )}
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="text-white" />
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleAvatarChange}
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="text-sm font-medium text-primary hover:underline"
              >
                Thay đổi ảnh đại diện
              </button>
            </div>

            {/* Info Fields */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">Email đăng nhập</label>
                <input 
                  type="text" 
                  value={user?.email} 
                  disabled 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Không thể thay đổi địa chỉ email.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">Họ và tên</label>
                  <input 
                    {...registerProfile("fullName", { required: "Vui lòng nhập họ tên" })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-shadow"
                  />
                  {profileErrors.fullName && <p className="text-xs text-danger mt-1">{profileErrors.fullName.message as string}</p>}
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">Số điện thoại</label>
                  <input 
                    {...registerProfile("phone")}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-shadow"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
             <button 
                type="submit" 
                disabled={profileMutation.isPending}
                className="px-6 py-3 bg-primary text-white rounded font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm"
              >
                {profileMutation.isPending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={16} />}
                Lưu thay đổi
             </button>
          </div>
        </form>
      </div>

      {user?.provider !== 'GOOGLE' && (
        <div className="bg-white p-6 md:p-8 rounded-lg border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Đổi mật khẩu</h2>
          
          <form onSubmit={handleSubmitPassword(data => passwordMutation.mutate(data))} className="max-w-md space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">Mật khẩu hiện tại</label>
              <input 
                type="password"
                {...registerPassword("oldPassword", { required: "Vui lòng nhập mật khẩu cũ" })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary"
              />
              {pwdErrors.oldPassword && <p className="text-xs text-danger mt-1">{pwdErrors.oldPassword.message as string}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">Mật khẩu mới</label>
              <input 
                type="password"
                {...registerPassword("newPassword", { 
                  required: "Vui lòng nhập mật khẩu mới",
                  minLength: { value: 8, message: "Mật khẩu ít nhất 8 ký tự" }
                })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary"
              />
              {pwdErrors.newPassword && <p className="text-xs text-danger mt-1">{pwdErrors.newPassword.message as string}</p>}
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={passwordMutation.isPending}
                className="px-6 py-3 border border-primary text-primary rounded font-medium hover:bg-primary hover:text-white transition-colors disabled:opacity-50 text-sm"
              >
                Cập nhật mật khẩu
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
