package com.hmkeyewear.controller;

import com.hmkeyewear.dto.response.ApiResponse;
import com.hmkeyewear.dto.response.CollectionResponse;
import com.hmkeyewear.service.interfaces.CollectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/collections")
@RequiredArgsConstructor
public class CollectionController {

    private final CollectionService collectionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CollectionResponse>>> getAllCollections() {
        return ResponseEntity.ok(ApiResponse.success(collectionService.getAllActiveCollections()));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<CollectionResponse>> getCollectionBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(collectionService.getCollectionBySlug(slug)));
    }
}
