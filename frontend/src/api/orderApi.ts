import { axiosInstance as api } from './axiosInstance';
import type { Page, PageParams } from '../types/api.types';
import type { Order, OrderSummary, CheckoutRequest, OrderStatus } from '../types/order.types';

export const orderApi = {
  checkout: (data: CheckoutRequest) => api.post<never, Order>("/orders/checkout", data),
  getMyOrders: (params: PageParams & { status?: OrderStatus }) => {
    // Filter out undefined values to avoid sending them as query params
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    );
    return api.get<never, Page<OrderSummary>>("/orders", { params: cleanParams });
  },
  getByCode: (orderCode: string) => api.get<never, Order>(`/orders/${orderCode}`),
  cancel: (orderCode: string) => api.post<never, Order>(`/orders/${orderCode}/cancel`),
};
