import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../../api/userApi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MapPin, Plus, Edit2, Trash2, X, Star } from 'lucide-react';
import clsx from 'clsx';
import { Address } from '../../types/user.types';

const addressSchema = z.object({
  recipientName: z.string().min(2, "Vui lòng nhập họ tên"),
  phone: z.string().min(10, "Số điện thoại không hợp lệ"),
  province: z.string().min(1, "Vui lòng chọn tỉnh/thành"),
  district: z.string().min(1, "Vui lòng chọn quận/huyện"),
  ward: z.string().min(1, "Vui lòng chọn phường/xã"),
  addressDetail: z.string().min(5, "Vui lòng nhập địa chỉ cụ thể"),
});

type AddressForm = z.infer<typeof addressSchema>;

// Mock toast
const toast = {
  success: (msg: string) => alert(msg),
  error: (msg: string) => alert(msg)
};

export const Addresses = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const { data: addressesData, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => userApi.getAddresses(),
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema)
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => userApi.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success("Đã xóa địa chỉ");
    }
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: number) => userApi.setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success("Đã đặt làm mặc định");
    }
  });

  const saveMutation = useMutation({
    mutationFn: (data: AddressForm) => {
      if (editingAddress) {
        return userApi.updateAddress(editingAddress.id, data);
      }
      return userApi.addAddress({ ...data, isDefault: false });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success(editingAddress ? "Đã cập nhật địa chỉ" : "Đã thêm địa chỉ mới");
      handleCloseModal();
    }
  });

  const handleOpenModal = (addr?: Address) => {
    if (addr) {
      setEditingAddress(addr);
      reset({
        recipientName: addr.recipientName,
        phone: addr.phone,
        province: addr.province,
        district: addr.district,
        ward: addr.ward,
        addressDetail: addr.addressDetail
      });
    } else {
      setEditingAddress(null);
      reset({});
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    reset({});
    setEditingAddress(null);
  };

  const addresses = addressesData?.data || [];

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-serif text-gray-900">Sổ địa chỉ</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 text-sm font-medium rounded hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} /> Thêm địa chỉ mới
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Đang tải sổ địa chỉ...</div>
      ) : addresses.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-12 text-center flex flex-col items-center">
          <MapPin size={48} className="text-gray-200 mb-4" />
          <p className="text-gray-500 mb-4">Bạn chưa có địa chỉ giao hàng nào.</p>
          <button onClick={() => handleOpenModal()} className="text-primary font-medium hover:underline">Thêm địa chỉ đầu tiên</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {addresses.map(addr => (
            <div key={addr.id} className={clsx(
              "bg-white rounded-lg p-6 shadow-sm border relative overflow-hidden transition-all",
              addr.isDefault ? "border-primary" : "border-gray-100 hover:border-gray-300"
            )}>
              {addr.isDefault && (
                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-bl-lg">
                  Mặc định
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-3">
                <span className="font-semibold text-gray-900">{addr.recipientName}</span>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-600">{addr.phone}</span>
              </div>
              
              <p className="text-sm text-gray-500 mb-6 leading-relaxed min-h-[40px]">
                {addr.addressDetail}<br/>
                {addr.ward}, {addr.district}, {addr.province}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                {!addr.isDefault ? (
                  <button 
                    onClick={() => setDefaultMutation.mutate(addr.id)}
                    className="text-xs font-medium text-gray-500 hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <Star size={14} /> Đặt làm mặc định
                  </button>
                ) : <div></div>}
                
                <div className="flex gap-3">
                  <button onClick={() => handleOpenModal(addr)} className="text-gray-400 hover:text-primary transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => {
                    if (window.confirm("Xóa địa chỉ này?")) deleteMutation.mutate(addr.id);
                  }} className="text-gray-400 hover:text-danger transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="font-serif text-xl text-gray-900">{editingAddress ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}</h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit(data => saveMutation.mutate(data))} className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">Họ và tên</label>
                  <input {...register('recipientName')} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                  {errors.recipientName && <p className="text-xs text-danger mt-1">{errors.recipientName.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">Số điện thoại</label>
                  <input {...register('phone')} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                  {errors.phone && <p className="text-xs text-danger mt-1">{errors.phone.message}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">Tỉnh/Thành</label>
                  <input {...register('province')} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                  {errors.province && <p className="text-xs text-danger mt-1">{errors.province.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">Quận/Huyện</label>
                  <input {...register('district')} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                  {errors.district && <p className="text-xs text-danger mt-1">{errors.district.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">Phường/Xã</label>
                  <input {...register('ward')} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                  {errors.ward && <p className="text-xs text-danger mt-1">{errors.ward.message}</p>}
                </div>
              </div>
              
              <div className="mb-8">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">Địa chỉ cụ thể</label>
                <input {...register('addressDetail')} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                {errors.addressDetail && <p className="text-xs text-danger mt-1">{errors.addressDetail.message}</p>}
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors">Hủy</button>
                <button type="submit" disabled={saveMutation.isPending} className="px-6 py-2 text-sm font-medium bg-primary text-white rounded hover:bg-gray-800 transition-colors disabled:opacity-50">
                  {saveMutation.isPending ? 'Đang lưu...' : 'Lưu địa chỉ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
