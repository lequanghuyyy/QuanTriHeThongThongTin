import { axiosInstance as api } from './axiosInstance';
import type { Cart, CouponValidation } from '../types/cart.types';

export const cartApi = {
  getCart: () => api.get<never, Cart>("/cart"),
  addItem: (productVariantId: number, quantity: number) =>
    api.post<never, Cart>("/cart/items", { productVariantId, quantity }),
  updateItem: (cartItemId: number, quantity: number) =>
    api.put<never, Cart>(`/cart/items/${cartItemId}`, { quantity }),
  removeItem: (cartItemId: number) => api.delete<never, Cart>(`/cart/items/${cartItemId}`),
  clearCart: () => api.delete<never, void>("/cart"),
  validateCoupon: (code: string, subtotal: number) =>
    api.post<never, CouponValidation>("/cart/validate-coupon", { couponCode: code, subtotal }),
};
