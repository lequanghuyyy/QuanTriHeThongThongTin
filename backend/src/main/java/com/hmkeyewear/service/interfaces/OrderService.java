package com.hmkeyewear.service.interfaces;

import com.hmkeyewear.dto.request.CheckoutRequest;
import com.hmkeyewear.dto.request.CouponValidateRequest;
import com.hmkeyewear.dto.response.CouponValidateResponse;
import com.hmkeyewear.dto.response.OrderDetailResponse;
import com.hmkeyewear.dto.response.OrderSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    OrderDetailResponse checkout(String userEmail, CheckoutRequest request);
    Page<OrderSummaryResponse> getUserOrders(String userEmail, Pageable pageable, String status);
    OrderDetailResponse getOrderDetails(String userEmail, String orderCode);
    void cancelOrder(String userEmail, String orderCode);
    CouponValidateResponse validateCoupon(String userEmail, CouponValidateRequest request);
}
