package com.example.server.dto;

import lombok.Data;

@Data
public class UserDTO {
    private Integer id; // Added id field
    private String username;
    private String password;
    private String displayName;
    private String bio;
    private String profilePicture;
    private String dateOfBirth;

    // Add fields that represent a User for data transfer
    // Example:
    // private String userId;
    // private String username;
    // private String email;
    // private String fullName;
    // private LocalDate dateOfBirth;

    // Constructors, getters, and setters
}