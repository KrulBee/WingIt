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
    private final NotificationService notificationService;

    @Autowired
    public CommentService(CommentRepository commentRepository, CommentReplyRepository commentReplyRepository, 
                         PostRepository postRepository, UserRepository userRepository,
                         NotificationService notificationService) {
        this.commentRepository = commentRepository;
        this.commentReplyRepository = commentReplyRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }
    
    public List<CommentDTO> getCommentsByPostId(Long postId) {
        // Only get root comments (non-replies)
        return commentRepository.findByPostIdAndIsReplyFalseOrderByCreatedDateDesc(postId).stream()
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
        comment.setText(request.getActualText()); // Use getActualText() to handle both 'text' and 'content'
        comment.setIsReply(false); // Root comment
        comment.setCreatedDate(LocalDateTime.now());
        comment.setUpdatedAt(LocalDateTime.now());

        Comment savedComment = commentRepository.save(comment);
          // Trigger comment notification if commenter is not the post author
        try {
            if (!post.getUser().getId().equals(userId)) {
                notificationService.createCommentNotification(
                    savedComment.getUser().getId(), 
                    savedComment.getPost().getId(), 
                    savedComment.getId()
                );
            }
        } catch (Exception e) {
            // Log error but don't fail comment creation
            System.err.println("Failed to create comment notification: " + e.getMessage());
        }
        
        return convertToDTO(savedComment);    }

    public CommentDTO updateComment(Long id, CreateCommentRequest request) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        comment.setText(request.getActualText()); // Use getActualText() to handle both 'text' and 'content'
        comment.setUpdatedAt(LocalDateTime.now());
        
        Comment updatedComment = commentRepository.save(comment);
        return convertToDTO(updatedComment);
    }

    public void deleteComment(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        commentRepository.delete(comment);
    }    public CommentDTO createReply(Long commentId, CreateCommentRequest request, Integer userId) {
        Comment rootComment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create the reply as a comment with isReply = true
        Comment replyComment = new Comment();
        replyComment.setPost(rootComment.getPost()); // Same post as root comment
        replyComment.setUser(user);
        replyComment.setText(request.getActualText());
        replyComment.setIsReply(true); // Mark as reply
        replyComment.setCreatedDate(LocalDateTime.now());
        replyComment.setUpdatedAt(LocalDateTime.now());

        Comment savedReply = commentRepository.save(replyComment);
        
        // Create the relationship in comment_replies table
        CommentReply relationship = new CommentReply();
        relationship.setRootComment(rootComment);
        relationship.setReply(savedReply);
        relationship.setCreatedDate(LocalDateTime.now());
        
        commentReplyRepository.save(relationship);
          // Trigger comment notification if replier is not the original commenter
        try {
            if (!rootComment.getUser().getId().equals(userId)) {
                notificationService.createCommentNotification(
                    savedReply.getUser().getId(), 
                    savedReply.getPost().getId(), 
                    savedReply.getId()
                );
            }
        } catch (Exception e) {
            // Log error but don't fail reply creation
            System.err.println("Failed to create reply notification: " + e.getMessage());
        }
        
        return convertToDTO(savedReply);
    }

    public List<CommentDTO> getRepliesByCommentId(Long commentId) {
        List<CommentReply> relationships = commentReplyRepository.findByRootCommentIdOrderByCreatedDateAsc(commentId);
        return relationships.stream()
                .map(relationship -> convertToDTO(relationship.getReply()))
                .collect(Collectors.toList());
    }
    
    private CommentDTO convertToDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setPostId(comment.getPost().getId());
        dto.setText(comment.getText());
        dto.setCreatedDate(comment.getCreatedDate());
        dto.setUpdatedAt(comment.getUpdatedAt());
        dto.setIsReply(comment.getIsReply());
        
        // Convert author
        UserDTO authorDTO = new UserDTO();
        authorDTO.setId(comment.getUser().getId());
        authorDTO.setUsername(comment.getUser().getUsername());
        if (comment.getUser().getUserData() != null) {
            authorDTO.setDisplayName(comment.getUser().getUserData().getDisplayName());
            authorDTO.setProfilePicture(comment.getUser().getUserData().getProfilePicture());
        }
        dto.setAuthor(authorDTO);        // Load and convert replies for any comment (root or reply)
        List<CommentReply> replyRelationships = commentReplyRepository.findByRootCommentIdOrderByCreatedDateAsc(comment.getId());
        List<CommentDTO> replyDTOs = replyRelationships.stream()
                .map(relationship -> convertToDTO(relationship.getReply()))
                .collect(Collectors.toList());
        dto.setReplies(replyDTOs);

        return dto;
    }
}
