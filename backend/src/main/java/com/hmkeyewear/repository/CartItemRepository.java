package com.hmkeyewear.repository;

import com.hmkeyewear.entity.CartItem;
import com.hmkeyewear.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUser(User user);
    Optional<CartItem> findByUserAndProductVariantId(User user, Long variantId);
    void deleteByUser(User user);
}
