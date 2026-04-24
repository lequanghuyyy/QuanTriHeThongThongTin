import { axiosInstance as api } from './axiosInstance';

export const reviewApi = {
  createReview: (data: { orderItemId: number; rating: number; title: string; content: string }) => 
    api.post<never, any>('/reviews', data),
  getMyReviews: () => 
    api.get<never, any[]>('/reviews/me'),
};
