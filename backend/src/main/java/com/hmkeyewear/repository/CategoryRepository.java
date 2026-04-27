package com.hmkeyewear.repository;

import com.hmkeyewear.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlugAndActiveTrue(String slug);
    List<Category> findByLevelAndActiveTrueOrderBySortOrderAsc(int level);
    List<Category> findByLevelOrderBySortOrderAsc(int level);
}
