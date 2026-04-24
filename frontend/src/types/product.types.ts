import type { Page, PageParams } from "./api.types";

export interface Product {
  id: number;
  sku: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  productType: "FRAME" | "LENS" | "SUNGLASSES" | "ACCESSORY";
  brand: string;
  basePrice: number;
  salePrice: number | null;
  discountPercent: number;
  thumbnailUrl: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  totalSold: number;
  averageRating: number;
  reviewCount: number;
  isActive: boolean;
  category: { id: number; name: string; slug: string };
  collection: { id: number; name: string; slug: string } | null;
  images: ProductImage[];
  variants: ProductVariant[];
  // Tròng kính
  lensIndex?: string;
  lensCoating?: string;
  lensFeature?: string;
  minPower?: number;
  maxPower?: number;
  // Gọng kính / Kính mát
  material?: string;
  frameShape?: string;
  gender?: "MALE" | "FEMALE" | "UNISEX" | "KIDS";
}

export interface ProductImage {
  id: number;
  imageUrl: string;
  altText: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: number;
  colorName: string;
  colorHex: string;
  size: string | null;
  additionalPrice: number;
  stockQuantity: number;
  sku: string;
  imageUrl: string | null;
}

export interface ProductFilterParams extends PageParams {
  categorySlug?: string;
  collectionSlug?: string;
  productType?: string;
  gender?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  lensIndex?: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  keyword?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  level: number;
  children?: Category[];
}

export interface Collection {
  id: number;
  name: string;
  slug: string;
  description: string;
  bannerImageUrl: string;
  season: string | null;
}

export interface Review {
  id: number;
  user: { id: string; fullName: string; avatar: string | null };
  rating: number;
  title: string;
  content: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalCount: number;
  ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
  reviews: Page<Review>;
}
