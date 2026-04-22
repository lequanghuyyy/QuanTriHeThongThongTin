package com.hmkeyewear.service.interfaces;

import com.hmkeyewear.dto.request.LoginRequest;
import com.hmkeyewear.dto.request.RefreshRequest;
import com.hmkeyewear.dto.request.RegisterRequest;
import com.hmkeyewear.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(RefreshRequest request);
}
