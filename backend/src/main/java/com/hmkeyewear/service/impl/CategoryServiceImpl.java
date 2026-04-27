package com.hmkeyewear.service.impl;

import com.hmkeyewear.dto.request.CategoryRequest;
import com.hmkeyewear.dto.response.CategoryTreeResponse;
import com.hmkeyewear.entity.Category;
import com.hmkeyewear.exception.ResourceNotFoundException;
import com.hmkeyewear.mapper.CategoryMapper;
import com.hmkeyewear.repository.CategoryRepository;
import com.hmkeyewear.service.interfaces.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    @Cacheable(value = "categories", key = "'tree'")
    @Transactional(readOnly = true)
    public List<CategoryTreeResponse> getCategoryTree() {
        return categoryRepository.findByLevelAndActiveTrueOrderBySortOrderAsc(0).stream()
                .map(categoryMapper::toTreeResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryTreeResponse> getAllCategoriesForAdmin() {
        return categoryRepository.findByLevelOrderBySortOrderAsc(0).stream()
                .map(categoryMapper::toTreeResponse)
                .collect(Collectors.toList());
    }

    @Override
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryTreeResponse createCategory(CategoryRequest request) {
        Category category = new Category();
        category.setName(request.getName());
        category.setSlug(generateSlug(request.getName()));
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());
        category.setActive(request.getIsActive() != null ? request.getIsActive() : true);
        category.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);

        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category not found"));
            category.setParent(parent);
            category.setLevel(parent.getLevel() + 1);
        } else {
            category.setLevel(0);
        }

        Category saved = categoryRepository.save(category);
        return categoryMapper.toTreeResponse(saved);
    }

    @Override
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryTreeResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());
        if (request.getIsActive() != null) {
            category.setActive(request.getIsActive());
        }
        if (request.getSortOrder() != null) {
            category.setSortOrder(request.getSortOrder());
        }

        if (request.getParentId() != null) {
            if (!request.getParentId().equals(id)) {
                Category parent = categoryRepository.findById(request.getParentId())
                        .orElseThrow(() -> new ResourceNotFoundException("Parent category not found"));
                category.setParent(parent);
                category.setLevel(parent.getLevel() + 1);
            }
        } else {
            category.setParent(null);
            category.setLevel(0);
        }

        Category saved = categoryRepository.save(category);
        return categoryMapper.toTreeResponse(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryTreeResponse toggleCategoryStatus(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        category.setActive(!category.isActive());
        Category saved = categoryRepository.save(category);
        return categoryMapper.toTreeResponse(saved);
    }

    @Override
    @CacheEvict(value = "categories", allEntries = true)
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        
        if (category.getChildren() != null && !category.getChildren().isEmpty()) {
            throw new IllegalStateException("Không thể xóa danh mục có danh mục con");
        }
        
        categoryRepository.delete(category);
    }

    private String generateSlug(String name) {
        return name.toLowerCase()
                .replaceAll("[àáạảãâầấậẩẫăằắặẳẵ]", "a")
                .replaceAll("[èéẹẻẽêềếệểễ]", "e")
                .replaceAll("[ìíịỉĩ]", "i")
                .replaceAll("[òóọỏõôồốộổỗơờớợởỡ]", "o")
                .replaceAll("[ùúụủũưừứựửữ]", "u")
                .replaceAll("[ỳýỵỷỹ]", "y")
                .replaceAll("[đ]", "d")
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
    }
}
