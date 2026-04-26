package com.hmkeyewear.config;

import com.hmkeyewear.entity.User;
import com.hmkeyewear.enums.Provider;
import com.hmkeyewear.enums.Role;
import com.hmkeyewear.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "admin2@hmkeyewear.com";
        Optional<User> adminOpt = userRepository.findByEmail(adminEmail);

        if (adminOpt.isEmpty()) {
            User newAdmin = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode("Admin@123"))
                    .fullName("Super Admin")
                    .phone("0988888888")
                    .role(Role.ADMIN)
                    .provider(Provider.LOCAL)
                    .isActive(true)
                    .isEmailVerified(true)
                    .build();

            userRepository.save(newAdmin);
            log.info("============== TẠO ADMIN THÀNH CÔNG ==============");
            log.info("Email: {}", adminEmail);
            log.info("Mật khẩu: Admin@123");
            log.info("==================================================");
        } else {
            // Update password again to ensure it is exactly Admin@123
            User existingAdmin = adminOpt.get();
            existingAdmin.setPassword(passwordEncoder.encode("Admin@123"));
            existingAdmin.setActive(true);
            userRepository.save(existingAdmin);
            
            log.info("============== CẬP NHẬT ADMIN THÀNH CÔNG ==============");
            log.info("Email: {}", adminEmail);
            log.info("Mật khẩu đã được reset về: Admin@123");
            log.info("=======================================================");
        }
    }
}
