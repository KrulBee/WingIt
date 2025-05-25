package com.example.server.service;

import com.example.server.dto.PostReactionDTO;
import com.example.server.model.Entity.PostReaction;
import com.example.server.model.Entity.Post;
import com.example.server.model.Entity.User;
import com.example.server.model.Entity.ReactionType;
import com.example.server.repository.PostReactionRepository;
import com.example.server.repository.PostRepository;
import com.example.server.repository.UserRepository;
import com.example.server.repository.ReactionTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PostReactionService {

    private final PostReactionRepository postReactionRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final ReactionTypeRepository reactionTypeRepository;

    @Autowired
    public PostReactionService(PostReactionRepository postReactionRepository,
                              PostRepository postRepository,
                              UserRepository userRepository,
                              ReactionTypeRepository reactionTypeRepository) {
        this.postReactionRepository = postReactionRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.reactionTypeRepository = reactionTypeRepository;
    }    public PostReactionDTO addReaction(Long postId, Integer userId, Long reactionTypeId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        ReactionType reactionType = reactionTypeRepository.findById(reactionTypeId)
                .orElseThrow(() -> new RuntimeException("Reaction type not found"));

        // Check if user already reacted to this post
        Optional<PostReaction> existingReaction = postReactionRepository.findByPostIdAndUserId(postId, userId);

        PostReaction reaction;
        if (existingReaction.isPresent()) {
            // Update existing reaction
            reaction = existingReaction.get();
            reaction.setReactionType(reactionType);
            reaction.setTimestamp(LocalDateTime.now());
        } else {
            // Create new reaction
            reaction = new PostReaction();
            reaction.setPost(post);
            reaction.setUser(user);
            reaction.setReactionType(reactionType);
            reaction.setTimestamp(LocalDateTime.now());
        }

        PostReaction savedReaction = postReactionRepository.save(reaction);
        return convertToDTO(savedReaction);
    }    public void removeReaction(Long postId, Integer userId) {
        PostReaction reaction = postReactionRepository.findByPostIdAndUserId(postId, userId)
                .orElseThrow(() -> new RuntimeException("Reaction not found"));

        postReactionRepository.delete(reaction);
    }    public List<PostReactionDTO> getReactionsByPostId(Long postId) {
        List<PostReaction> reactions = postReactionRepository.findByPostId(postId);

        return reactions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }    public List<PostReactionDTO> getReactionsByUserId(Integer userId) {
        List<PostReaction> reactions = postReactionRepository.findByUserId(userId);

        return reactions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }    public PostReactionDTO getUserReactionForPost(Long postId, Integer userId) {
        PostReaction reaction = postReactionRepository.findByPostIdAndUserId(postId, userId)
                .orElse(null);

        return reaction != null ? convertToDTO(reaction) : null;
    }    public long getReactionCountByPostId(Long postId) {
        return postReactionRepository.countByPostId(postId);
    }    public long getReactionCountByPostIdAndType(Long postId, Long reactionTypeId) {
        return postReactionRepository.countByPostIdAndReactionTypeId(postId, reactionTypeId);
    }

    private PostReactionDTO convertToDTO(PostReaction reaction) {
        PostReactionDTO dto = new PostReactionDTO();
        dto.setId(reaction.getId());
        dto.setPostId(reaction.getPost().getId());
        dto.setUserId(reaction.getUser().getId().longValue());
        dto.setReactionTypeId(reaction.getReactionType().getId());
        dto.setTimestamp(reaction.getTimestamp());
        return dto;
    }
}
