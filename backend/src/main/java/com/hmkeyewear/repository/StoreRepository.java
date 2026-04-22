package com.hmkeyewear.repository;

import com.hmkeyewear.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StoreRepository extends JpaRepository<Store, Long> {
    
    List<Store> findByProvinceAndIsActiveTrue(String province);
    List<Store> findByIsActiveTrue();

    // Haversine formula for distance in kilometers
    @Query(value = "SELECT s.* FROM stores s WHERE s.is_active = true AND " +
            "(6371 * acos(cos(radians(:lat)) * cos(radians(s.lat)) * " +
            "cos(radians(s.lng) - radians(:lng)) + sin(radians(:lat)) * sin(radians(s.lat)))) < :radius",
            nativeQuery = true)
    List<Store> findNearbyStores(@Param("lat") double lat, @Param("lng") double lng, @Param("radius") double radius);
}
