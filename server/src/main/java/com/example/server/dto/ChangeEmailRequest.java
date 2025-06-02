package com.example.server.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChangeEmailRequest {
    
    @NotBlank(message = "New email is required")
    @Email(message = "Please provide a valid email address")
    private String newEmail;
    
    @NotBlank(message = "Current password is required for email change")
    private String currentPassword;
}
