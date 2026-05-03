package com.hmkeyewear.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "reviews")
public class Review extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @OneToOne
    @JoinColumn(name = "order_item_id")
    private OrderItem orderItem;

    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ReviewImage> images = new ArrayList<>();

    private int rating;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private boolean isVerifiedPurchase;

    private boolean isApproved;
    
    // Helper methods
    public void addImage(ReviewImage image) {
        images.add(image);
        image.setReview(this);
    }
    
    public void removeImage(ReviewImage image) {
        images.remove(image);
        image.setReview(null);
    }
}
