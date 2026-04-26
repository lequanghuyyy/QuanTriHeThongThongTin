import { axiosInstance as api } from './axiosInstance';
import type { Page } from '../types/api.types';
import type { Product } from '../types/product.types';
import type { Order } from '../types/order.types';

export const adminApi = {
  getDashboardOverview: () => api.get<never, any>("/admin/dashboard/overview"),
  getRevenueChart: (params: { period: string }) => api.get<never, any>("/admin/dashboard/revenue-chart", { params }),
  getOrderStatusChart: () => api.get<never, any>("/admin/dashboard/order-status-chart"),
  getTopProducts: () => api.get<never, any>("/admin/dashboard/top-products"),
  getLowStockAlerts: () => api.get<never, any>("/admin/dashboard/low-stock-alerts"),
  
  // Products management
  getProducts: (params: any) => api.get<never, Page<Product>>("/admin/products", { params }),
  createProduct: (data: any) => api.post<never, Product>("/admin/products", data),
  updateProduct: (id: number, data: any) => api.put<never, Product>(`/admin/products/${id}`, data),
  toggleProductStatus: (id: number) => api.put<never, void>(`/admin/products/${id}/toggle-status`),
  deleteProduct: (id: number) => api.delete<never, void>(`/admin/products/${id}`),

  // Orders management
  getOrders: (params: any) => api.get<never, Page<Order>>("/admin/orders", { params }),
  updateOrderStatus: (orderCode: string, data: any) => api.put<never, Order>(`/admin/orders/${orderCode}/status`, data),

  // Categories management
  getCategories: () => api.get<never, any[]>("/admin/categories"),
  createCategory: (data: any) => api.post<never, any>("/admin/categories", data),
  updateCategory: (id: number, data: any) => api.put<never, any>(`/admin/categories/${id}`, data),
  toggleCategoryStatus: (id: number) => api.put<never, void>(`/admin/categories/${id}/toggle-status`),
  deleteCategory: (id: number) => api.delete<never, void>(`/admin/categories/${id}`),

  // Collections management
  getCollections: () => api.get<never, any[]>("/admin/collections"),
  createCollection: (data: any) => api.post<never, any>("/admin/collections", data),
  updateCollection: (id: number, data: any) => api.put<never, any>(`/admin/collections/${id}`, data),
  toggleCollectionStatus: (id: number) => api.put<never, void>(`/admin/collections/${id}/toggle-status`),
  deleteCollection: (id: number) => api.delete<never, void>(`/admin/collections/${id}`),

  uploadImages: (files: FileList | File[]) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    return api.post<never, string[]>("/admin/upload/multiple", formData);
  }
};
