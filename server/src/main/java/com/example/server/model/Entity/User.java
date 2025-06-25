package com.example.server.model.Entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonBackReference;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = true) // Changed to nullable for OAuth2 users
    private String password;

    @Column(unique = true)
    private String email; // For OAuth2 users

    @Column(name = "provider")
    private String provider; // google, facebook, etc. null for regular users    @Column(name = "provider_id")
    private String providerId; // OAuth2 provider user ID

    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    @JsonBackReference
    private Role role;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private UserData userData;    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Post> posts;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments;

    @OneToMany(mappedBy = "user1", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Friend> friendsAsUser1;

    @OneToMany(mappedBy = "user2", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Friend> friendsAsUser2;@OneToMany(mappedBy = "sender", cascade = CascadeType.ALL, orphanRemoval = true)  // Changed from "sender_id" to "sender"
    private List<FriendRequest> sentFriendRequests;

    @OneToMany(mappedBy = "receiver", cascade = CascadeType.ALL, orphanRemoval = true)  // Changed from "receiver_id" to "receiver"
    private List<FriendRequest> receivedFriendRequests;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Block> blockedUsers;

    @OneToMany(mappedBy = "blockedUser", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Block> blockedByUsers;    @OneToMany(mappedBy = "sender", cascade = CascadeType.ALL, orphanRemoval = true)  // Changed from "sender_id" to "sender"
    private List<Message> sentMessages;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RoomUser> roomUsers;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostReaction> postReactions;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CommentReaction> commentReactions;    // Helper methods to get data from relationships
    public ZonedDateTime getCreatedDate() {
        return userData != null ? userData.getCreatedAt() : null;
    }
}