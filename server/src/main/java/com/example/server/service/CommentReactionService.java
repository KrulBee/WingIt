package com.example.server.service;

import com.example.server.dto.CommentReactionDTO;
import com.example.server.model.Entity.CommentReaction;
import com.example.server.model.Entity.Comment;
import com.example.server.model.Entity.User;
import com.example.server.model.Entity.ReactionType;
import com.example.server.repository.CommentReactionRepository;
import com.example.server.repository.CommentRepository;
import com.example.server.repository.UserRepository;
import com.example.server.repository.ReactionTypeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CommentReactionService {    private final CommentReactionRepository commentReactionRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final ReactionTypeRepository reactionTypeRepository;

    public CommentReactionService(CommentReactionRepository commentReactionRepository,
                                 CommentRepository commentRepository,
                                 UserRepository userRepository,
                                 ReactionTypeRepository reactionTypeRepository) {
        this.commentReactionRepository = commentReactionRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.reactionTypeRepository = reactionTypeRepository;
    }    public CommentReactionDTO addReaction(Long commentId, Integer userId, Long reactionTypeId) {
        System.out.println("Adding reaction - commentId: " + commentId + ", userId: " + userId + ", reactionTypeId: " + reactionTypeId);
        
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        System.out.println("Comment found: " + comment.getId());
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        System.out.println("User found: " + user.getId());
        
        ReactionType reactionType = reactionTypeRepository.findById(reactionTypeId)
                .orElseThrow(() -> new RuntimeException("Reaction type not found"));
        System.out.println("ReactionType found: " + reactionType.getId() + " - " + reactionType.getName());

        // Check if user already reacted to this comment
        Optional<CommentReaction> existingReaction = commentReactionRepository.findByCommentIdAndUserId(commentId, userId);

        CommentReaction reaction;
        if (existingReaction.isPresent()) {
            // Update existing reaction
            reaction = existingReaction.get();
            reaction.setReactionType(reactionType);
            reaction.setTimestamp(LocalDateTime.now());
        } else {
            // Create new reaction
            reaction = new CommentReaction();
            reaction.setComment(comment);
            reaction.setUser(user);
            reaction.setReactionType(reactionType);
            reaction.setTimestamp(LocalDateTime.now());
        }

        CommentReaction savedReaction = commentReactionRepository.save(reaction);
        return convertToDTO(savedReaction);
    }

    public void removeReaction(Long commentId, Integer userId) {
        CommentReaction reaction = commentReactionRepository.findByCommentIdAndUserId(commentId, userId)
                .orElseThrow(() -> new RuntimeException("Reaction not found"));

        commentReactionRepository.delete(reaction);
    }

    public List<CommentReactionDTO> getReactionsByCommentId(Long commentId) {
        List<CommentReaction> reactions = commentReactionRepository.findByCommentId(commentId);

        return reactions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<CommentReactionDTO> getReactionsByUserId(Integer userId) {
        List<CommentReaction> reactions = commentReactionRepository.findByUserId(userId);

        return reactions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CommentReactionDTO getUserReactionForComment(Long commentId, Integer userId) {
        CommentReaction reaction = commentReactionRepository.findByCommentIdAndUserId(commentId, userId)
                .orElse(null);

        return reaction != null ? convertToDTO(reaction) : null;
    }

    public long getReactionCountByCommentId(Long commentId) {
        return commentReactionRepository.countByCommentId(commentId);
    }

    public long getReactionCountByCommentIdAndType(Long commentId, Long reactionTypeId) {
        return commentReactionRepository.countByCommentIdAndReactionTypeId(commentId, reactionTypeId);
    }

    private CommentReactionDTO convertToDTO(CommentReaction reaction) {
        CommentReactionDTO dto = new CommentReactionDTO();
        dto.setId(reaction.getId());
        dto.setCommentId(reaction.getComment().getId());
        dto.setUserId(reaction.getUser().getId().longValue());
        dto.setReactionTypeId(reaction.getReactionType().getId());
        dto.setTimestamp(reaction.getTimestamp());
        return dto;
    }
}
