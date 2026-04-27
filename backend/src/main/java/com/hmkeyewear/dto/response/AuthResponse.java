package com.hmkeyewear.dto.response;

import com.hmkeyewear.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private UserData user;
    
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserData {
        private String id;
        private String email;
        private String fullName;
        private String phone;
        private String role;
        private String avatar;
        private boolean active;
        private String createdAt;
    }
}
