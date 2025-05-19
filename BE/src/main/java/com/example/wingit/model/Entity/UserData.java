package com.example.wingit.model.Entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "user_data")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserData {

    @Id
    private Integer userId; // This will be the foreign key from User and also the primary key here

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    private String displayName;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String profilePicture; // URL or path to the image

    private String dateOfBirth; // Consider using LocalDate

    private String createdAt;
    private String updatedAt; // Consider using LocalDateTime and @UpdateTimestamp

    // If you don't use @UpdateTimestamp, you might need a @PreUpdate method
    @PrePersist
    protected void onCreate() {
        createdAt = new java.sql.Timestamp(System.currentTimeMillis()).toString(); // Or use LocalDateTime
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = new java.sql.Timestamp(System.currentTimeMillis()).toString(); // Or use LocalDateTime
    }
}