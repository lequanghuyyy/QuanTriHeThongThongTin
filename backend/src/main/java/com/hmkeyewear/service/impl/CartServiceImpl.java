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
    public CartResponse getCart(String userEmail) {
        User user = getUser(userEmail);
        List<CartItem> items = cartItemRepository.findByUser(user);
        return buildCartResponse(items);
    }

    @Override
    @Transactional
    public CartResponse addToCart(String userEmail, AddToCartRequest request) {
        User user = getUser(userEmail);
        ProductVariant variant = productVariantRepository.findById(request.getProductVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found"));

        if (!variant.getProduct().isActive()) {
            throw new ValidationException("Product is no longer active");
        }

        if (variant.getStockQuantity() < request.getQuantity()) {
            throw new ValidationException("Not enough stock available");
        }

        Optional<CartItem> existingItemOptional = cartItemRepository.findByUserAndProductVariantId(user, variant.getId());

        if (existingItemOptional.isPresent()) {
            CartItem existingItem = existingItemOptional.get();
            int newQuantity = existingItem.getQuantity() + request.getQuantity();
            if (variant.getStockQuantity() < newQuantity) {
                throw new ValidationException("Not enough stock available");
            }
            existingItem.setQuantity(newQuantity);
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = CartItem.builder()
                    .user(user)
                    .productVariant(variant)
                    .quantity(request.getQuantity())
                    .build();
            cartItemRepository.save(newItem);
        }

        return getCart(userEmail); // Refresh and return
    }

    @Override
    @Transactional
    public CartResponse updateCartItem(String userEmail, Long cartItemId, int quantity) {
        User user = getUser(userEmail);
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Cart item not found");
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

        return getCart(userEmail);
    }

    @Override
    @Transactional
    public CartResponse removeCartItem(String userEmail, Long cartItemId) {
        User user = getUser(userEmail);
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Cart item not found");
        }

        cartItemRepository.delete(cartItem);
        return getCart(userEmail);
    }

    @Override
    @Transactional
    public void clearCart(String userEmail) {
        User user = getUser(userEmail);
        cartItemRepository.deleteByUser(user);
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
            BigDecimal unitPrice = variant.getProduct().getSalePrice() != null ? 
                                   variant.getProduct().getSalePrice() : variant.getProduct().getBasePrice();
            unitPrice = unitPrice.add(variant.getAdditionalPrice());
            BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));

            boolean isAvailable = variant.getProduct().isActive() && variant.getStockQuantity() >= item.getQuantity();

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
