package com.zestindia.products.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zestindia.products.dto.request.ProductRequest;
import com.zestindia.products.dto.response.ProductResponse;
import com.zestindia.products.service.ProductService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
@ActiveProfiles("test")
@DisplayName("ProductController Integration Tests")
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProductService productService;

    private ProductResponse buildProductResponse() {
        return ProductResponse.builder()
                .id(1L)
                .productName("Test Product")
                .createdBy("testuser")
                .createdOn(LocalDateTime.now())
                .itemCount(0)
                .build();
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("GET /api/v1/products - should return 200 with product page")
    void getAllProducts_ReturnsOk() throws Exception {
        ProductResponse product = buildProductResponse();
        Page<ProductResponse> page = new PageImpl<>(List.of(product));
        given(productService.getAllProducts(any(), any())).willReturn(page);

        mockMvc.perform(get("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].productName").value("Test Product"));
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("GET /api/v1/products/{id} - should return 200 with product")
    void getProductById_ReturnsOk() throws Exception {
        given(productService.getProductById(1L)).willReturn(buildProductResponse());

        mockMvc.perform(get("/api/v1/products/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(1L));
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("POST /api/v1/products - should create and return 201")
    void createProduct_ReturnsCreated() throws Exception {
        ProductRequest request = new ProductRequest();
        request.setProductName("New Product");

        given(productService.createProduct(any())).willReturn(buildProductResponse());

        mockMvc.perform(post("/api/v1/products")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("POST /api/v1/products - should return 400 for blank product name")
    void createProduct_BlankName_ReturnsBadRequest() throws Exception {
        ProductRequest request = new ProductRequest();
        request.setProductName("");

        mockMvc.perform(post("/api/v1/products")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("DELETE /api/v1/products/{id} - admin should return 200")
    void deleteProduct_AsAdmin_ReturnsOk() throws Exception {
        mockMvc.perform(delete("/api/v1/products/1")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("DELETE /api/v1/products/{id} - user should return 403")
    void deleteProduct_AsUser_ReturnsForbidden() throws Exception {
        mockMvc.perform(delete("/api/v1/products/1")
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }
}
