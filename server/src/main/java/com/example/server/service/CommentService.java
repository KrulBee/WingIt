package com.example.server.service;

import com.example.server.dto.*;
import com.example.server.model.Entity.*;
import com.example.server.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final CommentReplyRepository commentReplyRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Autowired
    public CommentService(CommentRepository commentRepository, CommentReplyRepository commentReplyRepository, 
                         PostRepository postRepository, UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.commentReplyRepository = commentReplyRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }    public List<CommentDTO> getCommentsByPostId(Long postId) {
        return commentRepository.findByPostIdOrderByCreatedDateDesc(postId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CommentDTO createComment(Long postId, CreateCommentRequest request, Integer userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = new Comment();
        comment.setPost(post);
        comment.setUser(user);
        comment.setText(request.getText());
        comment.setCreatedDate(LocalDateTime.now());
        comment.setUpdatedAt(LocalDateTime.now());

        Comment savedComment = commentRepository.save(comment);
        return convertToDTO(savedComment);
    }

    public CommentDTO updateComment(Long id, CreateCommentRequest request) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        comment.setText(request.getText());
        comment.setUpdatedAt(LocalDateTime.now());
        
        Comment updatedComment = commentRepository.save(comment);
        return convertToDTO(updatedComment);
    }

    public void deleteComment(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        commentRepository.delete(comment);
    }

    public CommentReplyDTO createReply(Long commentId, CreateCommentRequest request, Integer userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CommentReply reply = new CommentReply();
        reply.setComment(comment);
        reply.setUser(user);
        reply.setText(request.getText());
        reply.setCreatedDate(LocalDateTime.now());
        reply.setUpdatedAt(LocalDateTime.now());

        CommentReply savedReply = commentReplyRepository.save(reply);
        return convertReplyToDTO(savedReply);
    }    public List<CommentReplyDTO> getRepliesByCommentId(Long commentId) {
        return commentReplyRepository.findByCommentIdOrderByCreatedDateAsc(commentId).stream()
                .map(this::convertReplyToDTO)
                .collect(Collectors.toList());
    }

    private CommentDTO convertToDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setPostId(comment.getPost().getId());
        dto.setText(comment.getText());
        dto.setCreatedDate(comment.getCreatedDate());
        dto.setUpdatedAt(comment.getUpdatedAt());
        
        // Convert author
        UserDTO authorDTO = new UserDTO();
        authorDTO.setId(comment.getUser().getId());
        authorDTO.setUsername(comment.getUser().getUsername());
        if (comment.getUser().getUserData() != null) {
            authorDTO.setDisplayName(comment.getUser().getUserData().getDisplayName());
            authorDTO.setProfilePicture(comment.getUser().getUserData().getProfilePicture());
        }
        dto.setAuthor(authorDTO);

        return dto;
    }

    private CommentReplyDTO convertReplyToDTO(CommentReply reply) {
        CommentReplyDTO dto = new CommentReplyDTO();
        dto.setId(reply.getId());
        dto.setCommentId(reply.getComment().getId());
        dto.setText(reply.getText());
        dto.setCreatedDate(reply.getCreatedDate());
        dto.setUpdatedAt(reply.getUpdatedAt());
        
        // Convert author
        UserDTO authorDTO = new UserDTO();
        authorDTO.setId(reply.getUser().getId());
        authorDTO.setUsername(reply.getUser().getUsername());
        if (reply.getUser().getUserData() != null) {
            authorDTO.setDisplayName(reply.getUser().getUserData().getDisplayName());
            authorDTO.setProfilePicture(reply.getUser().getUserData().getProfilePicture());
        }
        dto.setAuthor(authorDTO);

        return dto;
    }
}
