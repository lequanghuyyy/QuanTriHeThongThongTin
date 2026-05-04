import { axiosInstance as api } from './axiosInstance';

export interface CreateReviewRequest {
  orderItemId?: number;
  productId?: number;
  rating: number;
  title: string;
  content: string;
  imageUrls?: string[];
}

export interface ReviewableItem {
  orderItemId?: number;
  productName: string;
  productSlug: string;
  variantName?: string;
  imageUrl: string;
  alreadyReviewed: boolean;
}

export interface ReviewResponse {
  id: number;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  variantName?: string;
  productId?: number;
  productName?: string;
  productSlug?: string;
  productThumbnail?: string;
  isApproved?: boolean;
  imageUrls?: string[];
}

export const reviewApi = {
  createReview: (data: CreateReviewRequest) => 
    api.post<any>('/reviews', data),
  
  getMyReviews: () => 
    api.get<any>('/reviews/my-reviews'),
  
  getReviewableItems: (orderCode: string) =>
    api.get<any>(`/orders/${orderCode}/reviewable-items`),
};
