package com.example.server.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.Map;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ViewAnalyticsSummaryDTO {
    private Long totalPosts;
    private Long totalViews;
    private Long viewsToday;
    private Long viewsThisWeek;
    private Double averageViewsPerPost;
    private Map<String, Long> viewsBySource;
    private List<PostViewDTO> recentViews;
}
