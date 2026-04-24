import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import { formatVND } from '../../utils/formatters';
import { Search, Plus, Edit2, Trash2, Power, PowerOff, X, Image as ImageIcon } from 'lucide-react';
import clsx from 'clsx';
import { useForm, useFieldArray } from 'react-hook-form';

// Mock toast
const toast = {
  success: (msg: string) => alert(msg),
  error: (msg: string) => alert(msg)
};

export const Products = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'images' | 'variants'>('general');

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products', page, search, statusFilter],
    queryFn: () => adminApi.getProducts({ page, size: 10, keyword: search, isActive: statusFilter === '' ? undefined : statusFilter === 'true' }),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: number) => adminApi.toggleProductStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success("Đã thay đổi trạng thái");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success("Đã xóa sản phẩm");
    }
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => editingProduct ? adminApi.updateProduct(editingProduct.id, data) : adminApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success(editingProduct ? "Cập nhật thành công" : "Thêm mới thành công");
      setIsModalOpen(false);
    }
  });

  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      name: '',
      sku: '',
      basePrice: 0,
      description: '',
      shortDescription: '',
      variants: [] as any[]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants'
  });

  const openModal = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      reset({
        name: product.name,
        sku: product.sku,
        basePrice: product.basePrice,
        description: product.description,
        shortDescription: product.shortDescription,
        variants: product.variants || []
      });
    } else {
      setEditingProduct(null);
      reset({
        name: '', sku: '', basePrice: 0, description: '', shortDescription: '', variants: []
      });
    }
    setActiveTab('general');
    setIsModalOpen(true);
  };

  const products = productsData?.content || [];

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-serif text-gray-900 mb-1">Quản lý Sản phẩm</h1>
          <p className="text-gray-500 text-sm">Danh sách và thông tin chi tiết các sản phẩm trong kho.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-primary text-white px-4 py-2 text-sm font-medium rounded flex items-center gap-2 hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} /> Thêm sản phẩm
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm theo tên, SKU..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary flex-1 sm:flex-none"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="true">Đang bán</option>
              <option value="false">Ngừng bán</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-white border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium">Sản phẩm</th>
                <th className="px-6 py-4 font-medium">SKU</th>
                <th className="px-6 py-4 font-medium">Danh mục</th>
                <th className="px-6 py-4 font-medium text-right">Giá bán</th>
                <th className="px-6 py-4 font-medium text-right">Tồn kho</th>
                <th className="px-6 py-4 font-medium text-center">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-500">Không tìm thấy sản phẩm nào.</td></tr>
              ) : (
                products.map((product: any) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded border border-gray-200 bg-white flex-shrink-0">
                           <img src={product.thumbnailUrl || 'https://placehold.co/100'} alt="" className="w-full h-full object-contain mix-blend-multiply p-1" />
                        </div>
                        <span className="font-medium text-gray-900 truncate max-w-[200px]" title={product.name}>{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{product.sku}</td>
                    <td className="px-6 py-4 text-gray-500">{product.category?.name}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">{formatVND(product.basePrice)}</td>
                    <td className="px-6 py-4 text-right">
                      {product.variants?.reduce((sum: number, v: any) => sum + v.stockQuantity, 0) || 0}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={clsx("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", product.isActive ? "bg-success/10 text-success" : "bg-gray-100 text-gray-500")}>
                        {product.isActive ? 'Đang bán' : 'Ngừng bán'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => toggleStatusMutation.mutate(product.id)} className="p-1.5 text-gray-400 hover:text-primary transition-colors" title={product.isActive ? "Ngừng bán" : "Mở bán"}>
                          {product.isActive ? <PowerOff size={16} /> : <Power size={16} />}
                        </button>
                        <button onClick={() => openModal(product)} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors" title="Sửa">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => { if(window.confirm("Xóa sản phẩm này?")) deleteMutation.mutate(product.id) }} className="p-1.5 text-gray-400 hover:text-danger transition-colors" title="Xóa">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {productsData && productsData.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-white">
            {[...Array(productsData.totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={clsx(
                  "w-8 h-8 rounded text-sm font-medium transition-colors",
                  page === i + 1 ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
           <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl shadow-xl flex flex-col overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <h3 className="font-serif text-xl text-gray-900">{editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</h3>
               <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
             </div>

             <div className="flex border-b border-gray-100 px-6 pt-2 bg-gray-50">
               <button onClick={() => setActiveTab('general')} className={clsx("px-4 py-2 text-sm font-medium border-b-2 transition-colors", activeTab === 'general' ? "border-primary text-primary" : "border-transparent text-gray-500")}>Thông tin chung</button>
               <button onClick={() => setActiveTab('images')} className={clsx("px-4 py-2 text-sm font-medium border-b-2 transition-colors", activeTab === 'images' ? "border-primary text-primary" : "border-transparent text-gray-500")}>Hình ảnh</button>
               <button onClick={() => setActiveTab('variants')} className={clsx("px-4 py-2 text-sm font-medium border-b-2 transition-colors", activeTab === 'variants' ? "border-primary text-primary" : "border-transparent text-gray-500")}>Phân loại (Variants)</button>
             </div>

             <form onSubmit={handleSubmit(data => saveMutation.mutate(data))} className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {activeTab === 'general' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Tên sản phẩm</label>
                        <input {...register("name")} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Mã SKU</label>
                        <input {...register("sku")} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Giá bán cơ bản (VNĐ)</label>
                        <input type="number" {...register("basePrice")} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Mô tả ngắn</label>
                        <textarea {...register("shortDescription")} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary h-24"></textarea>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Mô tả chi tiết</label>
                        <textarea {...register("description")} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary h-32"></textarea>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'images' && (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                       <ImageIcon size={48} className="text-gray-300 mx-auto mb-4" />
                       <p className="text-sm text-gray-600 font-medium">Kéo thả ảnh vào đây hoặc click để tải lên</p>
                       <p className="text-xs text-gray-400 mt-2">Hỗ trợ JPG, PNG, WEBP (Tối đa 5MB)</p>
                    </div>
                    {/* // TODO: Add preview gallery for uploaded images */}
                  </div>
                )}

                {activeTab === 'variants' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-gray-900">Danh sách phân loại</h4>
                      <button type="button" onClick={() => append({ colorName: '', colorHex: '#000000', size: '', stockQuantity: 0, additionalPrice: 0 })} className="text-sm bg-gray-100 px-3 py-1.5 rounded hover:bg-gray-200 font-medium flex items-center gap-1">
                        <Plus size={14} /> Thêm phân loại
                      </button>
                    </div>
                    
                    {fields.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 border border-dashed rounded bg-gray-50">Sản phẩm chưa có phân loại nào</div>
                    ) : (
                      <table className="w-full text-sm text-left border">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-3 py-2 font-medium">Màu sắc</th>
                            <th className="px-3 py-2 font-medium">Hex</th>
                            <th className="px-3 py-2 font-medium">Size</th>
                            <th className="px-3 py-2 font-medium text-right">Tồn kho</th>
                            <th className="px-3 py-2 font-medium text-right">+ Giá</th>
                            <th className="px-3 py-2 text-center">Xóa</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {fields.map((field, index) => (
                            <tr key={field.id}>
                              <td className="px-2 py-2"><input {...register(`variants.${index}.colorName`)} className="w-full px-2 py-1 border rounded text-xs" placeholder="Tên màu" /></td>
                              <td className="px-2 py-2 flex items-center gap-2">
                                <input type="color" {...register(`variants.${index}.colorHex`)} className="w-6 h-6 p-0 border-0" />
                                <input {...register(`variants.${index}.colorHex`)} className="w-16 px-2 py-1 border rounded text-xs" />
                              </td>
                              <td className="px-2 py-2"><input {...register(`variants.${index}.size`)} className="w-full px-2 py-1 border rounded text-xs" placeholder="Size" /></td>
                              <td className="px-2 py-2"><input type="number" {...register(`variants.${index}.stockQuantity`)} className="w-full px-2 py-1 border rounded text-xs text-right" /></td>
                              <td className="px-2 py-2"><input type="number" {...register(`variants.${index}.additionalPrice`)} className="w-full px-2 py-1 border rounded text-xs text-right" /></td>
                              <td className="px-2 py-2 text-center">
                                <button type="button" onClick={() => remove(index)} className="text-danger hover:bg-danger/10 p-1 rounded"><Trash2 size={14}/></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
             </form>
             
             <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
               <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded transition-colors">Hủy</button>
               <button onClick={handleSubmit(data => saveMutation.mutate(data))} disabled={saveMutation.isPending} className="px-6 py-2 text-sm font-medium bg-primary text-white rounded hover:bg-gray-800 transition-colors disabled:opacity-50">
                 {saveMutation.isPending ? 'Đang lưu...' : 'Lưu sản phẩm'}
               </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};
