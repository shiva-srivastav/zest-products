package com.zestindia.products.service;

import com.zestindia.products.dto.request.ItemRequest;
import com.zestindia.products.dto.request.ProductRequest;
import com.zestindia.products.dto.response.ItemResponse;
import com.zestindia.products.dto.response.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {

    Page<ProductResponse> getAllProducts(String search, Pageable pageable);

    ProductResponse getProductById(Long id);

    ProductResponse createProduct(ProductRequest request);

    ProductResponse updateProduct(Long id, ProductRequest request);

    void deleteProduct(Long id);

    Page<ItemResponse> getItemsByProductId(Long productId, Pageable pageable);

    ItemResponse addItemToProduct(Long productId, ItemRequest request);

    ItemResponse updateItem(Long productId, Long itemId, ItemRequest request);

    void deleteItem(Long productId, Long itemId);
}
