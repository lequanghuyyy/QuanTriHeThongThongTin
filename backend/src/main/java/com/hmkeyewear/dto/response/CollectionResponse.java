package com.hmkeyewear.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CollectionResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String bannerImageUrl;
    private String season;
    private boolean isActive;
    private LocalDate startDate;
    private LocalDate endDate;
}
