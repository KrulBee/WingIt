package com.example.server.service;

import com.example.server.dto.CreateReportRequest;
import com.example.server.dto.ReportDTO;
import com.example.server.dto.UserDTO;
import com.example.server.model.Entity.*;
import com.example.server.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ReportService {
    
    @Autowired
    private ReportRepository reportRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private UserService userService;
      public ReportDTO createReport(CreateReportRequest request, Integer reporterId) {
        // Get the reporter
        UserDTO reporterDTO = userService.getUserById(reporterId);
        if (reporterDTO == null) {
            throw new RuntimeException("Reporter not found");
        }
        // Convert DTO to entity - we need to get from repository
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new RuntimeException("Reporter not found"));
        
        Report report = new Report();
        report.setReporter(reporter);
        report.setReason(request.getReason());
        report.setDescription(request.getDescription());
        
        // Set the reported entity based on the request
        if (request.getReportedUserId() != null) {
            // Check if user has already reported this user
            if (reportRepository.existsByReporterIdAndReportedUserId(reporterId, request.getReportedUserId())) {
                throw new RuntimeException("You have already reported this user");
            }
              UserDTO reportedUserDTO = userService.getUserById(request.getReportedUserId());
            if (reportedUserDTO == null) {
                throw new RuntimeException("Reported user not found");
            }
            // Convert DTO to entity - we need to get from repository
            User reportedUser = userRepository.findById(request.getReportedUserId())
                    .orElseThrow(() -> new RuntimeException("Reported user not found"));
            report.setReportedUser(reportedUser);        } else if (request.getPostId() != null) {
            // Check if user has already reported this post
            if (reportRepository.existsByReporterIdAndPostId(reporterId, request.getPostId())) {
                throw new RuntimeException("You have already reported this post");
            }
            
            // Get post entity from repository
            Post post = postRepository.findById(request.getPostId())
                    .orElseThrow(() -> new RuntimeException("Post not found"));
            report.setPost(post);
        } else if (request.getCommentId() != null) {
            // Check if user has already reported this comment
            if (reportRepository.existsByReporterIdAndCommentId(reporterId, request.getCommentId())) {
                throw new RuntimeException("You have already reported this comment");
            }
            
            // Get comment entity from repository
            Comment comment = commentRepository.findById(request.getCommentId())
                    .orElseThrow(() -> new RuntimeException("Comment not found"));
            report.setComment(comment);
        } else {
            throw new RuntimeException("Must specify either a user, post, or comment to report");
        }
        
        Report savedReport = reportRepository.save(report);
        return ReportDTO.fromEntity(savedReport);
    }
    
    public List<ReportDTO> getAllReports() {
        return reportRepository.findAll()
                .stream()
                .map(ReportDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    public ReportDTO getReportById(Long id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        return ReportDTO.fromEntity(report);
    }
    
    public List<ReportDTO> getReportsByStatus(String status) {
        try {
            Report.ReportStatus reportStatus = Report.ReportStatus.valueOf(status.toUpperCase());
            return reportRepository.findByStatus(reportStatus)
                    .stream()
                    .map(ReportDTO::fromEntity)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + status);
        }
    }
    
    public ReportDTO updateReportStatus(Long id, String status) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        
        try {
            Report.ReportStatus reportStatus = Report.ReportStatus.valueOf(status.toUpperCase());
            report.setStatus(reportStatus);
            Report updatedReport = reportRepository.save(report);
            return ReportDTO.fromEntity(updatedReport);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + status);
        }
    }
    
    public void deleteReport(Long id) {
        if (!reportRepository.existsById(id)) {
            throw new RuntimeException("Report not found");
        }
        reportRepository.deleteById(id);
    }
    
    public List<ReportDTO> getReportsByReporter(Integer reporterId) {
        return reportRepository.findByReporterId(reporterId)
                .stream()
                .map(ReportDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<ReportDTO> getReportsForUser(Integer userId) {
        return reportRepository.findByReportedUserId(userId)
                .stream()
                .map(ReportDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<ReportDTO> getReportsForPost(Long postId) {
        return reportRepository.findByPostId(postId)
                .stream()
                .map(ReportDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<ReportDTO> getReportsForComment(Long commentId) {
        return reportRepository.findByCommentId(commentId)
                .stream()
                .map(ReportDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
