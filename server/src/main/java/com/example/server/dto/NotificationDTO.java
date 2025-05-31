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
    private Integer recipientUserId;
    private Integer actorUserId;
    private String actorUserName;
    private String actorDisplayName;
    private String actorProfilePicture;
    private String type;
    private Long postId;
    private Long commentId;
    private String content;
    private Boolean readStatus;
    private LocalDateTime createdAt;
}
