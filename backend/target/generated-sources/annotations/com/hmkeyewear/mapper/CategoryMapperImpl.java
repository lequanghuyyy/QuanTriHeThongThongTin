package com.hmkeyewear.mapper;

import com.hmkeyewear.dto.response.CategoryTreeResponse;
import com.hmkeyewear.entity.Category;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-03T10:18:50+0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class CategoryMapperImpl implements CategoryMapper {

    @Override
    public CategoryTreeResponse toTreeResponse(Category category) {
        if ( category == null ) {
            return null;
        }

        CategoryTreeResponse.CategoryTreeResponseBuilder categoryTreeResponse = CategoryTreeResponse.builder();

        categoryTreeResponse.children( categoryListToCategoryTreeResponseList( category.getChildren() ) );
        categoryTreeResponse.isActive( category.isActive() );
        categoryTreeResponse.description( category.getDescription() );
        categoryTreeResponse.id( category.getId() );
        categoryTreeResponse.imageUrl( category.getImageUrl() );
        categoryTreeResponse.level( category.getLevel() );
        categoryTreeResponse.name( category.getName() );
        categoryTreeResponse.slug( category.getSlug() );
        categoryTreeResponse.sortOrder( category.getSortOrder() );

        return categoryTreeResponse.build();
    }

    protected List<CategoryTreeResponse> categoryListToCategoryTreeResponseList(List<Category> list) {
        if ( list == null ) {
            return null;
        }

        List<CategoryTreeResponse> list1 = new ArrayList<CategoryTreeResponse>( list.size() );
        for ( Category category : list ) {
            list1.add( toTreeResponse( category ) );
        }

        return list1;
    }
}
