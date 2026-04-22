package com.hmkeyewear.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserProfileRequest {
    @NotBlank(message = "Full name is required")
    private String fullName;
    private String phone;
    private String avatar;
}
