package com.example.server.model.Entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.ZonedDateTime;
import java.time.ZoneOffset;

@Entity
@Table(name = "comment_replies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentReply {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "root_comment_id", nullable = false)
    private Comment rootComment;

    @ManyToOne
    @JoinColumn(name = "reply_id", nullable = false)
    private Comment reply;

    private ZonedDateTime createdDate;

    @PrePersist
    protected void onCreate() {
        createdDate = ZonedDateTime.now(ZoneOffset.UTC);
    }
}
