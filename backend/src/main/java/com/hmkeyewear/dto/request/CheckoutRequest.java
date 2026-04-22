package com.hmkeyewear.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CheckoutRequest {
    private Long addressId;
    private AddressDto shippingAddress;
    private String paymentMethod;
    private String couponCode;
    private String note;
    
    @Data
    public static class AddressDto {
        private String recipientName;
        private String phone;
        private String province;
        private String district;
        private String ward;
        private String addressDetail;
    }
}
