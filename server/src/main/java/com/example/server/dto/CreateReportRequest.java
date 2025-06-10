package com.example.server.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateReportRequest {
    private Integer reportedUserId;
    private Long postId;
    private Long commentId;
    private String reason;
    private String description;
}
