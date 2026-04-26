package com.hmkeyewear.dto.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class CollectionRequest {
    private String name;
    private String description;
    private String bannerImageUrl;
    private String season;
    private Boolean isActive;
    private LocalDate startDate;
    private LocalDate endDate;
}
