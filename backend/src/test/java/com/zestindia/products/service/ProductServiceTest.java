package com.zestindia.products.service;

import com.zestindia.products.dto.request.ProductRequest;
import com.zestindia.products.dto.response.ProductResponse;
import com.zestindia.products.entity.Product;
import com.zestindia.products.exception.ResourceNotFoundException;
import com.zestindia.products.repository.ItemRepository;
import com.zestindia.products.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProductService Unit Tests")
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ItemRepository itemRepository;

    @InjectMocks
    private ProductServiceImpl productService;

    private Product product;

    @BeforeEach
    void setUp() {
        product = Product.builder()
                .id(1L)
                .productName("Test Product")
                .createdBy("testuser")
                .createdOn(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Should return paginated products when no search term")
    void getAllProducts_NoSearch_ReturnPage() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> productPage = new PageImpl<>(List.of(product));
        given(productRepository.findAll(pageable)).willReturn(productPage);

        Page<ProductResponse> result = productService.getAllProducts(null, pageable);

        assertThat(result).isNotEmpty();
        assertThat(result.getContent().get(0).getProductName()).isEqualTo("Test Product");
        verify(productRepository).findAll(pageable);
    }

    @Test
    @DisplayName("Should return searched products when search term provided")
    void getAllProducts_WithSearch_ReturnFilteredPage() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> productPage = new PageImpl<>(List.of(product));
        given(productRepository.searchProducts("Test", pageable)).willReturn(productPage);

        Page<ProductResponse> result = productService.getAllProducts("Test", pageable);

        assertThat(result).isNotEmpty();
        verify(productRepository).searchProducts("Test", pageable);
    }

    @Test
    @DisplayName("Should return product by ID when exists")
    void getProductById_Exists_ReturnProduct() {
        given(productRepository.findById(1L)).willReturn(Optional.of(product));

        ProductResponse result = productService.getProductById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getProductName()).isEqualTo("Test Product");
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when product not found")
    void getProductById_NotFound_ThrowException() {
        given(productRepository.findById(99L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getProductById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Product");
    }

    @Test
    @DisplayName("Should create and return new product")
    void createProduct_ValidRequest_ReturnProduct() {
        ProductRequest request = new ProductRequest();
        request.setProductName("New Product");

        given(productRepository.save(any(Product.class))).willReturn(product);

        ProductResponse result = productService.createProduct(request);

        assertThat(result).isNotNull();
        verify(productRepository).save(any(Product.class));
    }

    @Test
    @DisplayName("Should update product name when product exists")
    void updateProduct_Exists_ReturnUpdated() {
        ProductRequest request = new ProductRequest();
        request.setProductName("Updated Name");

        given(productRepository.findById(1L)).willReturn(Optional.of(product));
        given(productRepository.save(any(Product.class))).willReturn(product);

        ProductResponse result = productService.updateProduct(1L, request);

        assertThat(result).isNotNull();
        verify(productRepository).save(any(Product.class));
    }

    @Test
    @DisplayName("Should delete product when exists")
    void deleteProduct_Exists_DeleteSuccessfully() {
        given(productRepository.findById(1L)).willReturn(Optional.of(product));

        productService.deleteProduct(1L);

        verify(productRepository).delete(product);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException on delete when not found")
    void deleteProduct_NotFound_ThrowException() {
        given(productRepository.findById(99L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> productService.deleteProduct(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
