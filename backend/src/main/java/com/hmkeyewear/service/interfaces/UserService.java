package com.hmkeyewear.service.interfaces;

import com.hmkeyewear.dto.request.AddressRequest;
import com.hmkeyewear.dto.request.ChangePasswordRequest;
import com.hmkeyewear.dto.request.UserProfileRequest;
import com.hmkeyewear.dto.response.AddressResponse;
import com.hmkeyewear.dto.response.AuthResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {
    AuthResponse.UserData getProfile(String email);
    AuthResponse.UserData updateProfile(String email, UserProfileRequest request);
    void changePassword(String email, ChangePasswordRequest request);

    List<AddressResponse> getUserAddresses(String email);
    AddressResponse addAddress(String email, AddressRequest request);
    AddressResponse updateAddress(String email, Long addressId, AddressRequest request);
    void deleteAddress(String email, Long addressId);
    void setDefaultAddress(String email, Long addressId);

    // Admin part
    Page<AuthResponse.UserData> getAllUsers(String role, String keyword, Pageable pageable);
    AuthResponse.UserData getUserById(String id);
    void toggleUserActive(String id);
    void changeUserRole(String id, String role);
}
