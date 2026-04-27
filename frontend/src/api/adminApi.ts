import { axiosInstance as api } from './axiosInstance';
import { useAuthStore } from '../store/authStore';
import type { Page } from '../types/api.types';
import type { Product } from '../types/product.types';
import type { Order } from '../types/order.types';

const toBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === '1' || normalized === 'true';
  }
  return false;
};

const normalizeIsActive = <T extends Record<string, any>>(item: T): T & { isActive: boolean } => {
  return {
    ...item,
    isActive: toBoolean(item.isActive ?? item.active ?? item.is_active),
  };
};

const normalizeCategoryTree = (category: Record<string, any>): Record<string, any> => {
  const normalizedCategory = normalizeIsActive(category);

  if (!Array.isArray(category.children)) {
    return normalizedCategory;
  }

  return {
    ...normalizedCategory,
    children: category.children.map((child: Record<string, any>) => normalizeCategoryTree(child)),
  };
};

const normalizeProduct = (product: Record<string, any>): Record<string, any> => {
  return normalizeIsActive(product);
};

const normalizeProductPage = (page: Page<Product>): Page<Product> => {
  return {
    ...page,
    content: page.content.map((product: Product) => normalizeProduct(product) as Product),
  };
};

export const adminApi = {
  getDashboardOverview: () => api.get<never, any>("/admin/dashboard/overview"),
  getRevenueChart: (params: { period: string }) => api.get<never, any>("/admin/dashboard/revenue-chart", { params }),
  getOrderStatusChart: () => api.get<never, any>("/admin/dashboard/order-status-chart"),
  getTopProducts: () => api.get<never, any>("/admin/dashboard/top-products"),
  getLowStockAlerts: () => api.get<never, any>("/admin/dashboard/low-stock-alerts"),

  // Products management
  getProducts: (params: any) => api.get<never, Page<Product>>("/admin/products", { params }).then((page) => normalizeProductPage(page)),
  createProduct: (data: any) => api.post<never, Product>("/admin/products", data).then((product) => normalizeProduct(product) as Product),
  updateProduct: (id: number, data: any) => api.put<never, Product>(`/admin/products/${id}`, data).then((product) => normalizeProduct(product) as Product),
  toggleProductStatus: (id: number) => api.put<never, void>(`/admin/products/${id}/toggle-status`),
  deleteProduct: (id: number) => api.delete<never, void>(`/admin/products/${id}`),

  // Orders management
  getOrders: (params: any) => api.get<never, Page<Order>>("/admin/orders", { params }),
  updateOrderStatus: (orderCode: string, data: any) => api.put<never, Order>(`/admin/orders/${orderCode}/status`, data),

  // Categories management
  getCategories: () => api.get<never, any[]>("/admin/categories").then((categories) =>
    categories.map((category) => normalizeCategoryTree(category))
  ),
  createCategory: (data: any) => api.post<never, any>("/admin/categories", data).then((category) => normalizeCategoryTree(category)),
  updateCategory: (id: number, data: any) => api.put<never, any>(`/admin/categories/${id}`, data).then((category) => normalizeCategoryTree(category)),
  toggleCategoryStatus: (id: number) => api.put<never, void>(`/admin/categories/${id}/toggle-status`),
  deleteCategory: (id: number) => api.delete<never, void>(`/admin/categories/${id}`),

  // Collections management
  getCollections: () => api.get<never, any[]>("/admin/collections").then((collections) =>
    collections.map((collection) => normalizeIsActive(collection))
  ),
  createCollection: (data: any) => api.post<never, any>("/admin/collections", data).then((collection) => normalizeIsActive(collection)),
  updateCollection: (id: number, data: any) => api.put<never, any>(`/admin/collections/${id}`, data).then((collection) => normalizeIsActive(collection)),
  toggleCollectionStatus: (id: number) => api.put<never, any>(`/admin/collections/${id}/toggle-status`),
  deleteCollection: (id: number) => api.delete<never, void>(`/admin/collections/${id}`),

  // Users management
  getUsers: (params: any) => api.get<never, Page<any>>("/admin/users", { params }),
  getUserById: (id: string) => api.get<never, any>(`/admin/users/${id}`),
  toggleUserActive: (id: string) => api.put<never, void>(`/admin/users/${id}/toggle-active`),
  changeUserRole: (id: string, role: string) => api.put<never, void>(`/admin/users/${id}/role`, { role }),

  uploadImages: async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    console.log('Files count:', files.length);
    for (const [key, value] of (formData as any).entries()) {
      console.log('FormData entry:', key, value);
    }
    const accessToken = useAuthStore.getState().accessToken;
    const baseURL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8080/api/v1';

    const response = await fetch(`${baseURL}/admin/upload/multiple`, {
      method: 'POST',
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.message || `Upload failed: ${response.status}`);
    }

    const result = await response.json();
    // Unwrap ApiResponse<List<String>> wrapper: { data: string[] }
    return (result?.data ?? result) as string[];
  },
};
