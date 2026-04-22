package com.hmkeyewear.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "stores")
public class Store {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String address;

    private String province;

    private String district;

    private String phone;

    private Double lat;

    private Double lng;

    private LocalTime openTime;

    private LocalTime closeTime;

    @Builder.Default
    private boolean isActive = true;
}
