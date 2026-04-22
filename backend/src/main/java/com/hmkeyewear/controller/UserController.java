package com.hmkeyewear.controller;

import com.hmkeyewear.dto.request.AddressRequest;
import com.hmkeyewear.dto.request.ChangePasswordRequest;
import com.hmkeyewear.dto.request.UserProfileRequest;
import com.hmkeyewear.dto.response.AddressResponse;
import com.hmkeyewear.dto.response.ApiResponse;
import com.hmkeyewear.dto.response.AuthResponse;
import com.hmkeyewear.service.interfaces.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users/me")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<AuthResponse.UserData>> getProfile(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(userService.getProfile(authentication.getName())));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<AuthResponse.UserData>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UserProfileRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated", userService.updateProfile(authentication.getName(), request)));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        userService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    // Addresses
    @GetMapping("/addresses")
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getAddresses(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserAddresses(authentication.getName())));
    }

    @PostMapping("/addresses")
    public ResponseEntity<ApiResponse<AddressResponse>> addAddress(
            Authentication authentication,
            @Valid @RequestBody AddressRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Address added", userService.addAddress(authentication.getName(), request)));
    }

    @PutMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse<AddressResponse>> updateAddress(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Address updated", userService.updateAddress(authentication.getName(), id, request)));
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            Authentication authentication,
            @PathVariable Long id
    ) {
        userService.deleteAddress(authentication.getName(), id);
        return ResponseEntity.ok(ApiResponse.success("Address deleted", null));
    }

    @PatchMapping("/addresses/{id}/set-default")
    public ResponseEntity<ApiResponse<Void>> setDefaultAddress(
            Authentication authentication,
            @PathVariable Long id
    ) {
        userService.setDefaultAddress(authentication.getName(), id);
        return ResponseEntity.ok(ApiResponse.success("Default address set", null));
    }

    // Alias for getting orders
    @GetMapping("/orders")
    public ResponseEntity<?> getMyOrders(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        // Technically this should redirect or delegate to OrderController/OrderService.
        // I will return a placeholder since OrderService is not injected here directly, 
        // to avoid circular dependency or too many injections, but ideally it should call OrderService.
        // Actually, let's redirect to /api/v1/orders
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setLocation(java.net.URI.create("/api/v1/orders?page=" + page + "&size=" + size));
        return new ResponseEntity<>(headers, org.springframework.http.HttpStatus.FOUND);
    }
}
