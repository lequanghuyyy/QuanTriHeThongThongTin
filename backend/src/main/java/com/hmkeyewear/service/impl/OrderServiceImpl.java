package com.hmkeyewear.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hmkeyewear.dto.request.CheckoutRequest;
import com.hmkeyewear.dto.request.CouponValidateRequest;
import com.hmkeyewear.dto.response.*;
import com.hmkeyewear.entity.*;
import com.hmkeyewear.enums.DiscountType;
import com.hmkeyewear.enums.OrderStatus;
import com.hmkeyewear.enums.PaymentMethod;
import com.hmkeyewear.enums.PaymentStatus;
import com.hmkeyewear.exception.ResourceNotFoundException;
import com.hmkeyewear.exception.ValidationException;
import com.hmkeyewear.repository.*;
import com.hmkeyewear.service.interfaces.CartService;
import com.hmkeyewear.service.interfaces.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final CouponRepository couponRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CartService cartService;
    private final CartItemRepository cartItemRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public OrderDetailResponse checkout(String userEmail, CheckoutRequest request) {
        User user = getUser(userEmail);
        
        List<CartItem> cartItems = cartItemRepository.findByUser(user);
        if (cartItems.isEmpty()) {
            throw new ValidationException("Cart is empty");
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        // Validate stock and calculate subtotal
        for (CartItem cartItem : cartItems) {
            ProductVariant variant = cartItem.getProductVariant();
            if (!variant.getProduct().isActive() || variant.getStockQuantity() < cartItem.getQuantity()) {
                throw new ValidationException("Product " + variant.getProduct().getName() + " is out of stock or inactive.");
            }

            BigDecimal unitPrice = variant.getProduct().getSalePrice() != null ?
                    variant.getProduct().getSalePrice() : variant.getProduct().getBasePrice();
            unitPrice = unitPrice.add(variant.getAdditionalPrice());
            BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));

            subtotal = subtotal.add(totalPrice);

            OrderItem orderItem = OrderItem.builder()
                    .productVariant(variant)
                    .productName(variant.getProduct().getName())
                    .variantName(variant.getColorName())
                    .quantity(cartItem.getQuantity())
                    .unitPrice(unitPrice)
                    .totalPrice(totalPrice)
                    .build();
            orderItems.add(orderItem);
        }

        // Apply coupon
        BigDecimal discount = BigDecimal.ZERO;
        if (request.getCouponCode() != null && !request.getCouponCode().isEmpty()) {
            CouponValidateResponse cvr = validateCouponLogic(request.getCouponCode(), subtotal);
            discount = cvr.getDiscountAmount();
            
            Coupon coupon = couponRepository.findByCodeAndIsActiveTrue(request.getCouponCode()).get();
            coupon.setUsedCount(coupon.getUsedCount() + 1);
            couponRepository.save(coupon);
        }

        // Shipping fee logic
        BigDecimal shippingFee = calculateShippingFee(request.getShippingAddress() != null ? request.getShippingAddress().getProvince() : "");
        if (request.getAddressId() != null) {
            Address address = addressRepository.findById(request.getAddressId())
                    .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
            shippingFee = calculateShippingFee(address.getProvince());
        }

        BigDecimal totalAmount = subtotal.add(shippingFee).subtract(discount);
        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) totalAmount = BigDecimal.ZERO;

        // Create Order
        String orderCode = generateOrderCode();
        Order order = Order.builder()
                .orderCode(orderCode)
                .user(user)
                .status(OrderStatus.PENDING)
                .paymentMethod(PaymentMethod.valueOf(request.getPaymentMethod()))
                .paymentStatus(PaymentStatus.PENDING)
                .subtotal(subtotal)
                .shippingFee(shippingFee)
                .discount(discount)
                .totalAmount(totalAmount)
                .couponCode(request.getCouponCode())
                .couponDiscount(discount)
                .note(request.getNote())
                .build();

        try {
            if (request.getAddressId() != null) {
               Address address = addressRepository.findById(request.getAddressId()).get();
               order.setShippingAddress(objectMapper.writeValueAsString(address));
            } else if (request.getShippingAddress() != null) {
               order.setShippingAddress(objectMapper.writeValueAsString(request.getShippingAddress()));
            }
        } catch (JsonProcessingException e) {
            throw new ValidationException("Invalid shipping address");
        }

        Order savedOrder = orderRepository.save(order);

        // Deduct stock and save items
        for (OrderItem item : orderItems) {
            item.setOrder(savedOrder);
            ProductVariant variant = item.getProductVariant();
            variant.setStockQuantity(variant.getStockQuantity() - item.getQuantity());
            productVariantRepository.save(variant);
            // Optionally increase totalSold of the product
            Product product = variant.getProduct();
            product.setTotalSold(product.getTotalSold() + item.getQuantity());
        }
        orderItemRepository.saveAll(orderItems);

        // Clear Cart
        cartService.clearCart(userEmail, null);

        return buildOrderDetailResponse(savedOrder, orderItems);
    }

    private BigDecimal calculateShippingFee(String province) {
        // Mock simple logic based on prompt
        if (province != null && (province.contains("Hồ Chí Minh") || province.contains("HCM"))) {
            return new BigDecimal("25000"); // 25k HCM
        }
        return new BigDecimal("35000"); // 35k Others
    }

    private synchronized String generateOrderCode() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = orderRepository.count() + 1;
        return String.format("HMK%s%03d", dateStr, count % 1000);
    }

    @Override
    public Page<OrderSummaryResponse> getUserOrders(String userEmail, Pageable pageable) {
        User user = getUser(userEmail);
        return orderRepository.findByUser(user, pageable).map(order -> 
                OrderSummaryResponse.builder()
                        .orderCode(order.getOrderCode())
                        .status(order.getStatus().name())
                        .totalAmount(order.getTotalAmount())
                        .createdAt(order.getCreatedAt())
                        .itemCount(order.getItems().stream().mapToInt(OrderItem::getQuantity).sum())
                        .build()
        );
    }

    @Override
    public OrderDetailResponse getOrderDetails(String userEmail, String orderCode) {
        User user = getUser(userEmail);
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Order not found");
        }

        return buildOrderDetailResponse(order, order.getItems());
    }

    @Override
    @Transactional
    public void cancelOrder(String userEmail, String orderCode) {
        User user = getUser(userEmail);
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Order not found");
        }

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new ValidationException("Cannot cancel order in status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelledAt(Instant.now());
        
        // Restore stock
        for (OrderItem item : order.getItems()) {
            ProductVariant variant = item.getProductVariant();
            variant.setStockQuantity(variant.getStockQuantity() + item.getQuantity());
            productVariantRepository.save(variant);
        }

        orderRepository.save(order);
    }

    @Override
    public CouponValidateResponse validateCoupon(String userEmail, CouponValidateRequest request) {
        return validateCouponLogic(request.getCouponCode(), request.getSubtotal());
    }

    private CouponValidateResponse validateCouponLogic(String code, BigDecimal subtotal) {
        Coupon coupon = couponRepository.findByCodeAndIsActiveTrue(code)
                .orElseThrow(() -> new ValidationException("Invalid or inactive coupon code"));

        if (coupon.getEndDate() != null && coupon.getEndDate().isBefore(Instant.now())) {
            throw new ValidationException("Coupon has expired");
        }

        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new ValidationException("Coupon usage limit reached");
        }

        if (coupon.getMinOrderValue() != null && subtotal.compareTo(coupon.getMinOrderValue()) < 0) {
            throw new ValidationException("Order subtotal does not meet the minimum requirement for this coupon");
        }

        BigDecimal discountAmount = BigDecimal.ZERO;
        if (coupon.getDiscountType() == DiscountType.FIXED_AMOUNT) {
            discountAmount = coupon.getDiscountValue();
        } else if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            discountAmount = subtotal.multiply(coupon.getDiscountValue()).divide(new BigDecimal("100"));
        }

        if (coupon.getMaxDiscountAmount() != null && discountAmount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
            discountAmount = coupon.getMaxDiscountAmount();
        }

        BigDecimal finalPrice = subtotal.subtract(discountAmount);
        if (finalPrice.compareTo(BigDecimal.ZERO) < 0) finalPrice = BigDecimal.ZERO;

        return CouponValidateResponse.builder()
                .code(coupon.getCode())
                .discountAmount(discountAmount)
                .finalPrice(finalPrice)
                .description(coupon.getDescription())
                .build();
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private OrderDetailResponse buildOrderDetailResponse(Order order, List<OrderItem> items) {
        List<OrderItemResponse> itemResponses = items.stream().map(item -> {
            ProductVariant variant = item.getProductVariant();
            Product product = variant.getProduct();
            
            // Use variant image if available, otherwise use product thumbnail
            String imageUrl = variant.getImageUrl() != null && !variant.getImageUrl().isEmpty() 
                ? variant.getImageUrl() 
                : product.getThumbnailUrl();
            
            return OrderItemResponse.builder()
                .id(item.getId())
                .productVariantId(variant.getId())
                .productName(item.getProductName())
                .variantName(item.getVariantName())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .totalPrice(item.getTotalPrice())
                .imageUrl(imageUrl)
                .slug(product.getSlug())
                .build();
        }).collect(Collectors.toList());

        return OrderDetailResponse.builder()
                .orderCode(order.getOrderCode())
                .status(order.getStatus().name())
                .paymentMethod(order.getPaymentMethod().name())
                .paymentStatus(order.getPaymentStatus().name())
                .subtotal(order.getSubtotal())
                .shippingFee(order.getShippingFee())
                .discount(order.getDiscount())
                .totalAmount(order.getTotalAmount())
                .couponCode(order.getCouponCode())
                .shippingAddress(order.getShippingAddress())
                .note(order.getNote())
                .createdAt(order.getCreatedAt())
                .items(itemResponses)
                .build();
    }
}
