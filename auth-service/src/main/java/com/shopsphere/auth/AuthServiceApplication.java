package com.shopsphere.auth;

import com.shopsphere.auth.entity.User;
import com.shopsphere.auth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class AuthServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }

    @Bean
    public CommandLineRunner seedUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            userRepository.findByEmail("admin@shopsphere.local").ifPresentOrElse(
                admin -> {
                    admin.setPasswordHash(passwordEncoder.encode("Admin@123"));
                    admin.setRole(User.Role.ADMIN);
                    userRepository.save(admin);
                },
                () -> userRepository.save(User.builder()
                        .username("admin")
                        .email("admin@shopsphere.local")
                        .passwordHash(passwordEncoder.encode("Admin@123"))
                        .firstName("Admin")
                        .lastName("User")
                        .role(User.Role.ADMIN)
                        .build())
            );

            userRepository.findByEmail("john@example.com").ifPresentOrElse(
                user -> {
                    user.setPasswordHash(passwordEncoder.encode("Customer@123"));
                    userRepository.save(user);
                },
                () -> userRepository.save(User.builder()
                        .username("john_doe")
                        .email("john@example.com")
                        .passwordHash(passwordEncoder.encode("Customer@123"))
                        .firstName("John")
                        .lastName("Doe")
                        .role(User.Role.CUSTOMER)
                        .build())
            );
        };
    }
}
