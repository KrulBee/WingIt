package com.example.server.dto;

import com.example.server.model.Entity.Report;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminReportDTO {
    private Long id;
    private String reportType;
    private String reason;
    private String description;
    private String status;
    private ReportedBy reportedBy;
    private TargetUser targetUser;
    private TargetPost targetPost;
    private TargetComment targetComment;
    private LocalDateTime createdDate;
    private LocalDateTime resolvedDate;
    private ResolvedBy resolvedBy;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportedBy {
        private Integer id;
        private String username;
        private String displayName;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TargetUser {
        private Integer id;
        private String username;
        private String displayName;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TargetPost {
        private Long id;
        private String content;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TargetComment {
        private Long id;
        private String content;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResolvedBy {
        private Integer id;
        private String username;
        private String displayName;
    }

    // Helper method to convert from Entity to AdminReportDTO
    public static AdminReportDTO fromEntity(Report report) {
        AdminReportDTO dto = new AdminReportDTO();
        dto.setId(report.getId());
        dto.setReason(report.getReason());
        dto.setDescription(report.getDescription());        dto.setStatus(report.getStatus().toString());
        dto.setCreatedDate(report.getCreatedAt());
        dto.setResolvedDate(report.getUpdatedAt());

        // Set reporter information
        if (report.getReporter() != null) {
            ReportedBy reportedBy = new ReportedBy();
            reportedBy.setId(report.getReporter().getId());
            reportedBy.setUsername(report.getReporter().getUsername());
            if (report.getReporter().getUserData() != null) {
                reportedBy.setDisplayName(report.getReporter().getUserData().getDisplayName());
            }
            dto.setReportedBy(reportedBy);
        }

        // Set reported user information
        if (report.getReportedUser() != null) {
            TargetUser targetUser = new TargetUser();
            targetUser.setId(report.getReportedUser().getId());
            targetUser.setUsername(report.getReportedUser().getUsername());
            if (report.getReportedUser().getUserData() != null) {
                targetUser.setDisplayName(report.getReportedUser().getUserData().getDisplayName());
            }
            dto.setTargetUser(targetUser);
            dto.setReportType("USER");
        }

        // Set reported post information
        if (report.getPost() != null) {
            TargetPost targetPost = new TargetPost();
            targetPost.setId(report.getPost().getId());
            targetPost.setContent(report.getPost().getContent());
            dto.setTargetPost(targetPost);
            dto.setReportType("POST");
        }

        // Set reported comment information
        if (report.getComment() != null) {
            TargetComment targetComment = new TargetComment();
            targetComment.setId(report.getComment().getId());
            targetComment.setContent(report.getComment().getText());
            dto.setTargetComment(targetComment);
            dto.setReportType("COMMENT");
        }

        // TODO: Set resolved by information when that functionality is added
        // For now, set a default reportType if none was set
        if (dto.getReportType() == null) {
            dto.setReportType("UNKNOWN");
        }

        return dto;
    }
}
