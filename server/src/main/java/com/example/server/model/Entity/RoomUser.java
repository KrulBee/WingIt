package com.example.server.model.Entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.ZonedDateTime;
import java.time.ZoneOffset;

@Entity
@Table(name = "room_user") // This is the join table for ChatRoom and User
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomUser { // Represents the relationship between a User and a ChatRoom

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "chat_room_id", nullable = false)
    private ChatRoom chatRoom;

    private ZonedDateTime joinedAt;

    // Could add a role for the user within the room, e.g., ADMIN, MEMBER
    // @Column(nullable = false)
    // private String roleInRoom; 

    @PrePersist
    protected void onCreate() {
        joinedAt = ZonedDateTime.now(ZoneOffset.UTC);
    }
}
