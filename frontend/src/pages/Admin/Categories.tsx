import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import { Search, Plus, Edit2, Trash2, Power, PowerOff, X, FolderTree } from 'lucide-react';
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
  const [search, setSearch] = useState('');
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

  const renderCategory = (category: Category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    
    return (
      <div key={category.id}>
        <div className={clsx(
          "flex items-center justify-between p-4 bg-white border-b hover:bg-gray-50",
          level > 0 && "ml-8 border-l-4 border-l-blue-200"
        )}>
          <div className="flex items-center gap-4 flex-1">
            {level > 0 && <div className="w-4 h-4 border-l-2 border-b-2 border-gray-300 -ml-4" />}
            {hasChildren && <FolderTree size={18} className="text-blue-500" />}
            {category.imageUrl && (
              <img src={category.imageUrl} alt={category.name} className="w-12 h-12 object-cover rounded" />
            )}
            <div>
              <div className="font-medium">{category.name}</div>
              <div className="text-sm text-gray-500">{category.slug}</div>
              {category.description && (
                <div className="text-sm text-gray-600 mt-1">{category.description}</div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={clsx(
              "px-3 py-1 rounded-full text-xs font-medium",
              category.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
            )}>
              {category.isActive ? "Hoạt động" : "Tạm ẩn"}
            </span>

            <button
              onClick={() => toggleStatusMutation.mutate(category.id)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={category.isActive ? "Tắt" : "Bật"}
            >
              {category.isActive ? <PowerOff size={18} className="text-orange-500" /> : <Power size={18} className="text-green-500" />}
            </button>

            <button
              onClick={() => openModal(category)}
              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
              title="Sửa"
            >
              <Edit2 size={18} className="text-blue-500" />
            </button>

            <button
              onClick={() => {
                if (confirm(`Xác nhận xóa danh mục "${category.name}"?`)) {
                  deleteMutation.mutate(category.id);
                }
              }}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              title="Xóa"
            >
              <Trash2 size={18} className="text-red-500" />
            </button>
          </div>
        </div>

        {hasChildren && category.children!.map(child => renderCategory(child, level + 1))}
      </div>
    );
  };

  const filteredCategories = categories?.filter((cat: Category) =>
    cat.name.toLowerCase().includes(search.toLowerCase()) ||
    cat.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý danh mục</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Thêm danh mục
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Đang tải...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredCategories && filteredCategories.length > 0 ? (
            filteredCategories.map((category: Category) => renderCategory(category))
          ) : (
            <div className="text-center py-12 text-gray-500">Không có danh mục nào</div>
          )}
        </div>
      )}

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
                <label className="block text-sm font-medium text-gray-700 mb-2">URL hình ảnh</label>
                <input
                  {...register('imageUrl')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thứ tự sắp xếp</label>
                <input
                  {...register('sortOrder', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
