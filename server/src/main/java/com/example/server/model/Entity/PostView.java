package com.example.server.model.Entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "post_views")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = true)
    private User user; // Can be null for anonymous views

    @Enumerated(EnumType.STRING)
    @Column(name = "view_source", nullable = false)
    private ViewSource viewSource;

    @Column(name = "duration_ms")
    private Long durationMs; // Duration in milliseconds for modal views

    @Column(name = "viewed_at", nullable = false)
    private LocalDateTime viewedAt;

    @Column(name = "session_id")
    private String sessionId; // For tracking view sessions

    @Column(name = "ip_address", length = 45)
    private String ipAddress; // For anonymous tracking

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @PrePersist
    protected void onCreate() {
        if (viewedAt == null) {
            viewedAt = LocalDateTime.now();
        }
    }

    public enum ViewSource {
        feed, modal, profile, search, bookmark, notification
    }
}
