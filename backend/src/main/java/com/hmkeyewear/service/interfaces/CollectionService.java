package com.hmkeyewear.service.interfaces;

import com.hmkeyewear.dto.request.CollectionRequest;
import com.hmkeyewear.dto.response.CollectionResponse;

import java.util.List;

public interface CollectionService {
    List<CollectionResponse> getAllActiveCollections();
    CollectionResponse getCollectionBySlug(String slug);
    List<CollectionResponse> getAllCollectionsForAdmin();
    CollectionResponse createCollection(CollectionRequest request);
    CollectionResponse updateCollection(Long id, CollectionRequest request);
    void toggleCollectionStatus(Long id);
    void deleteCollection(Long id);
}
