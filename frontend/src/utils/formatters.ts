import dayjs from 'dayjs';
import type { OrderStatus } from '../types/order.types';

export const formatVND = (amount: number): string =>
  new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";

export const formatDate = (isoString: string): string =>
  dayjs(isoString).format("DD/MM/YYYY HH:mm");

export const formatOrderStatus = (status: OrderStatus): string => ({
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPING: "Đang giao hàng",
  DELIVERED: "Đã giao hàng",
  CANCELLED: "Đã hủy",
  REFUNDED: "Đã hoàn tiền",
}[status] || status);

export const getOrderStatusColor = (status: OrderStatus): string => ({
  PENDING: "text-yellow-600 bg-yellow-50",
  CONFIRMED: "text-blue-600 bg-blue-50",
  PROCESSING: "text-purple-600 bg-purple-50",
  SHIPPING: "text-orange-600 bg-orange-50",
  DELIVERED: "text-green-600 bg-green-50",
  CANCELLED: "text-red-600 bg-red-50",
  REFUNDED: "text-gray-600 bg-gray-50",
}[status] || "text-gray-600 bg-gray-50");
