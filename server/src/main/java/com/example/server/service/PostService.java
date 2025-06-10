package com.example.server.service;

import com.example.server.dto.*;
import com.example.server.model.Entity.*;
import com.example.server.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final PostTypeRepository postTypeRepository;
    private final PostMediaRepository postMediaRepository;
    private final UserRepository userRepository;
    private final LocationRepository locationRepository;
    private final NotificationService notificationService;

    @Autowired
    public PostService(PostRepository postRepository, PostTypeRepository postTypeRepository, 
                      PostMediaRepository postMediaRepository, UserRepository userRepository,
                      LocationRepository locationRepository, NotificationService notificationService) {
        this.postRepository = postRepository;
        this.postTypeRepository = postTypeRepository;
        this.postMediaRepository = postMediaRepository;
        this.userRepository = userRepository;
        this.locationRepository = locationRepository;
        this.notificationService = notificationService;
    }

    public List<PostDTO> getAllPosts() {
        return postRepository.findAllByOrderByCreatedDateDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PostDTO getPostById(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        return convertToDTO(post);
    }

    public PostDTO createPost(CreatePostRequest request, Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        PostType postType = postTypeRepository.findById(request.getTypeId())
                .orElseThrow(() -> new RuntimeException("Post type not found"));

        // Location is required for travel posts
        if (request.getLocationId() == null) {
            throw new RuntimeException("Location is required for posts");
        }
        
        Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new RuntimeException("Location not found"));

        Post post = new Post();
        post.setContent(request.getContent());
        post.setUser(user);
        post.setType(postType);
        post.setLocation(location);
        post.setCreatedDate(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());

        Post savedPost = postRepository.save(post);

        // Save media if provided
        if (request.getMediaUrls() != null && !request.getMediaUrls().isEmpty()) {
            for (String mediaUrl : request.getMediaUrls()) {
                PostMedia media = new PostMedia();
                media.setPost(savedPost);
                media.setMediaUrl(mediaUrl);
                media.setMediaType(determineMediaType(mediaUrl));
                media.setUploadedAt(LocalDateTime.now());
                postMediaRepository.save(media);
            }
        }

        // Create notifications for friends when a new post is created
        try {
            notificationService.createFriendPostNotification(userId, savedPost.getId());
        } catch (Exception e) {
            // Log the error but don't fail the post creation
            System.err.println("Failed to create friend post notifications: " + e.getMessage());
        }

        return convertToDTO(savedPost);
    }

    public PostDTO updatePost(Long id, CreatePostRequest request) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        post.setContent(request.getContent());
        post.setUpdatedAt(LocalDateTime.now());
        
        Post updatedPost = postRepository.save(post);
        return convertToDTO(updatedPost);
    }

    public void deletePost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        postRepository.delete(post);
    }

    public List<PostDTO> getPostsByUserId(Integer userId) {
        return postRepository.findByUserIdOrderByCreatedDateDesc(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<PostDTO> getPostsByLocationId(Integer locationId) {
        return postRepository.findByLocationIdOrderByCreatedDateDesc(locationId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private PostDTO convertToDTO(Post post) {
        PostDTO dto = new PostDTO();
        dto.setId(post.getId());
        dto.setContent(post.getContent());
        dto.setCreatedDate(post.getCreatedDate());
        dto.setUpdatedAt(post.getUpdatedAt());
        
        // Convert author
        UserDTO authorDTO = new UserDTO();
        authorDTO.setId(post.getUser().getId());
        authorDTO.setUsername(post.getUser().getUsername());
        if (post.getUser().getUserData() != null) {
            authorDTO.setDisplayName(post.getUser().getUserData().getDisplayName());
            authorDTO.setBio(post.getUser().getUserData().getBio());
            authorDTO.setProfilePicture(post.getUser().getUserData().getProfilePicture());
        }
        dto.setAuthor(authorDTO);

        // Convert post type
        PostTypeDTO typeDTO = new PostTypeDTO();
        typeDTO.setId(post.getType().getId());
        typeDTO.setTypeName(post.getType().getTypeName());
        dto.setType(typeDTO);

        // Convert location if present
        if (post.getLocation() != null) {
            LocationDTO locationDTO = new LocationDTO();
            locationDTO.setId(post.getLocation().getId());
            locationDTO.setLocation(post.getLocation().getLocation());
            dto.setLocation(locationDTO);
        }

        // Convert media
        if (post.getMedia() != null) {
            List<PostMediaDTO> mediaList = post.getMedia().stream()
                    .map(this::convertMediaToDTO)
                    .collect(Collectors.toList());
            dto.setMedia(mediaList);
        }

        // Set counts
        dto.setCommentsCount(post.getComments() != null ? post.getComments().size() : 0);
        dto.setLikesCount(post.getReactions() != null ? 
                (int) post.getReactions().stream().filter(r -> "LIKE".equals(r.getReactionType().getName())).count() : 0);

        return dto;
    }

    private PostMediaDTO convertMediaToDTO(PostMedia media) {
        PostMediaDTO dto = new PostMediaDTO();
        dto.setId(media.getId());
        dto.setPostId(media.getPost().getId());
        dto.setMediaUrl(media.getMediaUrl());
        dto.setMediaType(media.getMediaType().toString());
        dto.setUploadedAt(media.getUploadedAt());
        return dto;
    }

    private com.example.server.model.Enum.MediaType determineMediaType(String url) {
        String lowerUrl = url.toLowerCase();
        if (lowerUrl.contains("video") || lowerUrl.endsWith(".mp4") || lowerUrl.endsWith(".avi")) {
            return com.example.server.model.Enum.MediaType.VIDEO;
        }
        return com.example.server.model.Enum.MediaType.IMAGE;
    }
}
