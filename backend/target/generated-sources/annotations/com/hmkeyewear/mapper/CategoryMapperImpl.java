package com.hmkeyewear.mapper;

import com.hmkeyewear.dto.response.CategoryTreeResponse;
import com.hmkeyewear.entity.Category;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-02T20:39:07+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.1 (Oracle Corporation)"
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
        categoryTreeResponse.id( category.getId() );
        categoryTreeResponse.name( category.getName() );
        categoryTreeResponse.slug( category.getSlug() );
        categoryTreeResponse.description( category.getDescription() );
        categoryTreeResponse.imageUrl( category.getImageUrl() );
        categoryTreeResponse.level( category.getLevel() );
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
