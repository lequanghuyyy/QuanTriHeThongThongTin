import { axiosInstance as api } from './axiosInstance';
import type { Page, PageParams } from '../types/api.types';
import type { 
  Product, 
  ProductFilterParams, 
  Category, 
  Collection, 
  ReviewSummary 
} from '../types/product.types';

const toBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === '1' || normalized === 'true';
  }
  return false;
};

const normalizeProduct = (product: Record<string, any>): Product => {
  const imagesRaw = Array.isArray(product.images) ? product.images : [];
  const normalizedImages = imagesRaw
    .map((img: Record<string, any>, idx: number) => ({
      id: Number(img?.id ?? idx),
      imageUrl: String(img?.imageUrl ?? img?.url ?? '').trim(),
      altText: String(img?.altText ?? ''),
      isPrimary: toBoolean(img?.isPrimary ?? img?.primary ?? img?.is_primary),
      sortOrder: Number(img?.sortOrder ?? idx),
    }))
    .filter((img: { imageUrl: string }) => !!img.imageUrl);

  if (normalizedImages.length === 0 && typeof product.thumbnailUrl === 'string' && product.thumbnailUrl.trim()) {
    normalizedImages.push({
      id: -1,
      imageUrl: product.thumbnailUrl.trim(),
      altText: product.name || '',
      isPrimary: true,
      sortOrder: 0,
    });
  }

  return {
    ...product,
    isActive: toBoolean(product.isActive ?? product.active ?? product.is_active),
    images: normalizedImages,
  } as Product;
};

const normalizeProductPage = (page: Page<Product>): Page<Product> => ({
  ...page,
  content: (page.content || []).map((product) => normalizeProduct(product as Record<string, any>)),
});

export const productApi = {
  getList: (params: ProductFilterParams) =>
    api.get<never, Page<Product>>("/products", { params }).then((page) => normalizeProductPage(page)),
  getBySlug: (slug: string) => api.get<never, Product>(`/products/${slug}`).then((product) => normalizeProduct(product as Record<string, any>)),
  search: (keyword: string) => api.get<never, Product[]>("/products/search", { params: { keyword } }),
  getBestSellers: (limit = 8, categorySlug?: string) => api.get<never, Product[]>("/products/best-sellers", { params: { limit, categorySlug } }).then((products) => products.map((product) => normalizeProduct(product as Record<string, any>))),
  getFeatured: (limit = 8) => api.get<never, Product[]>("/products/featured", { params: { limit } }).then((products) => products.map((product) => normalizeProduct(product as Record<string, any>))),
  getNewArrivals: (limit = 8) => api.get<never, Product[]>("/products/new-arrivals", { params: { limit } }).then((products) => products.map((product) => normalizeProduct(product as Record<string, any>))),
  getRelated: (slug: string, limit = 4) => api.get<never, Product[]>(`/products/${slug}/related`, { params: { limit } }).then((products) => products.map((product) => normalizeProduct(product as Record<string, any>))),
  getCategories: () => api.get<never, Category[]>("/categories"),
  getCollections: () => api.get<never, Collection[]>("/collections"),
  getCollectionBySlug: (slug: string) => api.get<never, Collection>(`/collections/${slug}`),
  getReviews: (slug: string, params: PageParams & { rating?: number }) => {
    // Remove undefined values from params
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined)
    );
    return api.get<never, ReviewSummary>(`/products/${slug}/reviews`, { params: cleanParams });
  },
};
