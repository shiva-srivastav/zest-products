package com.zestindia.products.controller;

import com.zestindia.products.dto.request.ItemRequest;
import com.zestindia.products.dto.request.ProductRequest;
import com.zestindia.products.dto.response.ApiResponse;
import com.zestindia.products.dto.response.ItemResponse;
import com.zestindia.products.dto.response.ProductResponse;
import com.zestindia.products.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Product CRUD operations and item management")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Get all products with pagination and optional search")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getAllProducts(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ProductResponse> products = productService.getAllProducts(search, pageable);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(
            @PathVariable @Parameter(description = "Product ID") Long id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductById(id)));
    }

    @PostMapping
    @Operation(summary = "Create a new product")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @Valid @RequestBody ProductRequest request) {
        ProductResponse product = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(product, "Product created successfully"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing product")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                productService.updateProduct(id, request), "Product updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a product by ID")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Product deleted successfully"));
    }

    @GetMapping("/{id}/items")
    @Operation(summary = "Get all items for a product")
    public ResponseEntity<ApiResponse<Page<ItemResponse>>> getItemsByProduct(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success(productService.getItemsByProductId(id, pageable)));
    }

    @PostMapping("/{id}/items")
    @Operation(summary = "Add an item to a product")
    public ResponseEntity<ApiResponse<ItemResponse>> addItem(
            @PathVariable Long id,
            @Valid @RequestBody ItemRequest request) {
        ItemResponse item = productService.addItemToProduct(id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(item, "Item added successfully"));
    }

    @PutMapping("/{id}/items/{itemId}")
    @Operation(summary = "Update an item of a product")
    public ResponseEntity<ApiResponse<ItemResponse>> updateItem(
            @PathVariable Long id,
            @PathVariable Long itemId,
            @Valid @RequestBody ItemRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                productService.updateItem(id, itemId, request), "Item updated successfully"));
    }

    @DeleteMapping("/{id}/items/{itemId}")
    @Operation(summary = "Delete an item from a product")
    public ResponseEntity<ApiResponse<Void>> deleteItem(
            @PathVariable Long id,
            @PathVariable Long itemId) {
        productService.deleteItem(id, itemId);
        return ResponseEntity.ok(ApiResponse.success(null, "Item deleted successfully"));
    }
}
