import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import { Plus, Edit2, Trash2, Power, PowerOff, X, Package } from 'lucide-react';
import clsx from 'clsx';
import { useForm } from 'react-hook-form';
import { toast } from '../../utils/toast';

interface Collection {
  id: number;
  name: string;
  slug: string;
  description?: string;
  bannerImageUrl?: string;
  season?: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

export const Collections = () => {
  const queryClient = useQueryClient();
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  const { data: collections, isLoading } = useQuery({
    queryKey: ['admin-collections'],
    queryFn: () => adminApi.getCollections(),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: number) => adminApi.toggleCollectionStatus(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['admin-collections'] });
      // Update selected collection state
      if (selectedCollection?.id === id) {
        setSelectedCollection(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
      }
      toast.success("Đã thay đổi trạng thái");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Không thể thay đổi trạng thái");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteCollection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-collections'] });
      setSelectedCollection(null);
      toast.success("Đã xóa bộ sưu tập");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Không thể xóa bộ sưu tập");
    }
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => 
      editingCollection 
        ? adminApi.updateCollection(editingCollection.id, data) 
        : adminApi.createCollection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-collections'] });
      toast.success(editingCollection ? "Cập nhật thành công" : "Thêm mới thành công");
      setIsModalOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra");
    }
  });

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      name: '',
      description: '',
      bannerImageUrl: '',
      season: '',
      isActive: true,
      startDate: '',
      endDate: ''
    }
  });

  const openModal = (collection?: Collection) => {
    if (collection) {
      setEditingCollection(collection);
      setValue('name', collection.name);
      setValue('description', collection.description || '');
      setValue('bannerImageUrl', collection.bannerImageUrl || '');
      setValue('season', collection.season || '');
      setValue('isActive', collection.isActive);
      setValue('startDate', collection.startDate || '');
      setValue('endDate', collection.endDate || '');
    } else {
      setEditingCollection(null);
      reset();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCollection(null);
    reset();
  };

  const onSubmit = (data: any) => {
    saveMutation.mutate(data);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Bộ sưu tập</h1>
          <p className="text-sm text-gray-500 mt-1">Nhóm sản phẩm theo chủ đề, mùa, sự kiện</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Thêm bộ sưu tập
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Master - Collection List */}
        <div className="col-span-5 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-900">Danh sách bộ sưu tập</h2>
          </div>
          <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
            {isLoading ? (
              <div className="text-center py-12 text-gray-500">Đang tải...</div>
            ) : collections && collections.length > 0 ? (
              collections.map((collection: Collection) => (
                <div
                  key={collection.id}
                  onClick={() => setSelectedCollection(collection)}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-l-2",
                    selectedCollection?.id === collection.id 
                      ? "bg-blue-50 border-l-blue-500" 
                      : "border-l-transparent hover:bg-gray-50"
                  )}
                >
                  {collection.bannerImageUrl ? (
                    <img src={collection.bannerImageUrl} alt={collection.name} className="w-12 h-12 object-cover rounded" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                      <Package size={24} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-sm">{collection.name}</div>
                    <div className="text-xs text-gray-500">{collection.season || collection.slug}</div>
                  </div>
                  <span className={clsx(
                    "px-2 py-0.5 rounded-full text-xs",
                    collection.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  )}>
                    {collection.isActive ? "Active" : "Hidden"}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">Chưa có bộ sưu tập nào</div>
            )}
          </div>
        </div>

        {/* Detail - Collection Info */}
        <div className="col-span-7 bg-white rounded-lg shadow-sm border border-gray-200">
          {selectedCollection ? (
            <div>
              <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                <h2 className="font-semibold text-gray-900">Chi tiết bộ sưu tập</h2>
                <button
                  onClick={() => setSelectedCollection(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {selectedCollection.bannerImageUrl && (
                  <div className="w-full">
                    <img 
                      src={selectedCollection.bannerImageUrl} 
                      alt={selectedCollection.name}
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Tên bộ sưu tập</label>
                  <div className="mt-1 text-lg font-semibold text-gray-900">{selectedCollection.name}</div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Slug</label>
                  <div className="mt-1 text-sm text-gray-700 font-mono bg-gray-50 px-3 py-2 rounded">
                    {selectedCollection.slug}
                  </div>
                </div>

                {selectedCollection.description && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Mô tả</label>
                    <div className="mt-1 text-sm text-gray-700">{selectedCollection.description}</div>
                  </div>
                )}

                {selectedCollection.season && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Mùa</label>
                    <div className="mt-1 text-sm text-gray-900">{selectedCollection.season}</div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {selectedCollection.startDate && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Ngày bắt đầu</label>
                      <div className="mt-1 text-sm text-gray-900">{selectedCollection.startDate}</div>
                    </div>
                  )}
                  {selectedCollection.endDate && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Ngày kết thúc</label>
                      <div className="mt-1 text-sm text-gray-900">{selectedCollection.endDate}</div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Trạng thái</label>
                  <div className="mt-1">
                    <span className={clsx(
                      "inline-flex px-3 py-1 rounded-full text-sm font-medium",
                      selectedCollection.isActive 
                        ? "bg-green-100 text-green-700" 
                        : "bg-gray-100 text-gray-700"
                    )}>
                      {selectedCollection.isActive ? "Đang hoạt động" : "Đã ẩn"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => toggleStatusMutation.mutate(selectedCollection.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {selectedCollection.isActive ? (
                      <><PowerOff size={18} /> Ẩn</>
                    ) : (
                      <><Power size={18} /> Hiển thị</>
                    )}
                  </button>
                  <button
                    onClick={() => openModal(selectedCollection)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit2 size={18} /> Chỉnh sửa
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Xác nhận xóa bộ sưu tập "${selectedCollection.name}"?`)) {
                        deleteMutation.mutate(selectedCollection.id);
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 py-20">
              <div className="text-center">
                <Package size={64} className="mx-auto mb-4 opacity-20" />
                <p>Chọn một bộ sưu tập để xem chi tiết</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">
                {editingCollection ? 'Sửa bộ sưu tập' : 'Thêm bộ sưu tập mới'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên bộ sưu tập <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('name', { required: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VD: Summer 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập mô tả"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Banner
                  <span className="text-xs text-gray-500 font-normal ml-2">(Ảnh bìa lớn cho bộ sưu tập)</span>
                </label>
                <input
                  {...register('bannerImageUrl')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/banners/summer-2024.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Ảnh banner lớn hiển thị ở đầu trang bộ sưu tập. Kích thước đề xuất: 1920x600px
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mùa
                  <span className="text-xs text-gray-500 font-normal ml-2">(Tùy chọn)</span>
                </label>
                <select
                  {...register('season')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Chọn mùa --</option>
                  <option value="Spring">Xuân (Spring)</option>
                  <option value="Summer">Hè (Summer)</option>
                  <option value="Fall">Thu (Fall)</option>
                  <option value="Winter">Đông (Winter)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  💡 Phân loại bộ sưu tập theo mùa trong năm
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày bắt đầu
                    <span className="text-xs text-gray-500 font-normal ml-2">(Tùy chọn)</span>
                  </label>
                  <input
                    {...register('startDate')}
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày kết thúc
                    <span className="text-xs text-gray-500 font-normal ml-2">(Tùy chọn)</span>
                  </label>
                  <input
                    {...register('endDate')}
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 -mt-2">
                💡 Thời gian hiệu lực của bộ sưu tập (VD: từ 01/06/2024 đến 31/08/2024)
              </p>

              <div className="flex items-center gap-2">
                <input
                  {...register('isActive')}
                  type="checkbox"
                  id="isActive"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Kích hoạt
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saveMutation.isPending ? 'Đang lưu...' : 'Lưu'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
