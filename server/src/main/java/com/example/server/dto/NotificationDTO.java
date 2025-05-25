package com.example.server.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private Integer userId;
    private String userName;
    private String userDisplayName;
    private String userProfilePicture;
    private Long postId;
    private String type;
    private String content;
    private Boolean readStatus;
    private LocalDateTime createdAt;
}
