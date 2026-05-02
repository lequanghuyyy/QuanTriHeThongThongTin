package com.hmkeyewear.service.impl;

import com.hmkeyewear.dto.request.AddToCartRequest;
import com.hmkeyewear.dto.response.CartItemResponse;
import com.hmkeyewear.dto.response.CartResponse;
import com.hmkeyewear.entity.CartItem;
import com.hmkeyewear.entity.ProductVariant;
import com.hmkeyewear.entity.User;
import com.hmkeyewear.exception.ResourceNotFoundException;
import com.hmkeyewear.exception.ValidationException;
import com.hmkeyewear.repository.CartItemRepository;
import com.hmkeyewear.repository.ProductVariantRepository;
import com.hmkeyewear.repository.UserRepository;
import com.hmkeyewear.service.interfaces.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCart(String userEmail, String sessionId) {
        System.out.println("[Cart Debug] getCart called - userEmail: " + userEmail + ", sessionId: " + sessionId);
        List<CartItem> items;
        
        if (userEmail != null) {
            User user = getUser(userEmail);
            items = cartItemRepository.findByUser(user);
            System.out.println("[Cart Debug] Found " + items.size() + " items for user: " + userEmail);
        } else if (sessionId != null) {
            items = cartItemRepository.findBySessionId(sessionId);
            System.out.println("[Cart Debug] Found " + items.size() + " items for session: " + sessionId);
        } else {
            throw new ValidationException("Either userEmail or sessionId must be provided");
        }
        
        CartResponse response = buildCartResponse(items);
        System.out.println("[Cart Debug] Returning cart with " + response.getItemCount() + " items, subtotal: " + response.getSubtotal());
        return response;
    }

    @Override
    @Transactional
    public CartResponse addToCart(String userEmail, String sessionId, AddToCartRequest request) {
        ProductVariant variant = productVariantRepository.findById(request.getProductVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found"));

        if (!variant.getProduct().isActive()) {
            throw new ValidationException("Product is no longer active");
        }

        if (variant.getStockQuantity() < request.getQuantity()) {
            throw new ValidationException("Not enough stock available");
        }

        Optional<CartItem> existingItemOptional;
        
        if (userEmail != null) {
            User user = getUser(userEmail);
            existingItemOptional = cartItemRepository.findByUserAndProductVariantId(user, variant.getId());
            
            if (existingItemOptional.isPresent()) {
                updateExistingCartItem(existingItemOptional.get(), request.getQuantity(), variant);
            } else {
                CartItem newItem = CartItem.builder()
                        .user(user)
                        .productVariant(variant)
                        .quantity(request.getQuantity())
                        .build();
                cartItemRepository.save(newItem);
            }
        } else if (sessionId != null) {
            existingItemOptional = cartItemRepository.findBySessionIdAndProductVariantId(sessionId, variant.getId());
            
            if (existingItemOptional.isPresent()) {
                updateExistingCartItem(existingItemOptional.get(), request.getQuantity(), variant);
            } else {
                CartItem newItem = CartItem.builder()
                        .sessionId(sessionId)
                        .productVariant(variant)
                        .quantity(request.getQuantity())
                        .build();
                cartItemRepository.save(newItem);
            }
        } else {
            throw new ValidationException("Either userEmail or sessionId must be provided");
        }

        return getCart(userEmail, sessionId);
    }

    @Override
    @Transactional
    public CartResponse updateCartItem(String userEmail, String sessionId, Long cartItemId, int quantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        // Verify ownership
        if (userEmail != null) {
            User user = getUser(userEmail);
            if (cartItem.getUser() == null || !cartItem.getUser().getId().equals(user.getId())) {
                throw new ResourceNotFoundException("Cart item not found");
            }
        } else if (sessionId != null) {
            if (cartItem.getSessionId() == null || !cartItem.getSessionId().equals(sessionId)) {
                throw new ResourceNotFoundException("Cart item not found");
            }
        } else {
            throw new ValidationException("Either userEmail or sessionId must be provided");
        }

        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
        } else {
            if (cartItem.getProductVariant().getStockQuantity() < quantity) {
                throw new ValidationException("Not enough stock available");
            }
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
        }

        return getCart(userEmail, sessionId);
    }

    @Override
    @Transactional
    public CartResponse removeCartItem(String userEmail, String sessionId, Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        // Verify ownership
        if (userEmail != null) {
            User user = getUser(userEmail);
            if (cartItem.getUser() == null || !cartItem.getUser().getId().equals(user.getId())) {
                throw new ResourceNotFoundException("Cart item not found");
            }
        } else if (sessionId != null) {
            if (cartItem.getSessionId() == null || !cartItem.getSessionId().equals(sessionId)) {
                throw new ResourceNotFoundException("Cart item not found");
            }
        } else {
            throw new ValidationException("Either userEmail or sessionId must be provided");
        }

        cartItemRepository.delete(cartItem);
        return getCart(userEmail, sessionId);
    }

    @Override
    @Transactional
    public void clearCart(String userEmail, String sessionId) {
        if (userEmail != null) {
            User user = getUser(userEmail);
            cartItemRepository.deleteByUser(user);
        } else if (sessionId != null) {
            cartItemRepository.deleteBySessionId(sessionId);
        } else {
            throw new ValidationException("Either userEmail or sessionId must be provided");
        }
    }

    @Override
    @Transactional
    public void mergeGuestCartToUser(String sessionId, String userEmail) {
        if (sessionId == null || userEmail == null) {
            return;
        }

        User user = getUser(userEmail);
        List<CartItem> guestItems = cartItemRepository.findBySessionId(sessionId);

        for (CartItem guestItem : guestItems) {
            Optional<CartItem> existingUserItem = cartItemRepository.findByUserAndProductVariantId(
                    user, guestItem.getProductVariant().getId());

            if (existingUserItem.isPresent()) {
                // Merge quantities
                CartItem userItem = existingUserItem.get();
                int newQuantity = userItem.getQuantity() + guestItem.getQuantity();
                int maxStock = guestItem.getProductVariant().getStockQuantity();
                userItem.setQuantity(Math.min(newQuantity, maxStock));
                cartItemRepository.save(userItem);
            } else {
                // Transfer guest item to user
                guestItem.setUser(user);
                guestItem.setSessionId(null);
                cartItemRepository.save(guestItem);
            }
        }

        // Clean up remaining guest items (duplicates that were merged)
        cartItemRepository.deleteBySessionId(sessionId);
    }

    private void updateExistingCartItem(CartItem existingItem, int additionalQuantity, ProductVariant variant) {
        int newQuantity = existingItem.getQuantity() + additionalQuantity;
        if (variant.getStockQuantity() < newQuantity) {
            throw new ValidationException("Not enough stock available");
        }
        existingItem.setQuantity(newQuantity);
        cartItemRepository.save(existingItem);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private CartResponse buildCartResponse(List<CartItem> items) {
        BigDecimal subtotal = BigDecimal.ZERO;
        int itemCount = 0;

        List<CartItemResponse> itemResponses = items.stream().map(item -> {
            ProductVariant variant = item.getProductVariant();
            
            // Debug logging
            System.out.println("[Cart Debug] Building response for product: " + variant.getProduct().getName());
            System.out.println("[Cart Debug] - Variant ID: " + variant.getId());
            System.out.println("[Cart Debug] - Stock Quantity: " + variant.getStockQuantity());
            System.out.println("[Cart Debug] - Cart Item Quantity: " + item.getQuantity());
            System.out.println("[Cart Debug] - Product Active: " + variant.getProduct().isActive());
            System.out.println("[Cart Debug] - Base price: " + variant.getProduct().getBasePrice());
            System.out.println("[Cart Debug] - Sale price: " + variant.getProduct().getSalePrice());
            System.out.println("[Cart Debug] - Additional price: " + variant.getAdditionalPrice());
            
            BigDecimal unitPrice = variant.getProduct().getSalePrice() != null ? 
                                   variant.getProduct().getSalePrice() : variant.getProduct().getBasePrice();
            
            // Only add additional price if it's not null and not zero
            if (variant.getAdditionalPrice() != null && variant.getAdditionalPrice().compareTo(BigDecimal.ZERO) > 0) {
                unitPrice = unitPrice.add(variant.getAdditionalPrice());
                System.out.println("[Cart Debug] - Unit price after adding additional: " + unitPrice);
            } else {
                System.out.println("[Cart Debug] - Unit price (no additional): " + unitPrice);
            }
            
            BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
            System.out.println("[Cart Debug] - Quantity: " + item.getQuantity() + ", Total: " + totalPrice);

            boolean isAvailable = variant.getProduct().isActive() && variant.getStockQuantity() >= item.getQuantity();
            System.out.println("[Cart Debug] - isAvailable: " + isAvailable + " (active: " + variant.getProduct().isActive() + ", stock check: " + (variant.getStockQuantity() >= item.getQuantity()) + ")");

            return CartItemResponse.builder()
                    .id(item.getId())
                    .productVariantId(variant.getId())
                    .productName(variant.getProduct().getName())
                    .slug(variant.getProduct().getSlug())
                    .colorName(variant.getColorName())
                    .thumbnailUrl(variant.getImageUrl() != null ? variant.getImageUrl() : variant.getProduct().getThumbnailUrl())
                    .quantity(item.getQuantity())
                    .unitPrice(unitPrice)
                    .totalPrice(totalPrice)
                    .isAvailable(isAvailable)
                    .stockQuantity(variant.getStockQuantity())
                    .build();
        }).collect(Collectors.toList());

        for (CartItemResponse res : itemResponses) {
            if (res.isAvailable()) {
                subtotal = subtotal.add(res.getTotalPrice());
                itemCount += res.getQuantity();
            }
        }

        return CartResponse.builder()
                .items(itemResponses)
                .subtotal(subtotal)
                .itemCount(itemCount)
                .build();
    }
}
