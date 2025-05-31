package com.example.server.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.Map;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostViewStatsDTO {
    private Long postId;
    private Long totalViews;
    private Long uniqueViews;
    private Double averageDuration; // Average duration in milliseconds
    private Map<String, Long> viewsBySource;
    private List<PostViewDTO> recentViews;
}
