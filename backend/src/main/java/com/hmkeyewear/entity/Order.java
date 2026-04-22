package com.hmkeyewear.entity;

import com.hmkeyewear.enums.OrderStatus;
import com.hmkeyewear.enums.PaymentMethod;
import com.hmkeyewear.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "orders")
public class Order extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String orderCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private String guestEmail;

    private String guestPhone;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    private BigDecimal subtotal;

    private BigDecimal shippingFee;

    private BigDecimal discount;

    private BigDecimal totalAmount;

    private String couponCode;

    private BigDecimal couponDiscount;

    @Column(columnDefinition = "JSON")
    private String shippingAddress;

    @Column(columnDefinition = "TEXT")
    private String note;

    private String shippingProvider;

    private String trackingCode;

    private Instant confirmedAt;
    private Instant shippedAt;
    private Instant deliveredAt;
    private Instant cancelledAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items;
}
