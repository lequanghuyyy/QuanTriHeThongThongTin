package com.hmkeyewear.service.impl;

import com.hmkeyewear.dto.request.AddressRequest;
import com.hmkeyewear.dto.request.ChangePasswordRequest;
import com.hmkeyewear.dto.request.UserProfileRequest;
import com.hmkeyewear.dto.response.AddressResponse;
import com.hmkeyewear.dto.response.AuthResponse;
import com.hmkeyewear.entity.Address;
import com.hmkeyewear.entity.User;
import com.hmkeyewear.enums.Provider;
import com.hmkeyewear.enums.Role;
import com.hmkeyewear.exception.ResourceNotFoundException;
import com.hmkeyewear.exception.ValidationException;
import com.hmkeyewear.repository.AddressRepository;
import com.hmkeyewear.repository.UserRepository;
import com.hmkeyewear.service.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public AuthResponse.UserData getProfile(String email) {
        User user = getUser(email);
        return mapToUserData(user);
    }

    @Override
    @Transactional
    public AuthResponse.UserData updateProfile(String email, UserProfileRequest request) {
        User user = getUser(email);
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }
        userRepository.save(user);
        return mapToUserData(user);
    }

    @Override
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = getUser(email);

        if (user.getProvider() != Provider.LOCAL) {
            throw new ValidationException("Cannot change password for OAuth2 accounts.");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ValidationException("Current password is incorrect");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ValidationException("Passwords do not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public List<AddressResponse> getUserAddresses(String email) {
        User user = getUser(email);
        return addressRepository.findByUser(user).stream()
                .map(this::mapToAddressResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AddressResponse addAddress(String email, AddressRequest request) {
        User user = getUser(email);

        List<Address> currentAddresses = addressRepository.findByUser(user);
        if (currentAddresses.isEmpty()) {
            request.setDefault(true);
        }

        if (request.isDefault()) {
            currentAddresses.forEach(a -> {
                a.setDefault(false);
                addressRepository.save(a);
            });
        }

        Address address = Address.builder()
                .user(user)
                .recipientName(request.getRecipientName())
                .phone(request.getPhone())
                .province(request.getProvince())
                .district(request.getDistrict())
                .ward(request.getWard())
                .addressDetail(request.getAddressDetail())
                .isDefault(request.isDefault())
                .build();

        return mapToAddressResponse(addressRepository.save(address));
    }

    @Override
    @Transactional
    public AddressResponse updateAddress(String email, Long addressId, AddressRequest request) {
        User user = getUser(email);
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Address not found");
        }

        if (request.isDefault() && !address.isDefault()) {
            addressRepository.findByUser(user).forEach(a -> {
                a.setDefault(false);
                addressRepository.save(a);
            });
        }

        address.setRecipientName(request.getRecipientName());
        address.setPhone(request.getPhone());
        address.setProvince(request.getProvince());
        address.setDistrict(request.getDistrict());
        address.setWard(request.getWard());
        address.setAddressDetail(request.getAddressDetail());
        if (request.isDefault()) {
            address.setDefault(true);
        }

        return mapToAddressResponse(addressRepository.save(address));
    }

    @Override
    @Transactional
    public void deleteAddress(String email, Long addressId) {
        User user = getUser(email);
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Address not found");
        }

        if (address.isDefault()) {
            throw new ValidationException("Cannot delete default address");
        }

        addressRepository.delete(address);
    }

    @Override
    @Transactional
    public void setDefaultAddress(String email, Long addressId) {
        User user = getUser(email);
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Address not found");
        }

        addressRepository.findByUser(user).forEach(a -> {
            a.setDefault(false);
            addressRepository.save(a);
        });

        address.setDefault(true);
        addressRepository.save(address);
    }

    // Admins

    @Override
    public Page<AuthResponse.UserData> getAllUsers(String role, String keyword, Pageable pageable) {
        Specification<User> spec = Specification.where(null);
        if (role != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("role"), Role.valueOf(role)));
        }
        if (keyword != null) {
            String pattern = "%" + keyword.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("email")), pattern),
                    cb.like(cb.lower(root.get("fullName")), pattern),
                    cb.like(root.get("phone"), pattern)));
        }

        return userRepository.findAll(spec, pageable).map(this::mapToUserData);
    }

    @Override
    public AuthResponse.UserData getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToUserData(user);
    }

    @Override
    @Transactional
    public void toggleUserActive(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setActive(!user.isActive());
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void changeUserRole(String id, String roleStr) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setRole(Role.valueOf(roleStr));
        userRepository.save(user);
    }

    // Helpers

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private AuthResponse.UserData mapToUserData(User user) {
        return AuthResponse.UserData.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .avatar(user.getAvatar())
                .active(user.isActive())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .build();
    }

    private AddressResponse mapToAddressResponse(Address address) {
        return AddressResponse.builder()
                .id(address.getId())
                .recipientName(address.getRecipientName())
                .phone(address.getPhone())
                .province(address.getProvince())
                .district(address.getDistrict())
                .ward(address.getWard())
                .addressDetail(address.getAddressDetail())
                .isDefault(address.isDefault())
                .build();
    }
}
