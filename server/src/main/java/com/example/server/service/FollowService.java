package com.example.server.service;

import com.example.server.dto.FollowDTO;
import com.example.server.dto.UserDTO;
import com.example.server.model.Entity.Follow;
import com.example.server.model.Entity.User;
import com.example.server.repository.FollowRepository;
import com.example.server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    @Autowired
    public FollowService(FollowRepository followRepository, UserRepository userRepository) {
        this.followRepository = followRepository;
        this.userRepository = userRepository;
    }

    // Follow a user
    public FollowDTO followUser(Integer followerId, Integer followingId) {
        if (followerId.equals(followingId)) {
            throw new RuntimeException("Cannot follow yourself");
        }

        // Check if already following
        if (followRepository.existsByFollowerIdAndFollowingId(followerId, followingId)) {
            throw new RuntimeException("Already following this user");
        }

        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new RuntimeException("Follower not found"));
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new RuntimeException("User to follow not found"));

        Follow follow = new Follow();
        follow.setFollower(follower);
        follow.setFollowing(following);
        follow.setTimestamp(LocalDateTime.now());

        Follow savedFollow = followRepository.save(follow);
        return convertToDTO(savedFollow);
    }

    // Unfollow a user
    public void unfollowUser(Integer followerId, Integer followingId) {
        Optional<Follow> follow = followRepository.findByFollowerIdAndFollowingId(followerId, followingId);
        if (follow.isPresent()) {
            followRepository.delete(follow.get());
        } else {
            throw new RuntimeException("Not following this user");
        }
    }

    // Check if user A is following user B
    public boolean isFollowing(Integer followerId, Integer followingId) {
        return followRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
    }

    // Get all users that current user is following
    public List<FollowDTO> getFollowing(Integer userId) {
        List<Follow> follows = followRepository.findByFollowerId(userId);
        return follows.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get all followers of current user
    public List<FollowDTO> getFollowers(Integer userId) {
        List<Follow> follows = followRepository.findByFollowingId(userId);
        return follows.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get follow statistics
    public FollowStatsDTO getFollowStats(Integer userId) {
        long followersCount = followRepository.countByFollowingId(userId);
        long followingCount = followRepository.countByFollowerId(userId);
        
        FollowStatsDTO stats = new FollowStatsDTO();
        stats.setFollowersCount(followersCount);
        stats.setFollowingCount(followingCount);
        return stats;
    }

    // Get all follower IDs for a user (used for notifications)
    public List<Integer> getFollowerIds(Integer userId) {
        return followRepository.findFollowerIdsByUserId(userId);
    }

    // Convert Follow entity to DTO
    private FollowDTO convertToDTO(Follow follow) {
        FollowDTO dto = new FollowDTO();
        dto.setId(follow.getId());
        dto.setFollower(convertUserToDTO(follow.getFollower()));
        dto.setFollowing(convertUserToDTO(follow.getFollowing()));
        dto.setFollowDate(follow.getTimestamp().toString());
        return dto;
    }

    // Convert User entity to UserDTO
    private UserDTO convertUserToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        if (user.getUserData() != null) {
            dto.setDisplayName(user.getUserData().getDisplayName());
            dto.setBio(user.getUserData().getBio());
            dto.setProfilePicture(user.getUserData().getProfilePicture());
            dto.setDateOfBirth(user.getUserData().getDateOfBirth() != null ? 
                user.getUserData().getDateOfBirth().toString() : null);
        }
        return dto;
    }

    // Inner class for follow statistics
    public static class FollowStatsDTO {
        private long followersCount;
        private long followingCount;

        public long getFollowersCount() { return followersCount; }
        public void setFollowersCount(long followersCount) { this.followersCount = followersCount; }
        public long getFollowingCount() { return followingCount; }
        public void setFollowingCount(long followingCount) { this.followingCount = followingCount; }
    }
}
