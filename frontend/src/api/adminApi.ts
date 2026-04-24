import { axiosInstance as api } from './axiosInstance';
import type { Page } from '../types/api.types';
import type { Product } from '../types/product.types';
import type { Order } from '../types/order.types';

export const adminApi = {
  getDashboardOverview: () => api.get<never, any>("/admin/dashboard/overview"),
  getRevenueChart: (params: { period: string }) => api.get<never, any>("/admin/dashboard/revenue", { params }),
  getOrderStatusChart: () => api.get<never, any>("/admin/dashboard/order-status"),
  getTopProducts: () => api.get<never, any>("/admin/dashboard/top-products"),
  getLowStockAlerts: () => api.get<never, any>("/admin/dashboard/low-stock"),
  
  // Products management
  getProducts: (params: any) => api.get<never, Page<Product>>("/admin/products", { params }),
  createProduct: (data: any) => api.post<never, Product>("/admin/products", data),
  updateProduct: (id: number, data: any) => api.put<never, Product>(`/admin/products/${id}`, data),
  toggleProductStatus: (id: number) => api.put<never, void>(`/admin/products/${id}/toggle-status`),
  deleteProduct: (id: number) => api.delete<never, void>(`/admin/products/${id}`),

  // Orders management
  getOrders: (params: any) => api.get<never, Page<Order>>("/admin/orders", { params }),
  updateOrderStatus: (orderCode: string, data: any) => api.put<never, Order>(`/admin/orders/${orderCode}/status`, data),
};
