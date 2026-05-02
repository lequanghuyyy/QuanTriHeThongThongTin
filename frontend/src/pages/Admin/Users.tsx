import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import { formatDate } from '../../utils/formatters';
import { Search, Eye, X, UserCheck, UserX, Shield } from 'lucide-react';
import clsx from 'clsx';

const toast = {
  success: (msg: string) => alert(msg),
  error: (msg: string) => alert(msg)
};

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, roleFilter],
    queryFn: () => adminApi.getUsers({ page: page - 1, size: 10, keyword: search, role: roleFilter || undefined }),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (id: string) => adminApi.toggleUserActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success("Cập nhật trạng thái người dùng thành công");
      setDrawerOpen(false);
    }
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => adminApi.changeUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success("Cập nhật vai trò thành công");
    }
  });

  const openDrawer = (user: any) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  const users = usersData?.content || [];

  return (
    <div className="p-8 animate-fade-in relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Quản Lý Người Dùng</h1>
          <p className="text-gray-500 text-sm">Quản lý tài khoản và phân quyền người dùng.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm tên, email..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select 
              value={roleFilter} 
              onChange={e => setRoleFilter(e.target.value)}
              className="border border-gray-200 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary flex-1 sm:flex-none"
            >
              <option value="">Tất cả vai trò</option>
              <option value="USER">Khách hàng</option>
              <option value="ADMIN">Quản trị viên</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-white border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium">Người dùng</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Vai trò</th>
                <th className="px-6 py-4 font-medium">Ngày tạo</th>
                <th className="px-6 py-4 font-medium text-center">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-500">Không tìm thấy người dùng nào.</td></tr>
              ) : (
                users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => openDrawer(user)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                          {user.fullName?.charAt(0) || user.email?.charAt(0)}
                        </div>
                        <div className="font-medium text-gray-900">{user.fullName || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap",
                        user.role === 'ADMIN' ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                      )}>
                        {user.role === 'ADMIN' ? 'Quản trị' : 'Khách hàng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={clsx(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap",
                        user.active ? "bg-success/10 text-success" : "bg-red-100 text-red-600"
                      )}>
                        {user.active ? 'Hoạt động' : 'Vô hiệu'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        className="p-1.5 text-gray-400 hover:text-primary transition-colors" 
                        onClick={(e) => { e.stopPropagation(); openDrawer(user); }}
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {usersData && usersData.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-white">
            {[...Array(usersData.totalPages)].map((_, i) => (
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

      {drawerOpen && selectedUser && (
        <>
          <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 transition-opacity" onClick={() => setDrawerOpen(false)}></div>
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out border-l border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-serif text-xl text-gray-900">{selectedUser.fullName || 'N/A'}</h3>
                <p className="text-xs text-gray-500 mt-1">{selectedUser.email}</p>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="text-gray-400 hover:text-gray-600 p-2">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
              <div className="flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl">
                  {selectedUser.fullName?.charAt(0) || selectedUser.email?.charAt(0)}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3 border-b pb-2 text-sm">Thông tin cơ bản</h4>
                <div className="text-sm space-y-2">
                  <p className="flex justify-between">
                    <span className="text-gray-500">Họ tên:</span>
                    <span className="font-medium">{selectedUser.fullName || 'Chưa cập nhật'}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-500">Email:</span>
                    <span>{selectedUser.email}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-500">Số điện thoại:</span>
                    <span>{selectedUser.phone || 'Chưa cập nhật'}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-500">Ngày tạo:</span>
                    <span>{formatDate(selectedUser.createdAt)}</span>
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3 border-b pb-2 text-sm flex items-center gap-2">
                  <Shield size={16} /> Phân quyền
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Vai trò</label>
                    <select 
                      value={selectedUser.role}
                      onChange={(e) => changeRoleMutation.mutate({ id: selectedUser.id, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary bg-white"
                    >
                      <option value="USER">Khách hàng</option>
                      <option value="ADMIN">Quản trị viên</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-white">
              <button 
                onClick={() => toggleActiveMutation.mutate(selectedUser.id)}
                disabled={toggleActiveMutation.isPending}
                className={clsx(
                  "w-full py-3 rounded font-medium transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50",
                  selectedUser.active 
                    ? "bg-red-600 text-white hover:bg-red-700" 
                    : "bg-success text-white hover:bg-green-700"
                )}
              >
                {selectedUser.active ? <UserX size={18} /> : <UserCheck size={18} />}
                {toggleActiveMutation.isPending 
                  ? 'Đang xử lý...' 
                  : selectedUser.active ? 'Vô hiệu hóa tài khoản' : 'Kích hoạt tài khoản'
                }
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminUsers;
