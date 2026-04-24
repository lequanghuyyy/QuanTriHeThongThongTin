import { axiosInstance as api } from './axiosInstance';
import type { Page, PageParams } from '../types/api.types';
import type { 
  Product, 
  ProductFilterParams, 
  Category, 
  Collection, 
  ReviewSummary 
} from '../types/product.types';

export const productApi = {
  getList: (params: ProductFilterParams) =>
    api.get<never, Page<Product>>("/products", { params }),
  getBySlug: (slug: string) => api.get<never, Product>(`/products/${slug}`),
  search: (keyword: string) => api.get<never, Product[]>("/products/search", { params: { keyword } }),
  getBestSellers: (limit = 8, categorySlug?: string) => api.get<never, Product[]>("/products/best-sellers", { params: { limit, categorySlug } }),
  getFeatured: (limit = 8) => api.get<never, Product[]>("/products/featured", { params: { limit } }),
  getNewArrivals: (limit = 8) => api.get<never, Product[]>("/products/new-arrivals", { params: { limit } }),
  getRelated: (slug: string, limit = 4) => api.get<never, Product[]>(`/products/${slug}/related`, { params: { limit } }),
  getCategories: () => api.get<never, Category[]>("/categories"),
  getCollections: () => api.get<never, Collection[]>("/collections"),
  getCollectionBySlug: (slug: string) => api.get<never, Collection>(`/collections/${slug}`),
  getReviews: (slug: string, params: PageParams & { rating?: number }) =>
    api.get<never, ReviewSummary>(`/products/${slug}/reviews`, { params }),
};
