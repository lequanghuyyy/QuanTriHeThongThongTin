package com.hmkeyewear.repository;

import com.hmkeyewear.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlugAndIsActiveTrue(String slug);
    List<Category> findByLevelAndIsActiveTrueOrderBySortOrderAsc(int level);
}
