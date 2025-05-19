package com.example.wingit.model.Entity;

import com.example.wingit.model.Enum.FriendRequestStatus; // Assuming an Enum for status
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "friend_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FriendRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FriendRequestStatus status;

    private LocalDateTime requestDate;
    private LocalDateTime responseDate;

    @PrePersist
    protected void onCreate() {
        requestDate = LocalDateTime.now();
        status = FriendRequestStatus.PENDING;
    }
}
