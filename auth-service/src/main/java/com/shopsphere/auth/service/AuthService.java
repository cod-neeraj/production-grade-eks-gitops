package com.shopsphere.auth.service;

import com.shopsphere.auth.dto.AuthDto;
import com.shopsphere.auth.entity.User;
import com.shopsphere.auth.exception.AuthException;
import com.shopsphere.auth.repository.UserRepository;
import com.shopsphere.auth.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Value("${jwt.expiration-ms}")
    private long jwtExpirationMs;

    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw AuthException.conflict("Email is already registered");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw AuthException.conflict("Username is already taken");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(User.Role.CUSTOMER)
                .build();

        user = userRepository.save(user);
        log.info("New user registered: {} ({})", user.getUsername(), user.getEmail());

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        return buildAuthResponse(token, user);
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException ex) {
            throw AuthException.unauthorized("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> AuthException.notFound("User not found"));

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        log.info("User logged in: {}", user.getEmail());
        return buildAuthResponse(token, user);
    }

    public AuthDto.UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> AuthException.notFound("User not found"));
        return AuthDto.UserResponse.from(user);
    }

    public AuthDto.UserResponse validateToken(String token) {
        if (!jwtTokenProvider.validateToken(token)) {
            throw AuthException.unauthorized("Token is invalid or expired");
        }
        String email = jwtTokenProvider.getEmailFromToken(token);
        return getCurrentUser(email);
    }

    private AuthDto.AuthResponse buildAuthResponse(String token, User user) {
        return AuthDto.AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtExpirationMs / 1000)
                .user(AuthDto.UserResponse.from(user))
                .build();
    }
}
