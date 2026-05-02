package com.hmkeyewear.controller;

import com.hmkeyewear.dto.request.AddToCartRequest;
import com.hmkeyewear.dto.request.UpdateCartItemRequest;
import com.hmkeyewear.dto.response.ApiResponse;
import com.hmkeyewear.dto.response.CartResponse;
import com.hmkeyewear.service.interfaces.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final com.hmkeyewear.service.interfaces.OrderService orderService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(
            Authentication authentication,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId
    ) {
        String userEmail = authentication != null ? authentication.getName() : null;
        System.out.println("[Cart Debug] GET /cart - userEmail: " + userEmail + ", sessionId: " + sessionId);
        return ResponseEntity.ok(ApiResponse.success(cartService.getCart(userEmail, sessionId)));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            Authentication authentication,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @Valid @RequestBody AddToCartRequest request
    ) {
        String userEmail = authentication != null ? authentication.getName() : null;
        System.out.println("[Cart Debug] POST /cart/items - userEmail: " + userEmail + ", sessionId: " + sessionId + ", variantId: " + request.getProductVariantId());
        return ResponseEntity.ok(ApiResponse.success(cartService.addToCart(userEmail, sessionId, request)));
    }

    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItem(
            Authentication authentication,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @PathVariable Long cartItemId,
            @Valid @RequestBody UpdateCartItemRequest request
    ) {
        String userEmail = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(ApiResponse.success(cartService.updateCartItem(userEmail, sessionId, cartItemId, request.getQuantity())));
    }

    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeCartItem(
            Authentication authentication,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @PathVariable Long cartItemId
    ) {
        String userEmail = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(ApiResponse.success(cartService.removeCartItem(userEmail, sessionId, cartItemId)));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(
            Authentication authentication,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId
    ) {
        String userEmail = authentication != null ? authentication.getName() : null;
        cartService.clearCart(userEmail, sessionId);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared successfully", null));
    }

    @PostMapping("/merge")
    public ResponseEntity<ApiResponse<CartResponse>> mergeGuestCart(
            Authentication authentication,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId
    ) {
        if (authentication == null) {
            throw new com.hmkeyewear.exception.ValidationException("User must be authenticated to merge cart");
        }
        String userEmail = authentication.getName();
        cartService.mergeGuestCartToUser(sessionId, userEmail);
        return ResponseEntity.ok(ApiResponse.success(cartService.getCart(userEmail, null)));
    }

    @PostMapping("/validate-coupon")
    public ResponseEntity<ApiResponse<com.hmkeyewear.dto.response.CouponValidateResponse>> validateCoupon(
            Authentication authentication,
            @Valid @RequestBody com.hmkeyewear.dto.request.CouponValidateRequest request
    ) {
        if (authentication == null) {
            throw new com.hmkeyewear.exception.ValidationException("User must be authenticated to validate coupon");
        }
        return ResponseEntity.ok(ApiResponse.success("Coupon applied", orderService.validateCoupon(authentication.getName(), request)));
    }
}
