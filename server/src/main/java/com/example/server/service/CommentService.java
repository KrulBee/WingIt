package com.example.server.service;

import com.example.server.dto.*;
import com.example.server.model.Entity.*;
import com.example.server.repository.*;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {    private final CommentRepository commentRepository;
    private final CommentReplyRepository commentReplyRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ProfanityDetectionService profanityDetectionService;

    public CommentService(CommentRepository commentRepository, CommentReplyRepository commentReplyRepository, 
                         PostRepository postRepository, UserRepository userRepository,
                         NotificationService notificationService, ProfanityDetectionService profanityDetectionService) {
        this.commentRepository = commentRepository;
        this.commentReplyRepository = commentReplyRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.profanityDetectionService = profanityDetectionService;
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
                .orElseThrow(() -> new RuntimeException("User not found"));        // Check for profanity in comment content
        String commentText = request.getActualText();
        try {
            ProfanityDetectionService.ProfanityResult profanityResult = 
                profanityDetectionService.checkProfanity(commentText);
            
            if (profanityResult.isProfane()) {
                throw new RuntimeException("Bình luận chứa từ ngữ không phù hợp. Vui lòng chỉnh sửa và thử lại.");
            }        } catch (RuntimeException e) {
            // If AI server is loading or unavailable, check if error message indicates loading
            String errorMsg = e.getMessage();
            if (errorMsg != null && (
                errorMsg.contains("đang khởi động") || 
                errorMsg.contains("Model is still loading") || 
                errorMsg.contains("AI server is not available") ||
                errorMsg.contains("tạm thời không khả dụng"))) {
                // Re-throw the user-friendly message from ProfanityDetectionService
                throw e;
            }
            // For profanity detection errors, re-throw as-is
            if (errorMsg != null && errorMsg.contains("từ ngữ không phù hợp")) {
                throw e;
            }
            // For other AI errors, provide a generic message
            throw new RuntimeException("Hệ thống kiểm tra nội dung tạm thời không khả dụng. Vui lòng thử lại sau.");
        }

        Comment comment = new Comment();
        comment.setPost(post);
        comment.setUser(user);
        comment.setText(commentText);
        comment.setIsReply(false); // Root comment
        comment.setCreatedDate(ZonedDateTime.now(ZoneOffset.UTC));
        comment.setUpdatedAt(ZonedDateTime.now(ZoneOffset.UTC));

        Comment savedComment = commentRepository.save(comment);        // Trigger async comment notification if commenter is not the post author
        try {
            if (!post.getUser().getId().equals(userId)) {
                // Use async notification for better performance in social media
                notificationService.createCommentNotificationAsync(
                    savedComment.getUser().getId(), 
                    savedComment.getPost().getId(), 
                    savedComment.getId()
                );
            }
        } catch (Exception e) {
            // Log error but don't fail comment creation
            System.err.println("Failed to create async comment notification: " + e.getMessage());
        }
        
        return convertToDTO(savedComment);    }

    public CommentDTO updateComment(Long id, CreateCommentRequest request, Integer userId) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Check if user owns the comment
        if (!comment.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only edit your own comments");
        }

        comment.setText(request.getActualText()); // Use getActualText() to handle both 'text' and 'content'
        comment.setUpdatedAt(ZonedDateTime.now(ZoneOffset.UTC));

        Comment updatedComment = commentRepository.save(comment);
        return convertToDTO(updatedComment);
    }

    // Keep the old method for backward compatibility (admin use)
    public CommentDTO updateComment(Long id, CreateCommentRequest request) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        comment.setText(request.getActualText()); // Use getActualText() to handle both 'text' and 'content'
        comment.setUpdatedAt(ZonedDateTime.now(ZoneOffset.UTC));

        Comment updatedComment = commentRepository.save(comment);
        return convertToDTO(updatedComment);
    }

    public void deleteComment(Long id, Integer userId) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Check if user owns the comment
        if (!comment.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }

    // Keep the old method for backward compatibility (admin use)
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
        replyComment.setCreatedDate(ZonedDateTime.now(ZoneOffset.UTC));
        replyComment.setUpdatedAt(ZonedDateTime.now(ZoneOffset.UTC));

        Comment savedReply = commentRepository.save(replyComment);
        
        // Create the relationship in comment_replies table
        CommentReply relationship = new CommentReply();
        relationship.setRootComment(rootComment);
        relationship.setReply(savedReply);
        relationship.setCreatedDate(ZonedDateTime.now(ZoneOffset.UTC));
        
        // Trigger async comment notification if replier is not the original commenter
        commentReplyRepository.save(relationship);        
        try {
            if (!rootComment.getUser().getId().equals(userId)) {
                // Use async notification for better social media performance
                notificationService.createCommentNotificationAsync(
                    savedReply.getUser().getId(), 
                    savedReply.getPost().getId(), 
                    savedReply.getId()
                );
            }
        } catch (Exception e) {
            // Log error but don't fail reply creation
            System.err.println("Failed to create async reply notification: " + e.getMessage());
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
