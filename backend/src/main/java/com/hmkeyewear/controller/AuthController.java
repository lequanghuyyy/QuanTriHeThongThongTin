package com.hmkeyewear.controller;

import com.hmkeyewear.dto.request.LoginRequest;
import com.hmkeyewear.dto.request.RefreshRequest;
import com.hmkeyewear.dto.request.RegisterRequest;
import com.hmkeyewear.dto.response.ApiResponse;
import com.hmkeyewear.dto.response.AuthResponse;
import com.hmkeyewear.service.interfaces.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final com.hmkeyewear.service.interfaces.CartService cartService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.success("User registered successfully", authService.register(request)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId
    ) {
        AuthResponse authResponse = authService.login(request);
        
        // Merge guest cart if sessionId is provided
        if (sessionId != null && !sessionId.isEmpty()) {
            try {
                cartService.mergeGuestCartToUser(sessionId, request.getEmail());
            } catch (Exception e) {
                // Log error but don't fail login
                System.err.println("Failed to merge guest cart: " + e.getMessage());
            }
        }
        
        return ResponseEntity.ok(ApiResponse.success("Login successful", authResponse));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", authService.refreshToken(request)));
    }
}
