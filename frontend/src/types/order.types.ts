import { ProductVariant } from "./product.types";

export type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPING" | "DELIVERED" | "CANCELLED" | "REFUNDED";
export type PaymentMethod = "COD" | "BANK_TRANSFER" | "MOMO" | "VNPAY" | "ZALOPAY";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface OrderItem {
  id: number;
  productName: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productVariant: ProductVariant;
  canReview: boolean;
}

export interface ShippingAddress {
  recipientName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  addressDetail: string;
}

export interface Order {
  id: number;
  orderCode: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  couponCode: string | null;
  shippingAddress: ShippingAddress;
  note: string | null;
  trackingCode: string | null;
  items: OrderItem[];
  createdAt: string;
  deliveredAt: string | null;
}

export interface CheckoutRequest {
  addressId?: number;
  shippingAddress?: ShippingAddress;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  note?: string;
  items: { productVariantId: number; quantity: number }[];
}
