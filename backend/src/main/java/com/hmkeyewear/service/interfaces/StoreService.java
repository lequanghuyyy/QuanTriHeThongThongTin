package com.hmkeyewear.service.interfaces;

import com.hmkeyewear.entity.Store;
import java.util.List;

public interface StoreService {
    List<Store> getStores(String province);
    Store getStoreById(Long id);
    List<Store> getNearbyStores(double lat, double lng, double radius);
}
