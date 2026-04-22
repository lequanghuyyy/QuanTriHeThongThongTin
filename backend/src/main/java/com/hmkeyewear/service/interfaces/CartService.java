package com.hmkeyewear.service.interfaces;

import com.hmkeyewear.dto.request.AddToCartRequest;
import com.hmkeyewear.dto.response.CartResponse;

public interface CartService {
    CartResponse getCart(String userEmail);
    CartResponse addToCart(String userEmail, AddToCartRequest request);
    CartResponse updateCartItem(String userEmail, Long cartItemId, int quantity);
    CartResponse removeCartItem(String userEmail, Long cartItemId);
    void clearCart(String userEmail);
}
