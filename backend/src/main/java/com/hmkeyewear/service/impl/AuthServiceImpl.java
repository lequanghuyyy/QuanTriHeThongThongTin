package com.hmkeyewear.service.impl;

import com.hmkeyewear.dto.request.LoginRequest;
import com.hmkeyewear.dto.request.RefreshRequest;
import com.hmkeyewear.dto.request.RegisterRequest;
import com.hmkeyewear.dto.response.AuthResponse;
import com.hmkeyewear.entity.User;
import com.hmkeyewear.enums.Provider;
import com.hmkeyewear.enums.Role;
import com.hmkeyewear.exception.DuplicateResourceException;
import com.hmkeyewear.exception.ResourceNotFoundException;
import com.hmkeyewear.exception.UnauthorizedException;
import com.hmkeyewear.repository.UserRepository;
import com.hmkeyewear.security.CustomUserDetailsService;
import com.hmkeyewear.security.JwtService;
import com.hmkeyewear.service.interfaces.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new DuplicateResourceException("Email already exists");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.CUSTOMER)
                .provider(Provider.LOCAL)
                .isActive(true)
                .isEmailVerified(false) // Assuming email verification is a separate flow
                .build();

        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtService.generateAccessToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (AuthenticationException e) {
            throw new UnauthorizedException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.isActive()) {
            throw new UnauthorizedException("Account is locked");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtService.generateAccessToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    @Override
    public AuthResponse refreshToken(RefreshRequest request) {
        String token = request.getRefreshToken();
        String userEmail = jwtService.extractUsername(token);

        if (userEmail == null) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

        if (jwtService.isTokenValid(token, userDetails)) {
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            String accessToken = jwtService.generateAccessToken(userDetails);
            // Opt: generate new refresh token or return the same one
            String newRefreshToken = jwtService.generateRefreshToken(userDetails);
            
            return buildAuthResponse(user, accessToken, newRefreshToken);
        }

        throw new UnauthorizedException("Refresh token is expired or invalid");
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(AuthResponse.UserData.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .role(user.getRole().name())
                        .avatar(user.getAvatar())
                        .build())
                .build();
    }
}
