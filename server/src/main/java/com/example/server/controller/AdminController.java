package com.example.server.controller;

import com.example.server.service.ReportService;
import com.example.server.service.UserService;
import com.example.server.service.PostService;
import com.example.server.dto.*;
import com.example.server.repository.UserRepository;
import com.example.server.repository.PostRepository;
import com.example.server.repository.CommentRepository;
import com.example.server.repository.ReportRepository;
import com.example.server.model.Entity.User;
import com.example.server.model.Entity.Report;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.LinkedHashMap;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:3000", "https://wingit-frontend.onrender.com"}, allowCredentials = "true")
@PreAuthorize("hasRole('admin')")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private PostService postService;

    @Autowired
    private ReportService reportService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private ReportRepository reportRepository;

    /**
     * Check if current user has admin privileges
     */
    private boolean isAdmin(Authentication auth) {
        Integer userId = getUserIdFromAuth(auth);
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || user.getRole() == null) {
            return false;
        }
        // Check if user has admin role (role ID 3) or moderator role (role ID 2)
        Integer roleId = user.getRole().getId();
        return roleId == 2 || roleId == 3; // moderator or admin
    }

    /**
     * Check if current user has full admin privileges (not just moderator)
     */
    private boolean isFullAdmin(Authentication auth) {
        Integer userId = getUserIdFromAuth(auth);
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || user.getRole() == null) {
            return false;
        }
        // Check if user has admin role (role ID 3)
        return user.getRole().getId() == 3;
    }    /**
     * Get admin dashboard statistics
     */
    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            System.out.println("DEBUG: Getting dashboard stats, auth: " + auth.getName());
            
            if (!isAdmin(auth)) {
                System.out.println("DEBUG: User is not admin");
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin privileges required."));
            }
            
            System.out.println("DEBUG: User has admin access, fetching stats...");
            Map<String, Object> stats = new HashMap<>();
            
            try {
                // User statistics
                System.out.println("DEBUG: Fetching user statistics...");
                long totalUsers = userRepository.count();
                long newUsersThisMonth = userRepository.countByCreatedDateAfter(
                    java.time.LocalDateTime.now().minusMonths(1)
                );
                stats.put("totalUsers", totalUsers);
                stats.put("newUsersThisMonth", newUsersThisMonth);
                System.out.println("DEBUG: User stats - total: " + totalUsers + ", new this month: " + newUsersThisMonth);
            } catch (Exception e) {
                System.err.println("ERROR: Failed to fetch user statistics: " + e.getMessage());
                e.printStackTrace();
                stats.put("totalUsers", 0L);
                stats.put("newUsersThisMonth", 0L);
            }

            try {
                // Post statistics
                System.out.println("DEBUG: Fetching post statistics...");
                long totalPosts = postRepository.count();
                long newPostsThisMonth = postRepository.countByCreatedDateAfter(
                    java.time.LocalDateTime.now().minusMonths(1)
                );
                stats.put("totalPosts", totalPosts);
                stats.put("newPostsThisMonth", newPostsThisMonth);
                System.out.println("DEBUG: Post stats - total: " + totalPosts + ", new this month: " + newPostsThisMonth);
            } catch (Exception e) {
                System.err.println("ERROR: Failed to fetch post statistics: " + e.getMessage());
                e.printStackTrace();
                stats.put("totalPosts", 0L);
                stats.put("newPostsThisMonth", 0L);
            }

            try {
                // Comment statistics
                System.out.println("DEBUG: Fetching comment statistics...");
                long totalComments = commentRepository.count();
                stats.put("totalComments", totalComments);
                System.out.println("DEBUG: Comment stats - total: " + totalComments);
            } catch (Exception e) {
                System.err.println("ERROR: Failed to fetch comment statistics: " + e.getMessage());
                e.printStackTrace();
                stats.put("totalComments", 0L);
            }            try {
                // Report statistics
                System.out.println("DEBUG: Fetching report statistics...");
                long totalReports = reportRepository.count();
                long pendingReports = reportRepository.countByStatus(Report.ReportStatus.PENDING);
                long resolvedReports = reportRepository.countByStatus(Report.ReportStatus.RESOLVED);
                stats.put("totalReports", totalReports);
                stats.put("pendingReports", pendingReports);
                stats.put("resolvedReports", resolvedReports);
                System.out.println("DEBUG: Report stats - total: " + totalReports + ", pending: " + pendingReports + ", resolved: " + resolvedReports);
            } catch (Exception e) {
                System.err.println("ERROR: Failed to fetch report statistics: " + e.getMessage());
                e.printStackTrace();
                stats.put("totalReports", 0L);
                stats.put("pendingReports", 0L);
                stats.put("resolvedReports", 0L);
            }

            System.out.println("DEBUG: Successfully fetched dashboard stats: " + stats);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.err.println("ERROR: Failed to get dashboard stats: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to get dashboard stats: " + e.getMessage()));
        }
    }

    /**
     * Get all users with pagination
     */
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (!isAdmin(auth)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin privileges required."));
            }

            List<UserDTO> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to get users: " + e.getMessage()));
        }
    }    /**
     * Get all reports with pagination and filtering
     */
    @GetMapping("/reports")
    public ResponseEntity<?> getAllReports(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (!isAdmin(auth)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin privileges required."));
            }

            List<Report> reportEntities;
            if (status != null && !status.isEmpty()) {
                try {
                    Report.ReportStatus reportStatus = Report.ReportStatus.valueOf(status.toUpperCase());
                    reportEntities = reportRepository.findByStatus(reportStatus);
                } catch (IllegalArgumentException e) {
                    throw new RuntimeException("Invalid status: " + status);
                }
            } else {
                reportEntities = reportRepository.findAll();
            }
            
            // Convert to AdminReportDTO with full user information
            List<AdminReportDTO> adminReports = reportEntities.stream()
                    .map(AdminReportDTO::fromEntity)
                    .collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(adminReports);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to get reports: " + e.getMessage()));
        }
    }

    /**
     * Update report status (resolve, dismiss, etc.)
     */
    @PutMapping("/reports/{reportId}/status")
    public ResponseEntity<?> updateReportStatus(
            @PathVariable Long reportId,
            @RequestBody UpdateReportStatusRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (!isAdmin(auth)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin privileges required."));
            }

            ReportDTO updatedReport = reportService.updateReportStatus(reportId, request.getStatus());
            return ResponseEntity.ok(updatedReport);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to update report status: " + e.getMessage()));
        }
    }

    /**
     * Delete a user (full admin only)
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer userId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (!isFullAdmin(auth)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Full admin privileges required."));
            }

            userService.deleteUser(userId);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to delete user: " + e.getMessage()));
        }
    }

    /**
     * Get all posts for admin management
     */
    @GetMapping("/posts")
    public ResponseEntity<?> getAllPosts() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (!isAdmin(auth)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin privileges required."));
            }

            List<PostDTO> posts = postService.getAllPosts();
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to retrieve posts: " + e.getMessage()));
        }
    }

    /**
     * Delete a post
     */
    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable Long postId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (!isAdmin(auth)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin privileges required."));
            }

            postService.deletePost(postId);
            return ResponseEntity.ok(Map.of("message", "Post deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to delete post: " + e.getMessage()));
        }
    }

    /**
     * Update user role (full admin only)
     */
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Integer userId,
            @RequestBody Map<String, Integer> request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (!isFullAdmin(auth)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Full admin privileges required."));
            }

            Integer newRoleId = request.get("roleId");
            if (newRoleId == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Role ID is required"));
            }

            // Prevent self-demotion
            Integer currentUserId = getUserIdFromAuth(auth);
            if (currentUserId.equals(userId)) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Cannot change your own role"));
            }

            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            // Update role
            user.getRole().setId(newRoleId);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "User role updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to update user role: " + e.getMessage()));
        }
    }    /**
     * Get system analytics
     */
    @GetMapping("/analytics")
    public ResponseEntity<?> getSystemAnalytics() {
        try {
            System.out.println("DEBUG: Starting analytics request");
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (!isAdmin(auth)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin privileges required."));
            }            Map<String, Object> analytics = new HashMap<>();
              System.out.println("DEBUG: Building user growth analytics...");
            // User growth over time (last 7 days) - Using LinkedHashMap to preserve reverse chronological order (latest first)
            Map<String, Long> userGrowth = new LinkedHashMap<>();
            try {
                for (int i = 0; i <= 6; i++) {
                    java.time.LocalDate date = java.time.LocalDate.now().minusDays(i);
                    System.out.println("DEBUG: Checking user growth for date: " + date);
                    
                    // Use LocalDate directly since UserData.createdAt is LocalDate
                    long count = userRepository.countByCreatedDateOnDate(date);
                    userGrowth.put(date.toString(), count);
                    System.out.println("DEBUG: Found " + count + " users created on " + date);
                }
                analytics.put("userGrowth", userGrowth);} catch (Exception e) {
                System.err.println("ERROR: Failed to get user growth data: " + e.getMessage());
                e.printStackTrace();
                analytics.put("userGrowth", new LinkedHashMap<>());
            }            System.out.println("DEBUG: Building post growth analytics...");
            // Post creation over time (last 7 days) - Using LinkedHashMap to preserve reverse chronological order (latest first)
            Map<String, Long> postGrowth = new LinkedHashMap<>();
            try {
                for (int i = 0; i <= 6; i++) {
                    java.time.LocalDate date = java.time.LocalDate.now().minusDays(i);
                    java.time.LocalDateTime startOfDay = date.atStartOfDay();
                    java.time.LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();
                    
                    System.out.println("DEBUG: Checking post growth for date: " + date);
                    long count = postRepository.countByCreatedDateBetween(startOfDay, endOfDay);
                    postGrowth.put(date.toString(), count);
                    System.out.println("DEBUG: Found " + count + " posts created on " + date);
                }
                analytics.put("postGrowth", postGrowth);} catch (Exception e) {
                System.err.println("ERROR: Failed to get post growth data: " + e.getMessage());
                e.printStackTrace();
                analytics.put("postGrowth", new LinkedHashMap<>());
            }
              System.out.println("DEBUG: Building report distribution analytics...");
            // Report status distribution - Using LinkedHashMap to preserve order
            Map<String, Long> reportDistribution = new LinkedHashMap<>();
            try {
                reportDistribution.put("PENDING", reportRepository.countByStatus(Report.ReportStatus.PENDING));
                reportDistribution.put("RESOLVED", reportRepository.countByStatus(Report.ReportStatus.RESOLVED));
                reportDistribution.put("DISMISSED", reportRepository.countByStatus(Report.ReportStatus.DISMISSED));
                analytics.put("reportDistribution", reportDistribution);            } catch (Exception e) {
                System.err.println("ERROR: Failed to get report distribution data: " + e.getMessage());
                e.printStackTrace();
                analytics.put("reportDistribution", new LinkedHashMap<>());
            }

            System.out.println("DEBUG: Successfully built analytics: " + analytics);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            System.err.println("ERROR: Failed to get analytics: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to get analytics: " + e.getMessage()));
        }
    }

    /**
     * Check if current user has admin access
     */
    @GetMapping("/check-access")
    public ResponseEntity<?> checkAdminAccess() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            boolean hasAdminAccess = isAdmin(auth);
            boolean hasFullAdminAccess = isFullAdmin(auth);
            
            Map<String, Object> access = new HashMap<>();
            access.put("hasAdminAccess", hasAdminAccess);
            access.put("hasFullAdminAccess", hasFullAdminAccess);
            
            if (hasAdminAccess) {
                Integer userId = getUserIdFromAuth(auth);
                User user = userRepository.findById(userId).orElse(null);
                if (user != null && user.getRole() != null) {
                    access.put("role", user.getRole().getRoleName());
                    access.put("roleId", user.getRole().getId());
                }
            }
            
            return ResponseEntity.ok(access);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to check admin access: " + e.getMessage()));
        }
    }

    /**
     * Helper method to extract user ID from authentication
     */
    private Integer getUserIdFromAuth(Authentication auth) {
        String username = auth.getName();
        User user = userRepository.findByUsername(username);
        if (user != null) {
            return user.getId();
        }
        throw new RuntimeException("User not found in authentication context");
    }
}
