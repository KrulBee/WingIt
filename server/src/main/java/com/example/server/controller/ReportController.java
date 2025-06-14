package com.example.server.controller;

import com.example.server.dto.CreateReportRequest;
import com.example.server.dto.ReportDTO;
import com.example.server.dto.UpdateReportStatusRequest;
import com.example.server.service.ReportService;
import com.example.server.model.Entity.User;
import com.example.server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = {"http://localhost:3000", "https://wingit-frontend.onrender.com"}, allowCredentials = "true")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createReport(@RequestBody CreateReportRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            Integer reporterId = getUserIdFromAuth(authentication);
            
            System.out.println("Creating report with request: " + request);
            System.out.println("Reporter ID: " + reporterId);
            
            ReportDTO report = reportService.createReport(request, reporterId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            System.err.println("Error creating report: " + e.getMessage());
            e.printStackTrace();
                        return ResponseEntity.badRequest().body(Map.of("error", "Failed to create report: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllReports() {
        try {
            List<ReportDTO> reports = reportService.getAllReports();
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            System.err.println("Error getting all reports: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to get reports: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getReportById(@PathVariable Long id) {
        try {
            ReportDTO report = reportService.getReportById(id);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            System.err.println("Error getting report by ID: " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getReportsByStatus(@PathVariable String status) {
        try {
            List<ReportDTO> reports = reportService.getReportsByStatus(status);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            System.err.println("Error getting reports by status: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to get reports by status: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateReportStatus(
            @PathVariable Long id, 
            @RequestBody UpdateReportStatusRequest request) {
        try {
            ReportDTO report = reportService.updateReportStatus(id, request.getStatus());
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            System.err.println("Error updating report status: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update report status: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReport(@PathVariable Long id) {
        try {
            reportService.deleteReport(id);
            return ResponseEntity.ok(Map.of("message", "Report deleted successfully"));
        } catch (Exception e) {
            System.err.println("Error deleting report: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to delete report: " + e.getMessage()));
        }
    }

    @GetMapping("/my-reports")
    public ResponseEntity<?> getMyReports() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            Integer reporterId = getUserIdFromAuth(authentication);
            
            List<ReportDTO> reports = reportService.getReportsByReporter(reporterId);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            System.err.println("Error getting my reports: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to get your reports: " + e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getReportsForUser(@PathVariable Integer userId) {
        try {
            List<ReportDTO> reports = reportService.getReportsForUser(userId);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            System.err.println("Error getting reports for user: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to get reports for user: " + e.getMessage()));
        }
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<?> getReportsForPost(@PathVariable Long postId) {
        try {
            List<ReportDTO> reports = reportService.getReportsForPost(postId);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            System.err.println("Error getting reports for post: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to get reports for post: " + e.getMessage()));
        }
    }

    @GetMapping("/comment/{commentId}")
    public ResponseEntity<?> getReportsForComment(@PathVariable Long commentId) {
        try {
            List<ReportDTO> reports = reportService.getReportsForComment(commentId);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            System.err.println("Error getting reports for comment: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to get reports for comment: " + e.getMessage()));
        }
    }

    /**
     * Helper method to extract user ID from authentication
     * @param auth the authentication object
     * @return user ID
     */
    private Integer getUserIdFromAuth(Authentication auth) {
        String username = auth.getName();
        System.out.println("DEBUG: Extracting user ID for username: " + username);
        
        User user = userRepository.findByUsername(username);
        if (user != null) {
            System.out.println("DEBUG: Found user with ID: " + user.getId() + " for username: " + username);
            return user.getId();
        }
        
        System.err.println("ERROR: User not found for username: " + username);
        System.out.println("DEBUG: All users in database:");
        userRepository.findAll().forEach(u -> 
            System.out.println("  - ID: " + u.getId() + ", Username: " + u.getUsername())
        );
        
        throw new RuntimeException("User not found in authentication context");
    }
}
