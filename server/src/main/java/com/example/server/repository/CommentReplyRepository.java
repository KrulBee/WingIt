package com.example.server.repository;

import com.example.server.model.Entity.CommentReply;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentReplyRepository extends JpaRepository<CommentReply, Integer> {
    CommentReply findByCommentId(int commentId);
}