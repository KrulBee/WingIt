package com.example.server.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserProfileRequest {
    private String displayName;
    private String bio;
    private String profilePicture;
    private String coverPhoto;
    private String dateOfBirth; // ISO format: YYYY-MM-DD
}
