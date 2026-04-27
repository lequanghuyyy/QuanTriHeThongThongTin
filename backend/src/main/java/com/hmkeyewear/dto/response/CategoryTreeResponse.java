package com.hmkeyewear.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CategoryTreeResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String imageUrl;
    private boolean isActive;
    private int level;
    private int sortOrder;
    private List<CategoryTreeResponse> children;
}
