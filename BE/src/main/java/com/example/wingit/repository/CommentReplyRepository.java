package com.example.wingit.repository;

import com.example.wingit.model.Entity.CommentReply;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentReplyRepository extends JpaRepository<CommentReply, Integer> {
    CommentReply findByCommentId(int commentId);
}