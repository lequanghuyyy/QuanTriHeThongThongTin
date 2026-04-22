package com.hmkeyewear.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CouponValidateRequest {
    @NotBlank(message = "Coupon code is required")
    private String couponCode;

    @NotNull(message = "Subtotal is required")
    private BigDecimal subtotal;
}
