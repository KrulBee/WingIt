package com.example.server.service;

import com.example.server.dto.*;
import com.example.server.exception.ProfanityException;
import com.example.server.model.Entity.*;
import com.example.server.repository.*;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
import java.time.ZonedDateTime;
import java.time.ZoneOffset;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final PostTypeRepository postTypeRepository;
    private final PostMediaRepository postMediaRepository;
    private final UserRepository userRepository;
    private final LocationRepository locationRepository;
    private final NotificationService notificationService;
    private final ProfanityDetectionService profanityDetectionService;
    
    // Additional repositories for cascade deletion
    private final NotificationRepository notificationRepository;
    private final BookmarkRepository bookmarkRepository;
    private final PostReactionRepository postReactionRepository;
    private final PostViewRepository postViewRepository;
    private final ReportRepository reportRepository;
    private final CommentRepository commentRepository;
    private final CommentReactionRepository commentReactionRepository;    public PostService(PostRepository postRepository, PostTypeRepository postTypeRepository, 
                      PostMediaRepository postMediaRepository, UserRepository userRepository,
                      LocationRepository locationRepository, NotificationService notificationService,
                      ProfanityDetectionService profanityDetectionService,
                      NotificationRepository notificationRepository, BookmarkRepository bookmarkRepository,
                      PostReactionRepository postReactionRepository, PostViewRepository postViewRepository,
                      ReportRepository reportRepository, CommentRepository commentRepository,
                      CommentReactionRepository commentReactionRepository) {
        this.postRepository = postRepository;
        this.postTypeRepository = postTypeRepository;
        this.postMediaRepository = postMediaRepository;
        this.userRepository = userRepository;
        this.locationRepository = locationRepository;
        this.notificationService = notificationService;
        this.profanityDetectionService = profanityDetectionService;
        
        // Initialize cascade deletion repositories
        this.notificationRepository = notificationRepository;
        this.bookmarkRepository = bookmarkRepository;
        this.postReactionRepository = postReactionRepository;
        this.postViewRepository = postViewRepository;
        this.reportRepository = reportRepository;
        this.commentRepository = commentRepository;
        this.commentReactionRepository = commentReactionRepository;
    }

    public List<PostDTO> getAllPosts() {
        return postRepository.findAllWithDetailsOrderByCreatedDateDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PostDTO getPostById(Long id) {
        Post post = postRepository.findByIdWithDetails(id)
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
                .orElseThrow(() -> new RuntimeException("Location not found"));        // Check for profanity in post content
        try {
            ProfanityDetectionService.ProfanityResult profanityResult = 
                profanityDetectionService.checkProfanity(request.getContent());
            
            if (profanityResult.isProfane()) {
                // Create a profanity-specific exception that can be caught by the controller
                ProfanityException profanityException = new ProfanityException(
                    "Nội dung chứa từ ngữ không phù hợp. Vui lòng chỉnh sửa và thử lại.",
                    profanityResult
                );
                throw profanityException;
            }} catch (RuntimeException e) {
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

        Post post = new Post();
        post.setContent(request.getContent());
        post.setUser(user);
        post.setType(postType);
        post.setLocation(location);
        post.setCreatedDate(ZonedDateTime.now(ZoneOffset.UTC));
        post.setUpdatedAt(ZonedDateTime.now(ZoneOffset.UTC));

        Post savedPost = postRepository.save(post);

        // Save media if provided
        if (request.getMediaUrls() != null && !request.getMediaUrls().isEmpty()) {
            for (String mediaUrl : request.getMediaUrls()) {
                PostMedia media = new PostMedia();
                media.setPost(savedPost);
                media.setMediaUrl(mediaUrl);
                media.setMediaType(determineMediaType(mediaUrl));
                media.setUploadedAt(ZonedDateTime.now(ZoneOffset.UTC));
                postMediaRepository.save(media);
            }
        }        // Create async notifications for friends when a new post is created
        // This is crucial for social media performance - don't block post creation
        try {
            notificationService.createFriendPostNotificationAsync(userId, savedPost.getId());
        } catch (Exception e) {
            // Log the error but don't fail the post creation
            System.err.println("Failed to create async friend post notifications: " + e.getMessage());
        }

        return convertToDTO(savedPost);
    }    public PostDTO updatePost(Long id, CreatePostRequest request, Integer userId) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Check if user owns the post
        if (!post.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only edit your own posts");
        }

        // Check for profanity in updated content
        ProfanityDetectionService.ProfanityResult profanityResult =
            profanityDetectionService.checkProfanity(request.getContent());

        if (profanityResult.isProfane()) {
            throw new RuntimeException("Nội dung chứa từ ngữ không phù hợp. Vui lòng chỉnh sửa và thử lại.");
        }

        post.setContent(request.getContent());
        post.setUpdatedAt(ZonedDateTime.now(ZoneOffset.UTC));

        Post updatedPost = postRepository.save(post);
        return convertToDTO(updatedPost);
    }

    // Keep the old method for backward compatibility (admin use)
    public PostDTO updatePost(Long id, CreatePostRequest request) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Check for profanity in updated content
        ProfanityDetectionService.ProfanityResult profanityResult =
            profanityDetectionService.checkProfanity(request.getContent());

        if (profanityResult.isProfane()) {
            throw new RuntimeException("Nội dung chứa từ ngữ không phù hợp. Vui lòng chỉnh sửa và thử lại.");
        }

        post.setContent(request.getContent());
        post.setUpdatedAt(ZonedDateTime.now(ZoneOffset.UTC));

        Post updatedPost = postRepository.save(post);
        return convertToDTO(updatedPost);
    }    public void deletePost(Long id, Integer userId) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Check if user owns the post
        if (!post.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only delete your own posts");
        }

        // Perform cascade deletion
        deletePostWithCascade(id);
    }    // Keep the old method for backward compatibility (admin use)
    public void deletePost(Long id) {
        // Verify post exists
        postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        // Perform cascade deletion
        deletePostWithCascade(id);
    }
    
    /**
     * Helper method to delete a post and all its related entities
     */
    private void deletePostWithCascade(Long postId) {
        try {
            // 1. Delete all comment reactions for comments on this post
            List<Comment> comments = commentRepository.findByPostId(postId);
            for (Comment comment : comments) {
                commentReactionRepository.deleteByCommentId(comment.getId());
            }
            
            // 2. Delete all comments on this post
            commentRepository.deleteByPostId(postId);
            
            // 3. Delete all post reactions
            postReactionRepository.deleteByPostId(postId);
            
            // 4. Delete all post views
            postViewRepository.deleteByPostId(postId);
            
            // 5. Delete all bookmarks for this post
            List<Bookmark> bookmarks = bookmarkRepository.findByPostId(postId);
            if (!bookmarks.isEmpty()) {
                bookmarkRepository.deleteAll(bookmarks);
            }
            
            // 6. Delete all notifications related to this post
            List<Notification> notifications = notificationRepository.findByPostId(postId);
            if (!notifications.isEmpty()) {
                notificationRepository.deleteAll(notifications);
            }
            
            // 7. Delete all reports for this post
            reportRepository.deleteByPostId(postId);
            
            // 8. Delete all post media
            postMediaRepository.deleteByPostId(postId);
            
            // 9. Finally, delete the post itself
            postRepository.deleteById(postId);
            
            System.out.println("Successfully deleted post " + postId + " with all related data");
            
        } catch (Exception e) {
            System.err.println("Error during cascade deletion of post " + postId + ": " + e.getMessage());
            throw new RuntimeException("Failed to delete post and related data", e);
        }
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
