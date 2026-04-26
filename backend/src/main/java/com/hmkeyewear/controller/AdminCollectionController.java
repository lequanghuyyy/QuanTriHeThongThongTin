package com.hmkeyewear.controller;

import com.hmkeyewear.dto.request.CollectionRequest;
import com.hmkeyewear.dto.response.ApiResponse;
import com.hmkeyewear.dto.response.CollectionResponse;
import com.hmkeyewear.service.interfaces.CollectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/collections")
@RequiredArgsConstructor
public class AdminCollectionController {

    private final CollectionService collectionService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<CollectionResponse>>> getAllCollections() {
        return ResponseEntity.ok(ApiResponse.success(collectionService.getAllCollectionsForAdmin()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CollectionResponse>> createCollection(@RequestBody CollectionRequest request) {
        return ResponseEntity.ok(ApiResponse.success(collectionService.createCollection(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CollectionResponse>> updateCollection(@PathVariable Long id, @RequestBody CollectionRequest request) {
        return ResponseEntity.ok(ApiResponse.success(collectionService.updateCollection(id, request)));
    }

    @PutMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> toggleCollectionStatus(@PathVariable Long id) {
        collectionService.toggleCollectionStatus(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCollection(@PathVariable Long id) {
        collectionService.deleteCollection(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
