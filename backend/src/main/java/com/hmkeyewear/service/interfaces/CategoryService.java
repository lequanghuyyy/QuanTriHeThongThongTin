package com.hmkeyewear.service.interfaces;

import com.hmkeyewear.dto.response.CategoryTreeResponse;

import java.util.List;

public interface CategoryService {
    List<CategoryTreeResponse> getCategoryTree();
}
