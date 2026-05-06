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
    @Mapping(target = "thumbnailUrl", source = "product", qualifiedByName = "getThumbnailUrl")
    @Mapping(target = "variants", source = "variants")
    ProductCardResponse toCardResponse(Product product);
    
    @Mapping(target = "id", source = "id")
    @Mapping(target = "colorName", source = "colorName")
    @Mapping(target = "colorHex", source = "colorHex")
    @Mapping(target = "stockQuantity", source = "stockQuantity")
    ProductCardResponse.VariantInfo toVariantInfo(com.hmkeyewear.entity.ProductVariant variant);

    @Named("getThumbnailUrl")
    default String getThumbnailUrl(Product product) {
        // Nếu có thumbnailUrl thì dùng
        if (product.getThumbnailUrl() != null && !product.getThumbnailUrl().isEmpty()) {
            return product.getThumbnailUrl();
        }
        // Nếu không có, lấy ảnh đầu tiên từ images
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            return product.getImages().get(0).getImageUrl();
        }
        // Trả về null để frontend hiển thị placeholder
        return null;
    }

    @Mapping(target = "category", source = "category")
    @Mapping(target = "collection", source = "collection")
    @Mapping(target = "gender", source = "gender")
    ProductDetailResponse toDetailResponse(Product product);
}
