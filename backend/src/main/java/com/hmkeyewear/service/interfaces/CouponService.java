package com.hmkeyewear.service.interfaces;

import com.hmkeyewear.dto.request.CouponRequest;
import com.hmkeyewear.dto.request.CouponValidateRequest;
import com.hmkeyewear.dto.response.CouponValidateResponse;
import com.hmkeyewear.entity.Coupon;

import java.util.List;

public interface CouponService {
    List<Coupon> getAllCoupons();
    Coupon createCoupon(CouponRequest request);
    Coupon updateCoupon(Long id, CouponRequest request);
    void deleteCoupon(Long id);
    CouponValidateResponse validateCoupon(CouponValidateRequest request);
}
