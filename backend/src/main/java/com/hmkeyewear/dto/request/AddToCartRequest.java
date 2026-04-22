package com.hmkeyewear.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddToCartRequest {
    @NotNull(message = "Variant ID is required")
    private Long productVariantId;

    @Min(value = 1, message = "Quantity must be at least 1")
    private int quantity;
}
