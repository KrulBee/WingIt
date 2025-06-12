package com.example.server.service;

import com.example.server.repository.BlockRepository;
import com.example.server.repository.UserRepository;
import com.example.server.model.Entity.Block;
import com.example.server.model.Entity.User;
import com.example.server.dto.BlockDTO;
import com.example.server.dto.UserDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BlockService {

    private final BlockRepository blockRepository;
    private final UserRepository userRepository;

    @Autowired
    public BlockService(BlockRepository blockRepository, UserRepository userRepository) {
        this.blockRepository = blockRepository;
        this.userRepository = userRepository;
    }

    public BlockDTO blockUser(String currentUsername, Integer blockedUserId) {
        // Get current user
        User currentUser = userRepository.findByUsername(currentUsername);
        if (currentUser == null) {
            throw new RuntimeException("Current user not found");
        }

        // Get user to block
        Optional<User> userToBlockOpt = userRepository.findById(blockedUserId);
        if (userToBlockOpt.isEmpty()) {
            throw new RuntimeException("User to block not found");
        }
        User userToBlock = userToBlockOpt.get();

        // Check if user is trying to block themselves
        if (currentUser.getId().equals(blockedUserId)) {
            throw new RuntimeException("Cannot block yourself");
        }

        // Check if already blocked
        if (blockRepository.existsByUser_IdAndBlockedUser_Id(currentUser.getId(), blockedUserId)) {
            throw new RuntimeException("User is already blocked");
        }

        // Create block
        Block block = new Block();
        block.setUser(currentUser);
        block.setBlockedUser(userToBlock);
        block.setCreatedAt(LocalDateTime.now());

        Block savedBlock = blockRepository.save(block);

        // Return BlockDTO
        return new BlockDTO(
            savedBlock.getId(),
            savedBlock.getUser().getId(),
            savedBlock.getBlockedUser().getId(),
            userToBlock.getUsername(),
            userToBlock.getUserData() != null ? userToBlock.getUserData().getDisplayName() : userToBlock.getUsername(),
            userToBlock.getUserData() != null ? userToBlock.getUserData().getProfilePicture() : null,
            savedBlock.getCreatedAt()
        );
    }

    public void unblockUser(String currentUsername, Integer blockedUserId) {
        // Get current user
        User currentUser = userRepository.findByUsername(currentUsername);
        if (currentUser == null) {
            throw new RuntimeException("Current user not found");
        }

        // Find and delete block
        Optional<Block> blockOpt = blockRepository.findByUser_IdAndBlockedUser_Id(currentUser.getId(), blockedUserId);
        if (blockOpt.isEmpty()) {
            throw new RuntimeException("Block not found");
        }

        blockRepository.delete(blockOpt.get());
    }

    public List<UserDTO> getBlockedUsers(String currentUsername) {
        // Get current user
        User currentUser = userRepository.findByUsername(currentUsername);
        if (currentUser == null) {
            throw new RuntimeException("Current user not found");
        }

        // Get all blocks by current user
        List<Block> blocks = blockRepository.findByUser_Id(currentUser.getId());

        // Convert to UserDTO list
        return blocks.stream()
            .map(block -> {
                User blockedUser = block.getBlockedUser();
                if (blockedUser != null) {
                    UserDTO userDTO = new UserDTO();
                    userDTO.setId(blockedUser.getId());
                    userDTO.setUsername(blockedUser.getUsername());
                    userDTO.setEmail(blockedUser.getEmail());
                    if (blockedUser.getUserData() != null) {
                        userDTO.setDisplayName(blockedUser.getUserData().getDisplayName());
                        userDTO.setProfilePicture(blockedUser.getUserData().getProfilePicture());
                        userDTO.setBio(blockedUser.getUserData().getBio());
                    }
                    return userDTO;
                }
                return null;
            })
            .filter(userDTO -> userDTO != null)
            .collect(Collectors.toList());
    }

    public boolean isUserBlocked(String currentUsername, Integer userId) {
        // Get current user
        User currentUser = userRepository.findByUsername(currentUsername);
        if (currentUser == null) {
            throw new RuntimeException("Current user not found");
        }

        return blockRepository.existsByUser_IdAndBlockedUser_Id(currentUser.getId(), userId);
    }

    public boolean isUserBlockedBy(String currentUsername, Integer userId) {
        // Get current user
        User currentUser = userRepository.findByUsername(currentUsername);
        if (currentUser == null) {
            throw new RuntimeException("Current user not found");
        }

        return blockRepository.existsByUser_IdAndBlockedUser_Id(userId, currentUser.getId());
    }
}
