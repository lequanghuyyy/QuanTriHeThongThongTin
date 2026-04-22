package com.hmkeyewear.service.impl;

import com.hmkeyewear.dto.request.CouponRequest;
import com.hmkeyewear.dto.request.CouponValidateRequest;
import com.hmkeyewear.dto.response.CouponValidateResponse;
import com.hmkeyewear.entity.Coupon;
import com.hmkeyewear.enums.DiscountType;
import com.hmkeyewear.exception.DuplicateResourceException;
import com.hmkeyewear.exception.ResourceNotFoundException;
import com.hmkeyewear.exception.ValidationException;
import com.hmkeyewear.repository.CouponRepository;
import com.hmkeyewear.service.interfaces.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;

    @Override
    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    @Override
    public Coupon createCoupon(CouponRequest request) {
        if (couponRepository.findByCodeAndIsActiveTrue(request.getCode()).isPresent()) {
            throw new DuplicateResourceException("Coupon code already exists");
        }

        Coupon coupon = Coupon.builder()
                .code(request.getCode().toUpperCase())
                .description(request.getDescription())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minOrderValue(request.getMinOrderValue())
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .usageLimit(request.getUsageLimit())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .isActive(true)
                .build();

        return couponRepository.save(coupon);
    }

    @Override
    public Coupon updateCoupon(Long id, CouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));

        if (!coupon.getCode().equals(request.getCode().toUpperCase())) {
            if (couponRepository.findByCodeAndIsActiveTrue(request.getCode()).isPresent()) {
                throw new DuplicateResourceException("Coupon code already exists");
            }
        }

        coupon.setCode(request.getCode().toUpperCase());
        coupon.setDescription(request.getDescription());
        coupon.setDiscountType(request.getDiscountType());
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMinOrderValue(request.getMinOrderValue());
        coupon.setMaxDiscountAmount(request.getMaxDiscountAmount());
        coupon.setUsageLimit(request.getUsageLimit());
        coupon.setStartDate(request.getStartDate());
        coupon.setEndDate(request.getEndDate());

        return couponRepository.save(coupon);
    }

    @Override
    public void deleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));
        coupon.setActive(false);
        couponRepository.save(coupon);
    }

    @Override
    public CouponValidateResponse validateCoupon(CouponValidateRequest request) {
        Coupon coupon = couponRepository.findByCodeAndIsActiveTrue(request.getCouponCode())
                .orElseThrow(() -> new ValidationException("Invalid or inactive coupon code"));

        if (coupon.getEndDate() != null && coupon.getEndDate().isBefore(Instant.now())) {
            throw new ValidationException("Coupon has expired");
        }

        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new ValidationException("Coupon usage limit reached");
        }

        if (coupon.getMinOrderValue() != null && request.getSubtotal().compareTo(coupon.getMinOrderValue()) < 0) {
            throw new ValidationException("Order subtotal does not meet the minimum requirement for this coupon");
        }

        BigDecimal discountAmount = BigDecimal.ZERO;
        if (coupon.getDiscountType() == DiscountType.FIXED_AMOUNT) {
            discountAmount = coupon.getDiscountValue();
        } else if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            discountAmount = request.getSubtotal().multiply(coupon.getDiscountValue()).divide(new BigDecimal("100"));
        }

        if (coupon.getMaxDiscountAmount() != null && discountAmount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
            discountAmount = coupon.getMaxDiscountAmount();
        }

        BigDecimal finalPrice = request.getSubtotal().subtract(discountAmount);
        if (finalPrice.compareTo(BigDecimal.ZERO) < 0) finalPrice = BigDecimal.ZERO;

        return CouponValidateResponse.builder()
                .code(coupon.getCode())
                .discountAmount(discountAmount)
                .finalPrice(finalPrice)
                .description(coupon.getDescription())
                .build();
    }
}
