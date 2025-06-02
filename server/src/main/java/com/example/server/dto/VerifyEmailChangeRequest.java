package com.example.server.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyEmailChangeRequest {
    
    @NotBlank(message = "Verification token is required")
    private String token;
}
