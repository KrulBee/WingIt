package com.example.server.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ForgotPasswordRequest {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;
}
