package com.hmkeyewear.repository;

import com.hmkeyewear.entity.Order;
import com.hmkeyewear.entity.User;
import com.hmkeyewear.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderCode(String orderCode);
    
    @EntityGraph(attributePaths = {"items", "items.productVariant", "items.productVariant.product"})
    Page<Order> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    @EntityGraph(attributePaths = {"items", "items.productVariant", "items.productVariant.product"})
    Page<Order> findByUserAndStatusOrderByCreatedAtDesc(User user, OrderStatus status, Pageable pageable);
    
    @EntityGraph(attributePaths = {"items", "items.productVariant", "items.productVariant.product", "user"})
    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    @EntityGraph(attributePaths = {"items", "items.productVariant", "items.productVariant.product", "user"})
    Page<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status, Pageable pageable);
}
