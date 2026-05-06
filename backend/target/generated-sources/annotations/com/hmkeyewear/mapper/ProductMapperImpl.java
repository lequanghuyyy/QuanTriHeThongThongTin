package com.hmkeyewear.mapper;

import com.hmkeyewear.dto.response.ProductCardResponse;
import com.hmkeyewear.dto.response.ProductDetailResponse;
import com.hmkeyewear.entity.Category;
import com.hmkeyewear.entity.Collection;
import com.hmkeyewear.entity.Product;
import com.hmkeyewear.entity.ProductImage;
import com.hmkeyewear.entity.ProductVariant;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-06T11:48:16+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.1 (Oracle Corporation)"
)
@Component
public class ProductMapperImpl implements ProductMapper {

    @Override
    public ProductCardResponse toCardResponse(Product product) {
        if ( product == null ) {
            return null;
        }

        ProductCardResponse.ProductCardResponseBuilder productCardResponse = ProductCardResponse.builder();

        productCardResponse.category( categoryToCategoryInfo( product.getCategory() ) );
        productCardResponse.thumbnailUrl( getThumbnailUrl( product ) );
        productCardResponse.id( product.getId() );
        productCardResponse.name( product.getName() );
        productCardResponse.slug( product.getSlug() );
        productCardResponse.basePrice( product.getBasePrice() );
        productCardResponse.salePrice( product.getSalePrice() );
        productCardResponse.discountPercent( product.getDiscountPercent() );
        productCardResponse.averageRating( product.getAverageRating() );
        productCardResponse.reviewCount( product.getReviewCount() );
        productCardResponse.variants( productVariantListToVariantInfoList( product.getVariants() ) );

        return productCardResponse.build();
    }

    @Override
    public ProductDetailResponse toDetailResponse(Product product) {
        if ( product == null ) {
            return null;
        }

        ProductDetailResponse.ProductDetailResponseBuilder productDetailResponse = ProductDetailResponse.builder();

        productDetailResponse.category( categoryToCategoryInfo1( product.getCategory() ) );
        productDetailResponse.collection( collectionToCollectionInfo( product.getCollection() ) );
        if ( product.getGender() != null ) {
            productDetailResponse.gender( product.getGender().name() );
        }
        productDetailResponse.id( product.getId() );
        productDetailResponse.sku( product.getSku() );
        productDetailResponse.name( product.getName() );
        productDetailResponse.slug( product.getSlug() );
        productDetailResponse.description( product.getDescription() );
        productDetailResponse.shortDescription( product.getShortDescription() );
        if ( product.getProductType() != null ) {
            productDetailResponse.productType( product.getProductType().name() );
        }
        productDetailResponse.brand( product.getBrand() );
        productDetailResponse.basePrice( product.getBasePrice() );
        productDetailResponse.salePrice( product.getSalePrice() );
        productDetailResponse.discountPercent( product.getDiscountPercent() );
        productDetailResponse.averageRating( product.getAverageRating() );
        productDetailResponse.reviewCount( product.getReviewCount() );
        productDetailResponse.totalSold( product.getTotalSold() );
        productDetailResponse.lensIndex( product.getLensIndex() );
        productDetailResponse.lensCoating( product.getLensCoating() );
        productDetailResponse.lensFeature( product.getLensFeature() );
        productDetailResponse.material( product.getMaterial() );
        productDetailResponse.frameShape( product.getFrameShape() );
        productDetailResponse.images( productImageListToImageInfoList( product.getImages() ) );
        productDetailResponse.variants( productVariantListToVariantDetailInfoList( product.getVariants() ) );

        return productDetailResponse.build();
    }

    protected ProductCardResponse.CategoryInfo categoryToCategoryInfo(Category category) {
        if ( category == null ) {
            return null;
        }

        ProductCardResponse.CategoryInfo categoryInfo = new ProductCardResponse.CategoryInfo();

        categoryInfo.setId( category.getId() );
        categoryInfo.setName( category.getName() );
        categoryInfo.setSlug( category.getSlug() );

        return categoryInfo;
    }

