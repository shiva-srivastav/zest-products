package com.zestindia.products.repository;

import com.zestindia.products.entity.Item;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    Page<Item> findByProductId(Long productId, Pageable pageable);

    List<Item> findByProductId(Long productId);

    void deleteByProductId(Long productId);
}
