package com.example.server.dto;

import com.example.server.model.Entity.Report;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportDTO {
    private Long id;
    private Integer reporterId;
    private Integer reportedUserId;
    private Long postId;
    private Long commentId;
    private String reason;
    private String description;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Helper method to convert from Entity to DTO
    public static ReportDTO fromEntity(Report report) {
        ReportDTO dto = new ReportDTO();
        dto.setId(report.getId());
        dto.setReporterId(report.getReporter().getId());
        dto.setReportedUserId(report.getReportedUser() != null ? report.getReportedUser().getId() : null);
        dto.setPostId(report.getPost() != null ? report.getPost().getId() : null);
        dto.setCommentId(report.getComment() != null ? report.getComment().getId() : null);
        dto.setReason(report.getReason());
        dto.setDescription(report.getDescription());
        dto.setStatus(report.getStatus().toString());
        dto.setCreatedAt(report.getCreatedAt());
        dto.setUpdatedAt(report.getUpdatedAt());
        return dto;
    }
}
