package com.hmkeyewear.controller;

import com.hmkeyewear.dto.response.ApiResponse;
import com.hmkeyewear.entity.Store;
import com.hmkeyewear.service.interfaces.StoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/stores")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Store>>> getStores(
            @RequestParam(required = false) String province
    ) {
        return ResponseEntity.ok(ApiResponse.success(storeService.getStores(province)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Store>> getStoreById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(storeService.getStoreById(id)));
    }

    @GetMapping("/nearby")
    public ResponseEntity<ApiResponse<List<Store>>> getNearbyStores(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "5") double radius
    ) {
        return ResponseEntity.ok(ApiResponse.success(storeService.getNearbyStores(lat, lng, radius)));
    }
}
