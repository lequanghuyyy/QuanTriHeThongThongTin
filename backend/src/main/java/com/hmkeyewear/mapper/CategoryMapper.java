package com.hmkeyewear.mapper;

import com.hmkeyewear.dto.response.CategoryTreeResponse;
import com.hmkeyewear.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    @Mapping(target = "children", source = "children")
    CategoryTreeResponse toTreeResponse(Category category);
}
