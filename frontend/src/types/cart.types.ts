import type { ProductVariant } from "./product.types";

export interface CartItem {
  cartItemId: number;
  product: { id: number; name: string; slug: string; thumbnailUrl: string };
  variant: ProductVariant;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isAvailable: boolean;
  stockQuantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

export interface CouponValidation {
  valid: boolean;
  discountAmount: number;
  finalPrice: number;
  couponInfo: { code: string; description: string; discountType: string };
}
