import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import { Plus, Edit2, Trash2, Power, PowerOff, X, FolderTree, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { useForm } from 'react-hook-form';

const toast = {
  success: (msg: string) => alert(msg),
  error: (msg: string) => alert(msg)
};

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  level: number;
  sortOrder: number;
  children?: Category[];
}

export const Categories = () => {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminApi.getCategories(),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: number) => adminApi.toggleCategoryStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      // Update selected category state
      if (selectedCategory?.id === toggleStatusMutation.variables) {
        setSelectedCategory(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
      }
      toast.success("Đã thay đổi trạng thái");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Không thể thay đổi trạng thái");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setSelectedCategory(null);
      toast.success("Đã xóa danh mục");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Không thể xóa danh mục");
    }
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => 
      editingCategory 
        ? adminApi.updateCategory(editingCategory.id, data) 
        : adminApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success(editingCategory ? "Cập nhật thành công" : "Thêm mới thành công");
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
      imageUrl: '',
      parentId: null as number | null,
      isActive: true,
      sortOrder: 0
    }
  });

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setValue('name', category.name);
      setValue('description', category.description || '');
      setValue('imageUrl', category.imageUrl || '');
      setValue('isActive', category.isActive);
      setValue('sortOrder', category.sortOrder);
    } else {
      setEditingCategory(null);
      reset();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    reset();
  };

  const onSubmit = (data: any) => {
    saveMutation.mutate(data);
  };

  const renderCategoryItem = (category: Category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isSelected = selectedCategory?.id === category.id;
    
    return (
      <div key={category.id}>
        <div
          onClick={() => setSelectedCategory(category)}
          className={clsx(
            "flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors border-l-2",
            isSelected 
              ? "bg-blue-50 border-l-blue-500 text-blue-700" 
              : "border-l-transparent hover:bg-gray-50",
            level > 0 && "ml-6"
          )}
        >
          {hasChildren && <ChevronRight size={16} className="text-gray-400" />}
          {!hasChildren && <div className="w-4" />}
          {category.imageUrl && (
            <img src={category.imageUrl} alt={category.name} className="w-8 h-8 object-cover rounded" />
          )}
          <div className="flex-1">
            <div className="font-medium text-sm">{category.name}</div>
            <div className="text-xs text-gray-500">{category.slug}</div>
          </div>
          <span className={clsx(
            "px-2 py-0.5 rounded-full text-xs",
            category.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
          )}>
            {category.isActive ? "Active" : "Hidden"}
          </span>
        </div>
        {hasChildren && category.children!.map(child => renderCategoryItem(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản Lý Danh Mục</h1>
          <p className="text-sm text-gray-500 mt-1">Phân loại sản phẩm theo cấu trúc cây</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Thêm danh mục
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Master - Category List */}
        <div className="col-span-5 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-900">Danh sách danh mục</h2>
          </div>
          <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
            {isLoading ? (
              <div className="text-center py-12 text-gray-500">Đang tải...</div>
            ) : categories && categories.length > 0 ? (
              categories.map((category: Category) => renderCategoryItem(category))
            ) : (
              <div className="text-center py-12 text-gray-500">Chưa có danh mục nào</div>
            )}
          </div>
        </div>

        {/* Detail - Category Info */}
        <div className="col-span-7 bg-white rounded-lg shadow-sm border border-gray-200">
          {selectedCategory ? (
            <div>
              <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                <h2 className="font-semibold text-gray-900">Chi tiết danh mục</h2>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {selectedCategory.imageUrl && (
                  <div className="flex justify-center">
                    <img 
                      src={selectedCategory.imageUrl} 
                      alt={selectedCategory.name}
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Tên danh mục</label>
                  <div className="mt-1 text-lg font-semibold text-gray-900">{selectedCategory.name}</div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Slug</label>
                  <div className="mt-1 text-sm text-gray-700 font-mono bg-gray-50 px-3 py-2 rounded">
                    {selectedCategory.slug}
                  </div>
                </div>

                {selectedCategory.description && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Mô tả</label>
                    <div className="mt-1 text-sm text-gray-700">{selectedCategory.description}</div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Cấp độ</label>
                    <div className="mt-1 text-sm text-gray-900">Level {selectedCategory.level}</div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Thứ tự</label>
                    <div className="mt-1 text-sm text-gray-900">{selectedCategory.sortOrder}</div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Trạng thái</label>
                  <div className="mt-1">
                    <span className={clsx(
                      "inline-flex px-3 py-1 rounded-full text-sm font-medium",
                      selectedCategory.isActive 
                        ? "bg-green-100 text-green-700" 
                        : "bg-gray-100 text-gray-700"
                    )}>
                      {selectedCategory.isActive ? "Đang hoạt động" : "Đã ẩn"}
                    </span>
                  </div>
                </div>

                {selectedCategory.children && selectedCategory.children.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Danh mục con</label>
                    <div className="mt-2 space-y-1">
                      {selectedCategory.children.map(child => (
                        <div 
                          key={child.id}
                          onClick={() => setSelectedCategory(child)}
                          className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
                        >
                          <FolderTree size={16} className="text-gray-400" />
                          <span className="text-sm">{child.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => toggleStatusMutation.mutate(selectedCategory.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {selectedCategory.isActive ? (
                      <><PowerOff size={18} /> Ẩn danh mục</>
                    ) : (
                      <><Power size={18} /> Hiển thị</>
                    )}
                  </button>
                  <button
                    onClick={() => openModal(selectedCategory)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit2 size={18} /> Chỉnh sửa
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Xác nhận xóa danh mục "${selectedCategory.name}"?`)) {
                        deleteMutation.mutate(selectedCategory.id);
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
                <FolderTree size={64} className="mx-auto mb-4 opacity-20" />
                <p>Chọn một danh mục để xem chi tiết</p>
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
                {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('name', { required: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập tên danh mục"
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
                  URL hình ảnh
                  <span className="text-xs text-gray-500 font-normal ml-2">(Icon đại diện cho danh mục)</span>
                </label>
                <input
                  {...register('imageUrl')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/images/category-icon.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Ảnh nhỏ (icon) hiển thị bên cạnh tên danh mục. Kích thước đề xuất: 100x100px
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thứ tự sắp xếp
                  <span className="text-xs text-gray-500 font-normal ml-2">(Số càng nhỏ hiển thị càng trước)</span>
                </label>
                <input
                  {...register('sortOrder', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 VD: 1 = hiển thị đầu tiên, 2 = thứ hai, 3 = thứ ba...
                </p>
              </div>

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
