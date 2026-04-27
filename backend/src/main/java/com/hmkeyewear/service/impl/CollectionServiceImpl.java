package com.hmkeyewear.service.impl;

import com.hmkeyewear.dto.request.CollectionRequest;
import com.hmkeyewear.dto.response.CollectionResponse;
import com.hmkeyewear.entity.Collection;
import com.hmkeyewear.exception.ResourceNotFoundException;
import com.hmkeyewear.repository.CollectionRepository;
import com.hmkeyewear.service.interfaces.CollectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CollectionServiceImpl implements CollectionService {

    private final CollectionRepository collectionRepository;

    @Override
    public List<CollectionResponse> getAllActiveCollections() {
        return collectionRepository.findAllByActiveTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CollectionResponse getCollectionBySlug(String slug) {
        Collection collection = collectionRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Collection not found"));
        return toResponse(collection);
    }

    @Override
    public List<CollectionResponse> getAllCollectionsForAdmin() {
        return collectionRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    @CacheEvict(value = "collections", allEntries = true)
    public CollectionResponse createCollection(CollectionRequest request) {
        Collection collection = new Collection();
        collection.setName(request.getName());
        collection.setSlug(generateSlug(request.getName()));
        collection.setDescription(request.getDescription());
        collection.setBannerImageUrl(request.getBannerImageUrl());
        collection.setSeason(request.getSeason());
        collection.setActive(request.getIsActive() != null ? request.getIsActive() : true);
        collection.setStartDate(request.getStartDate());
        collection.setEndDate(request.getEndDate());

        Collection saved = collectionRepository.save(collection);
        return toResponse(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "collections", allEntries = true)
    public CollectionResponse updateCollection(Long id, CollectionRequest request) {
        Collection collection = collectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Collection not found"));

        collection.setName(request.getName());
        collection.setDescription(request.getDescription());
        collection.setBannerImageUrl(request.getBannerImageUrl());
        collection.setSeason(request.getSeason());
        if (request.getIsActive() != null) {
            collection.setActive(request.getIsActive());
        }
        collection.setStartDate(request.getStartDate());
        collection.setEndDate(request.getEndDate());

        Collection saved = collectionRepository.save(collection);
        return toResponse(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "collections", allEntries = true)
    public CollectionResponse toggleCollectionStatus(Long id) {
        Collection collection = collectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Collection not found"));
        collection.setActive(!collection.isActive());
        Collection saved = collectionRepository.save(collection);
        return toResponse(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "collections", allEntries = true)
    public void deleteCollection(Long id) {
        if (!collectionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Collection not found");
        }
        collectionRepository.deleteById(id);
    }

    private CollectionResponse toResponse(Collection collection) {
        return CollectionResponse.builder()
                .id(collection.getId())
                .name(collection.getName())
                .slug(collection.getSlug())
                .description(collection.getDescription())
                .bannerImageUrl(collection.getBannerImageUrl())
                .season(collection.getSeason())
                .isActive(collection.isActive())
                .startDate(collection.getStartDate())
                .endDate(collection.getEndDate())
                .build();
    }

    private String generateSlug(String name) {
        return name.toLowerCase()
                .replaceAll("[àáạảãâầấậẩẫăằắặẳẵ]", "a")
                .replaceAll("[èéẹẻẽêềếệểễ]", "e")
                .replaceAll("[ìíịỉĩ]", "i")
                .replaceAll("[òóọỏõôồốộổỗơờớợởỡ]", "o")
                .replaceAll("[ùúụủũưừứựửữ]", "u")
                .replaceAll("[ỳýỵỷỹ]", "y")
                .replaceAll("[đ]", "d")
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
    }
}
