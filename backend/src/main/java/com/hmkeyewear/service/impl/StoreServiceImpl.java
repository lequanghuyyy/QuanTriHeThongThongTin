package com.hmkeyewear.service.impl;

import com.hmkeyewear.entity.Store;
import com.hmkeyewear.exception.ResourceNotFoundException;
import com.hmkeyewear.repository.StoreRepository;
import com.hmkeyewear.service.interfaces.StoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StoreServiceImpl implements StoreService {

    private final StoreRepository storeRepository;

    @Override
    public List<Store> getStores(String province) {
        if (province != null && !province.trim().isEmpty()) {
            return storeRepository.findByProvinceAndIsActiveTrue(province);
        }
        return storeRepository.findByIsActiveTrue();
    }

    @Override
    public Store getStoreById(Long id) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found"));
        if (!store.isActive()) {
            throw new ResourceNotFoundException("Store is inactive");
        }
        return store;
    }

    @Override
    public List<Store> getNearbyStores(double lat, double lng, double radius) {
        return storeRepository.findNearbyStores(lat, lng, radius);
    }
}
