package com.example.wingit.model.Entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;
import java.util.Set;

@Entity
@Table(name = "user") // Changed table name to "user" for consistency with DB
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id; // Changed to Integer to match UserData.userId if it's a foreign key

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password; // Remember to hash this in a real application

    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private UserData userData;

    @OneToMany(mappedBy = "user")
    private List<Post> posts;

    @OneToMany(mappedBy = "user")
    private List<Comment> comments;

    @OneToMany(mappedBy = "user")
    private List<CommentReply> commentReplies;

    @OneToMany(mappedBy = "follower")
    private List<Follow> following;

    @OneToMany(mappedBy = "following")
    private List<Follow> followers;

    @OneToMany(mappedBy = "user1")
    private List<Friend> friendsAsUser1;

    @OneToMany(mappedBy = "user2")
    private List<Friend> friendsAsUser2;

    @OneToMany(mappedBy = "sender")
    private List<FriendRequest> sentFriendRequests;

    @OneToMany(mappedBy = "receiver")
    private List<FriendRequest> receivedFriendRequests;

    @OneToMany(mappedBy = "blocker")
    private List<Block> blockedUsers;

    @OneToMany(mappedBy = "blockedUser")
    private List<Block> blockedByUsers;

    @OneToMany(mappedBy = "sender")
    private List<Message> sentMessages;

    @ManyToMany(mappedBy = "user")
    private Set<ChatRoom> chatRooms;

    @OneToMany(mappedBy = "user")
    private List<PostReaction> postReactions;
}