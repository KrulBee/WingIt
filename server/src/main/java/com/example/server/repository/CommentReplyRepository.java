package com.example.server.repository;

import com.example.server.model.Entity.CommentReply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentReplyRepository extends JpaRepository<CommentReply, Long> {
    List<CommentReply> findByCommentIdOrderByCreatedDateAsc(Long commentId);
    List<CommentReply> findByUserIdOrderByCreatedDateDesc(Integer userId);
    long countByCommentId(Long commentId);
}