package com.hmkeyewear.controller;

import com.hmkeyewear.dto.request.CouponValidateRequest;
import com.hmkeyewear.dto.response.ApiResponse;
import com.hmkeyewear.dto.response.CouponValidateResponse;
import com.hmkeyewear.service.interfaces.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<CouponValidateResponse>> validateCoupon(
            @Valid @RequestBody CouponValidateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Coupon is valid", couponService.validateCoupon(request)));
    }
}
