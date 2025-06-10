package com.example.server.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserDTO {
    private Integer id; // Added id field
    private String username;
    private String email; // Add email field for admin panel
    private String password;
    private String displayName;
    private String bio;
    private String profilePicture;
    private String coverPhoto;
    private String dateOfBirth;    private String provider; // OAuth2 provider (null for regular users)
    private LocalDateTime createdDate; // Add created date for admin panel
    private RoleDTO role; // Add role information for admin panel

    // Role DTO for nested role information
    @Data
    public static class RoleDTO {
        private Integer id;
        private String roleName;
    }

    // Add fields that represent a User for data transfer
    // Example:
    // private String userId;
    // private String username;
    // private String email;
    // private String fullName;
    // private LocalDate dateOfBirth;

    // Constructors, getters, and setters
}