package com.hmkeyewear.repository;

import com.hmkeyewear.entity.CartItem;
import com.hmkeyewear.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    @Query("SELECT ci FROM CartItem ci " +
           "JOIN FETCH ci.productVariant pv " +
           "JOIN FETCH pv.product p " +
           "WHERE ci.user = :user")
    List<CartItem> findByUser(@Param("user") User user);
    
    Optional<CartItem> findByUserAndProductVariantId(User user, Long variantId);
    void deleteByUser(User user);
    
    // Guest cart methods
    @Query("SELECT ci FROM CartItem ci " +
           "JOIN FETCH ci.productVariant pv " +
           "JOIN FETCH pv.product p " +
           "WHERE ci.sessionId = :sessionId")
    List<CartItem> findBySessionId(@Param("sessionId") String sessionId);
    
    Optional<CartItem> findBySessionIdAndProductVariantId(String sessionId, Long variantId);
    void deleteBySessionId(String sessionId);
}
