package com.hmkeyewear.service.impl;

import com.hmkeyewear.dto.response.CategoryTreeResponse;
import com.hmkeyewear.mapper.CategoryMapper;
import com.hmkeyewear.repository.CategoryRepository;
import com.hmkeyewear.service.interfaces.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    @Cacheable(value = "categories", key = "'tree'")
    public List<CategoryTreeResponse> getCategoryTree() {
        return categoryRepository.findByLevelAndIsActiveTrueOrderBySortOrderAsc(0).stream()
                .map(categoryMapper::toTreeResponse)
                .collect(Collectors.toList());
    }
}
