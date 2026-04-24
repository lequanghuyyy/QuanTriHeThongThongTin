import { axiosInstance as api } from './axiosInstance';
import { Page, PageParams } from '../types/api.types';
import { Order, CheckoutRequest, OrderStatus } from '../types/order.types';

export const orderApi = {
  checkout: (data: CheckoutRequest) => api.post<never, Order>("/orders/checkout", data),
  getMyOrders: (params: PageParams & { status?: OrderStatus }) =>
    api.get<never, Page<Order>>("/orders", { params }),
  getByCode: (orderCode: string) => api.get<never, Order>(`/orders/${orderCode}`),
  cancel: (orderCode: string) => api.post<never, Order>(`/orders/${orderCode}/cancel`),
};
