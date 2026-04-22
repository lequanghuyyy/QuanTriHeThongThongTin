package com.hmkeyewear.mapper;

import com.hmkeyewear.dto.response.ProductCardResponse;
import com.hmkeyewear.dto.response.ProductDetailResponse;
import com.hmkeyewear.entity.Product;
import com.hmkeyewear.entity.ProductImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(target = "category.id", source = "category.id")
    @Mapping(target = "category.name", source = "category.name")
    @Mapping(target = "category.slug", source = "category.slug")
    ProductCardResponse toCardResponse(Product product);

    @Mapping(target = "category", source = "category")
    @Mapping(target = "collection", source = "collection")
    @Mapping(target = "gender", source = "gender")
    ProductDetailResponse toDetailResponse(Product product);
}
