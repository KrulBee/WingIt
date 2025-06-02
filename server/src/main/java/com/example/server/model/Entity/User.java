package com.example.server.model.Entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonBackReference;

import java.util.List;

@Entity
@Table(name = "user")
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
    private String provider; // google, facebook, etc. null for regular users

    @Column(name = "provider_id")
    private String providerId; // OAuth2 provider user ID

    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    @JsonBackReference
    private Role role;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private UserData userData;

    @OneToMany(mappedBy = "user")
    private List<Post> posts;

    @OneToMany(mappedBy = "user")
    private List<Comment> comments;

    @OneToMany(mappedBy = "user1")
    private List<Friend> friendsAsUser1;

    @OneToMany(mappedBy = "user2")
    private List<Friend> friendsAsUser2;

    @OneToMany(mappedBy = "sender")  // Changed from "sender_id" to "sender"
    private List<FriendRequest> sentFriendRequests;

    @OneToMany(mappedBy = "receiver")  // Changed from "receiver_id" to "receiver"
    private List<FriendRequest> receivedFriendRequests;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Block> blockedUsers;

    @OneToMany(mappedBy = "blockedUser", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Block> blockedByUsers;

    @OneToMany(mappedBy = "sender")  // Changed from "sender_id" to "sender"
    private List<Message> sentMessages;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RoomUser> roomUsers;

    @OneToMany(mappedBy = "user")
    private List<PostReaction> postReactions;

    @OneToMany(mappedBy = "user")
    private List<CommentReaction> commentReactions;
}