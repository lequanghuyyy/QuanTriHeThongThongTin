package com.hmkeyewear.dto.request;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class UpdateCartItemRequest {
    @Min(value = 0, message = "Quantity cannot be less than 0")
    private int quantity;
}
