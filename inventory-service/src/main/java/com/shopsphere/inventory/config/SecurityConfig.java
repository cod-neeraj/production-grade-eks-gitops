package com.shopsphere.inventory.config;

import com.shopsphere.inventory.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                    // Public & internal service endpoints
                    .requestMatchers(HttpMethod.GET, "/api/inventory/check/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/inventory/product/**").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/inventory/reserve").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/inventory/release").permitAll()
                    .requestMatchers("/actuator/**").permitAll()
                    // Admin-only endpoints
                    .requestMatchers(HttpMethod.POST, "/api/inventory/adjust").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.PUT, "/api/inventory/adjust").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.POST, "/api/inventory").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.DELETE, "/api/inventory/**").hasRole("ADMIN")
                    // All other inventory endpoints require authentication
                    .requestMatchers("/api/inventory/**").authenticated()
                    .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
