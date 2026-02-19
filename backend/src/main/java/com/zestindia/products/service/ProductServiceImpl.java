package com.zestindia.products.service;

import com.zestindia.products.dto.request.ItemRequest;
import com.zestindia.products.dto.request.ProductRequest;
import com.zestindia.products.dto.response.ItemResponse;
import com.zestindia.products.dto.response.ProductResponse;
import com.zestindia.products.entity.Item;
import com.zestindia.products.entity.Product;
import com.zestindia.products.exception.ResourceNotFoundException;
import com.zestindia.products.repository.ItemRepository;
import com.zestindia.products.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ItemRepository itemRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllProducts(String search, Pageable pageable) {
        Page<Product> products;
        if (StringUtils.hasText(search)) {
            products = productRepository.searchProducts(search, pageable);
        } else {
            products = productRepository.findAll(pageable);
        }
        return products.map(this::mapToProductResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = findProductById(id);
        return mapToProductResponse(product);
    }

    @Override
    public ProductResponse createProduct(ProductRequest request) {
        Product product = Product.builder()
                .productName(request.getProductName())
                .build();
        Product saved = productRepository.save(product);
        log.debug("Created product with id: {}", saved.getId());
        return mapToProductResponse(saved);
    }

    @Override
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = findProductById(id);
        product.setProductName(request.getProductName());
        Product updated = productRepository.save(product);
        log.debug("Updated product with id: {}", updated.getId());
        return mapToProductResponse(updated);
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = findProductById(id);
        productRepository.delete(product);
        log.debug("Deleted product with id: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ItemResponse> getItemsByProductId(Long productId, Pageable pageable) {
        findProductById(productId);
        return itemRepository.findByProductId(productId, pageable)
                .map(this::mapToItemResponse);
    }

    @Override
    public ItemResponse addItemToProduct(Long productId, ItemRequest request) {
        Product product = findProductById(productId);
        Item item = Item.builder()
                .product(product)
                .quantity(request.getQuantity())
                .build();
        Item saved = itemRepository.save(item);
        return mapToItemResponse(saved);
    }

    @Override
    public ItemResponse updateItem(Long productId, Long itemId, ItemRequest request) {
        findProductById(productId);
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item", "id", itemId));
        item.setQuantity(request.getQuantity());
        return mapToItemResponse(itemRepository.save(item));
    }

    @Override
    public void deleteItem(Long productId, Long itemId) {
        findProductById(productId);
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item", "id", itemId));
        itemRepository.delete(item);
    }

    private Product findProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
    }

    private ProductResponse mapToProductResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .productName(product.getProductName())
                .createdBy(product.getCreatedBy())
                .createdOn(product.getCreatedOn())
                .modifiedBy(product.getModifiedBy())
                .modifiedOn(product.getModifiedOn())
                .itemCount(product.getItems() != null ? product.getItems().size() : 0)
                .build();
    }

    private ItemResponse mapToItemResponse(Item item) {
        return ItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getProductName())
                .quantity(item.getQuantity())
                .build();
    }
}