    protected ProductCardResponse.VariantInfo productVariantToVariantInfo(ProductVariant productVariant) {
        if ( productVariant == null ) {
            return null;
        }

        ProductCardResponse.VariantInfo variantInfo = new ProductCardResponse.VariantInfo();

        variantInfo.setColorName( productVariant.getColorName() );
        variantInfo.setColorHex( productVariant.getColorHex() );
        variantInfo.setStockQuantity( productVariant.getStockQuantity() );

        return variantInfo;
    }

    protected List<ProductCardResponse.VariantInfo> productVariantListToVariantInfoList(List<ProductVariant> list) {
        if ( list == null ) {
            return null;
        }

        List<ProductCardResponse.VariantInfo> list1 = new ArrayList<ProductCardResponse.VariantInfo>( list.size() );
        for ( ProductVariant productVariant : list ) {
            list1.add( productVariantToVariantInfo( productVariant ) );
        }

        return list1;
    }

    protected ProductCardResponse.CategoryInfo categoryToCategoryInfo1(Category category) {
        if ( category == null ) {
            return null;
        }

        ProductCardResponse.CategoryInfo categoryInfo = new ProductCardResponse.CategoryInfo();

        categoryInfo.setId( category.getId() );
        categoryInfo.setName( category.getName() );
        categoryInfo.setSlug( category.getSlug() );

        return categoryInfo;
    }

    protected ProductDetailResponse.CollectionInfo collectionToCollectionInfo(Collection collection) {
        if ( collection == null ) {
            return null;
        }

        ProductDetailResponse.CollectionInfo collectionInfo = new ProductDetailResponse.CollectionInfo();

        collectionInfo.setId( collection.getId() );
        collectionInfo.setName( collection.getName() );
        collectionInfo.setSlug( collection.getSlug() );

        return collectionInfo;
    }

    protected ProductDetailResponse.ImageInfo productImageToImageInfo(ProductImage productImage) {
        if ( productImage == null ) {
            return null;
        }

        ProductDetailResponse.ImageInfo imageInfo = new ProductDetailResponse.ImageInfo();

        imageInfo.setId( productImage.getId() );
        imageInfo.setImageUrl( productImage.getImageUrl() );
        imageInfo.setAltText( productImage.getAltText() );
        imageInfo.setPrimary( productImage.isPrimary() );

        return imageInfo;
    }

    protected List<ProductDetailResponse.ImageInfo> productImageListToImageInfoList(List<ProductImage> list) {
        if ( list == null ) {
            return null;
        }

        List<ProductDetailResponse.ImageInfo> list1 = new ArrayList<ProductDetailResponse.ImageInfo>( list.size() );
        for ( ProductImage productImage : list ) {
            list1.add( productImageToImageInfo( productImage ) );
        }

        return list1;
    }

    protected ProductDetailResponse.VariantDetailInfo productVariantToVariantDetailInfo(ProductVariant productVariant) {
        if ( productVariant == null ) {
            return null;
        }

        ProductDetailResponse.VariantDetailInfo variantDetailInfo = new ProductDetailResponse.VariantDetailInfo();

        variantDetailInfo.setId( productVariant.getId() );
        variantDetailInfo.setSku( productVariant.getSku() );
        variantDetailInfo.setColorName( productVariant.getColorName() );
        variantDetailInfo.setColorHex( productVariant.getColorHex() );
        variantDetailInfo.setSize( productVariant.getSize() );
        variantDetailInfo.setAdditionalPrice( productVariant.getAdditionalPrice() );
        variantDetailInfo.setStockQuantity( productVariant.getStockQuantity() );
        variantDetailInfo.setImageUrl( productVariant.getImageUrl() );

        return variantDetailInfo;
    }

    protected List<ProductDetailResponse.VariantDetailInfo> productVariantListToVariantDetailInfoList(List<ProductVariant> list) {
        if ( list == null ) {
            return null;
        }

        List<ProductDetailResponse.VariantDetailInfo> list1 = new ArrayList<ProductDetailResponse.VariantDetailInfo>( list.size() );
        for ( ProductVariant productVariant : list ) {
            list1.add( productVariantToVariantDetailInfo( productVariant ) );
        }

        return list1;
    }
}
