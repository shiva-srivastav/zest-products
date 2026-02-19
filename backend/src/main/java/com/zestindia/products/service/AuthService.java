package com.zestindia.products.service;

import com.zestindia.products.dto.request.LoginRequest;
import com.zestindia.products.dto.request.RefreshTokenRequest;
import com.zestindia.products.dto.request.RegisterRequest;
import com.zestindia.products.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refreshToken(RefreshTokenRequest request);

    void logout(String username);
}
