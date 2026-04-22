package com.hmkeyewear.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class CouponValidateResponse {
    private String code;
    private BigDecimal discountAmount;
    private BigDecimal finalPrice;
    private String description;
}
