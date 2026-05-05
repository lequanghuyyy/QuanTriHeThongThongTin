export interface CartItem {
  id: number;
  productVariantId: number;
  productName: string;
  slug: string;
  colorName: string;
  thumbnailUrl: string;
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
