package com.hmkeyewear.dto.request;

import lombok.Data;

@Data
public class CategoryRequest {
    private String name;
    private String description;
    private String imageUrl;
    private Long parentId;
    private Boolean isActive;
    private Integer sortOrder;
}
