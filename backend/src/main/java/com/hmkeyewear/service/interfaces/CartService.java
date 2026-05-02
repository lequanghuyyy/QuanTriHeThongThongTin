package com.hmkeyewear.service.interfaces;

import com.hmkeyewear.dto.request.AddToCartRequest;
import com.hmkeyewear.dto.response.CartResponse;

public interface CartService {
    CartResponse getCart(String userEmail, String sessionId);
    CartResponse addToCart(String userEmail, String sessionId, AddToCartRequest request);
    CartResponse updateCartItem(String userEmail, String sessionId, Long cartItemId, int quantity);
    CartResponse removeCartItem(String userEmail, String sessionId, Long cartItemId);
    void clearCart(String userEmail, String sessionId);
    void mergeGuestCartToUser(String sessionId, String userEmail);
}
