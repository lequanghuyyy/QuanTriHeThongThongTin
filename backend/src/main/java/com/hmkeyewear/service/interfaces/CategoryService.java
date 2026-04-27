package com.hmkeyewear.service.interfaces;

import com.hmkeyewear.dto.request.CategoryRequest;
import com.hmkeyewear.dto.response.CategoryTreeResponse;

import java.util.List;

public interface CategoryService {
    List<CategoryTreeResponse> getCategoryTree();
    List<CategoryTreeResponse> getAllCategoriesForAdmin();
    CategoryTreeResponse createCategory(CategoryRequest request);
    CategoryTreeResponse updateCategory(Long id, CategoryRequest request);
    CategoryTreeResponse toggleCategoryStatus(Long id);
    void deleteCategory(Long id);
}
