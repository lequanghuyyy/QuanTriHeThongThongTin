package com.hmkeyewear.entity;

import com.hmkeyewear.enums.Provider;
import com.hmkeyewear.enums.Role;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = true)
    private String password;

    private String fullName;

    private String phone;

    private String avatar;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Enumerated(EnumType.STRING)
    private Provider provider;

    private String providerId;

    @Builder.Default
    private boolean isActive = true;

    private boolean isEmailVerified;
}
