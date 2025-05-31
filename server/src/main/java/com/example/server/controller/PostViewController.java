package com.example.server.controller;

import com.example.server.dto.*;
import com.example.server.model.Entity.User;
import com.example.server.repository.UserRepository;
import com.example.server.service.PostViewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/v1/post-views")
public class PostViewController {

    private final PostViewService postViewService;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    public PostViewController(PostViewService postViewService) {
        this.postViewService = postViewService;
    }

    @PostMapping("/posts/{postId}")
    public ResponseEntity<PostViewDTO> trackView(@PathVariable Long postId, 
                                               @RequestBody CreatePostViewRequest request,
                                               HttpServletRequest httpRequest) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = null;
            
            if (auth != null && !auth.getName().equals("anonymousUser")) {
                userId = getUserIdFromAuth(auth);
            }
            
            String ipAddress = getClientIpAddress(httpRequest);
            String userAgent = httpRequest.getHeader("User-Agent");
            
            PostViewDTO view = postViewService.trackView(postId, userId, request, ipAddress, userAgent);
            return ResponseEntity.ok(view);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{viewId}/duration")
    public ResponseEntity<PostViewDTO> updateViewDuration(@PathVariable Long viewId, 
                                                         @RequestParam Long durationMs) {
        try {
            PostViewDTO view = postViewService.updateViewDuration(viewId, durationMs);
            return ResponseEntity.ok(view);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/posts/{postId}/stats")
    public ResponseEntity<PostViewStatsDTO> getPostViewStats(@PathVariable Long postId) {
        try {
            PostViewStatsDTO stats = postViewService.getPostViewStats(postId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/analytics")
    public ResponseEntity<ViewAnalyticsSummaryDTO> getAnalyticsSummary() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = null;
            
            if (auth != null && !auth.getName().equals("anonymousUser")) {
                userId = getUserIdFromAuth(auth);
            }
            
            ViewAnalyticsSummaryDTO summary = postViewService.getAnalyticsSummary(userId);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/analytics/global")
    public ResponseEntity<ViewAnalyticsSummaryDTO> getGlobalAnalyticsSummary() {
        try {
            ViewAnalyticsSummaryDTO summary = postViewService.getAnalyticsSummary(null);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/posts/{postId}")
    public ResponseEntity<List<PostViewDTO>> getViewsByPostId(@PathVariable Long postId) {
        try {
            List<PostViewDTO> views = postViewService.getViewsByPostId(postId);
            return ResponseEntity.ok(views);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/user")
    public ResponseEntity<List<PostViewDTO>> getCurrentUserViews() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer userId = getUserIdFromAuth(auth);
            
            List<PostViewDTO> views = postViewService.getViewsByUserId(userId);
            return ResponseEntity.ok(views);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PostViewDTO>> getUserViews(@PathVariable Integer userId) {
        try {
            List<PostViewDTO> views = postViewService.getViewsByUserId(userId);
            return ResponseEntity.ok(views);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/locations/top")
    public ResponseEntity<List<LocationViewStatsDTO>> getTopLocationsByViews(
            @RequestParam(defaultValue = "5") int limit) {
        try {
            List<LocationViewStatsDTO> topLocations = postViewService.getTopLocationsByViews(limit);
            return ResponseEntity.ok(topLocations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/locations/{locationId}/stats")
    public ResponseEntity<LocationViewStatsDTO> getLocationViewStats(@PathVariable Integer locationId) {
        try {
            LocationViewStatsDTO stats = postViewService.getLocationViewStats(locationId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/old")
    public ResponseEntity<Void> clearOldViews(@RequestParam(defaultValue = "30") int daysOld) {
        try {
            postViewService.clearOldViews(daysOld);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/all")
    public ResponseEntity<Void> clearAllViews() {
        try {
            postViewService.clearAllViews();
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Helper method to extract user ID from authentication
    private Integer getUserIdFromAuth(Authentication auth) {
        String username = auth.getName();
        User user = userRepository.findByUsername(username);
        if (user != null) {
            return user.getId();
        }
        throw new RuntimeException("User not found in authentication context");
    }

    // Helper method to get client IP address
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedForHeader = request.getHeader("X-Forwarded-For");
        if (xForwardedForHeader == null) {
            return request.getRemoteAddr();
        } else {
            // X-Forwarded-For may contain multiple IP addresses, the first one is the original client IP
            return xForwardedForHeader.split(",")[0].trim();
        }
    }
}
