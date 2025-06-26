package com.example.server.controller;

import com.example.server.service.ReportService;
import com.example.server.service.UserService;
import com.example.server.service.PostService;
import com.example.server.dto.*;
import com.example.server.repository.UserRepository;
import com.example.server.repository.PostRepository;
import com.example.server.repository.CommentRepository;
import com.example.server.repository.ReportRepository;
import com.example.server.repository.MessageRepository;
import com.example.server.repository.ChatRoomRepository;
import com.example.server.model.Entity.User;
import com.example.server.model.Entity.Report;
import com.example.server.model.Entity.Message;
import com.example.server.model.Entity.ChatRoom;
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
    private PostRepository postRepository;    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ChatRoomRepository chatRoomRepository;

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
     */    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            
            if (!isAdmin(auth)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin privileges required."));
            }
            
            Map<String, Object> stats = new HashMap<>();
            
            // User statistics
            long totalUsers = userRepository.count();
            long newUsersThisMonth = userRepository.countByCreatedDateAfter(
                java.time.ZonedDateTime.now().minusMonths(1)
            );
            stats.put("totalUsers", totalUsers);
            stats.put("newUsersThisMonth", newUsersThisMonth);

            // Post statistics
            long totalPosts = postRepository.count();
            long newPostsThisMonth = postRepository.countByCreatedDateAfter(
                java.time.ZonedDateTime.now().minusMonths(1)
            );
            stats.put("totalPosts", totalPosts);
            stats.put("newPostsThisMonth", newPostsThisMonth);

            try {
                // Comment statistics
                long totalComments = commentRepository.count();
                stats.put("totalComments", totalComments);
            } catch (Exception e) {
                stats.put("totalComments", 0L);
            }
            
            try {
                // Report statistics
                long totalReports = reportRepository.count();
                long pendingReports = reportRepository.countByStatus(Report.ReportStatus.PENDING);
                long resolvedReports = reportRepository.countByStatus(Report.ReportStatus.RESOLVED);
                stats.put("totalReports", totalReports);
                stats.put("pendingReports", pendingReports);
                stats.put("resolvedReports", resolvedReports);
            } catch (Exception e) {
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
                    
                    // Convert LocalDate to ZonedDateTime at start of day since UserData.createdAt is ZonedDateTime
                    java.time.ZonedDateTime zonedDate = date.atStartOfDay(java.time.ZoneId.systemDefault());
                    long count = userRepository.countByCreatedDateOnDate(zonedDate);
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
                    java.time.ZonedDateTime startOfDay = date.atStartOfDay(java.time.ZoneOffset.UTC);
                    java.time.ZonedDateTime endOfDay = date.plusDays(1).atStartOfDay(java.time.ZoneOffset.UTC);
                    
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
        }    }    // ===============================
    // CHAT ROOM MANAGEMENT
    // ===============================

    /**
     * Get all chat rooms for admin management
     */
    @GetMapping("/chat-rooms")
    public ResponseEntity<?> getAllChatRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (!isAdmin(auth)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied"));
            }

            List<ChatRoom> chatRooms = chatRoomRepository.findAll();
            
            // Convert to response format
            List<Map<String, Object>> chatRoomList = chatRooms.stream()
                .map(chatRoom -> {
                    Map<String, Object> chatRoomData = new HashMap<>();
                    chatRoomData.put("id", chatRoom.getId());
                    chatRoomData.put("roomName", chatRoom.getRoomName());
                    chatRoomData.put("isGroupChat", chatRoom.getIsGroupChat());
                    chatRoomData.put("createdDate", chatRoom.getCreatedDate());
                    chatRoomData.put("messageCount", chatRoom.getMessages() != null ? chatRoom.getMessages().size() : 0);
                    chatRoomData.put("participantCount", chatRoom.getRoomUsers() != null ? chatRoom.getRoomUsers().size() : 0);
                    return chatRoomData;
                })
                .toList();
                
            Map<String, Object> response = new HashMap<>();
            response.put("chatRooms", chatRoomList);
            response.put("totalElements", chatRoomList.size());
            response.put("totalPages", (chatRoomList.size() / size) + 1);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error fetching chat rooms: " + e.getMessage()));
        }
    }    /**
     * Delete a chat room
     */
    @DeleteMapping("/chat-rooms/{roomId}")
    public ResponseEntity<?> deleteChatRoom(@PathVariable Long roomId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (!isFullAdmin(auth)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Full admin access required"));
            }

            if (chatRoomRepository.existsById(roomId)) {
                chatRoomRepository.deleteById(roomId);
                return ResponseEntity.ok(Map.of("message", "Chat room deleted successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Chat room not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error deleting chat room: " + e.getMessage()));
        }
    }    // ===============================
    // MESSAGE MANAGEMENT
    // ===============================

    /**
     * Get all messages for admin review
     */
    @GetMapping("/messages")
    public ResponseEntity<?> getAllMessages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (!isAdmin(auth)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied"));
            }

            List<Message> messages = messageRepository.findAll();
            
            // Filter by keyword if provided
            if (keyword != null && !keyword.trim().isEmpty()) {
                messages = messages.stream()
                    .filter(message -> message.getContent().toLowerCase().contains(keyword.toLowerCase()))
                    .toList();
            }
            
            // Convert to response format
            List<Map<String, Object>> messageList = messages.stream()
                .map(message -> {
                    Map<String, Object> messageData = new HashMap<>();
                    messageData.put("id", message.getId());
                    messageData.put("content", message.getContent());
                    messageData.put("timestamp", message.getTimestamp());
                    messageData.put("senderUsername", message.getSender() != null ? message.getSender().getUsername() : "Unknown");
                    messageData.put("senderId", message.getSender() != null ? message.getSender().getId() : null);
                    messageData.put("chatRoomId", message.getChatRoom() != null ? message.getChatRoom().getId() : null);
                    messageData.put("chatRoomName", message.getChatRoom() != null ? message.getChatRoom().getRoomName() : "Unknown");
                    return messageData;
                })
                .toList();
                
            Map<String, Object> response = new HashMap<>();
            response.put("messages", messageList);
            response.put("totalElements", messageList.size());
            response.put("totalPages", (messageList.size() / size) + 1);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error fetching messages: " + e.getMessage()));
        }
    }    /**
     * Delete a message
     */
    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long messageId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (!isAdmin(auth)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied"));
            }

            if (messageRepository.existsById(messageId)) {
                messageRepository.deleteById(messageId);
                return ResponseEntity.ok(Map.of("message", "Message deleted successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Message not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error deleting message: " + e.getMessage()));
        }
    }

    // ===============================
    // COMMENT MANAGEMENT
    // ===============================

    /**
     * Get all comments for admin review
     */
    @GetMapping("/comments")
    public ResponseEntity<?> getAllComments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (!isAdmin(auth)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied"));
            }

            // Get comments with pagination and search
            Map<String, Object> response = new HashMap<>();
              // For now, get all comments (would need pagination implementation)
            List<Map<String, Object>> comments = commentRepository.findAll().stream()
                .map(comment -> {
                    Map<String, Object> commentData = new HashMap<>();
                    commentData.put("id", comment.getId());
                    commentData.put("content", comment.getText());
                    commentData.put("createdAt", comment.getCreatedDate());
                    commentData.put("authorUsername", comment.getUser() != null ? comment.getUser().getUsername() : "Unknown");
                    commentData.put("postId", comment.getPost() != null ? comment.getPost().getId() : null);
                    return commentData;
                })
                .toList();
            
            response.put("comments", comments);
            response.put("totalElements", comments.size());
            response.put("totalPages", (comments.size() / size) + 1);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error fetching comments: " + e.getMessage()));
        }
    }

    /**
     * Delete a comment
     */
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Long commentId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (!isAdmin(auth)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied"));
            }

            if (commentRepository.existsById(commentId)) {
                commentRepository.deleteById(commentId);
                return ResponseEntity.ok(Map.of("message", "Comment deleted successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Comment not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error deleting comment: " + e.getMessage()));
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
