package com.example.server.service;

import com.example.server.dto.NotificationDTO;
import com.example.server.model.Entity.*;
import com.example.server.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.stream.Collectors;

@Service
public class NotificationService {    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final FriendRepository friendRepository;
    private final FollowService followService;

    public NotificationService(NotificationRepository notificationRepository, 
                              UserRepository userRepository, 
                              PostRepository postRepository,
                              CommentRepository commentRepository,
                              FriendRepository friendRepository,
                              FollowService followService) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.friendRepository = friendRepository;
        this.followService = followService;
    }// Get notifications for a user (recipient)
    public List<NotificationDTO> getNotificationsByUserId(Integer userId) {
        List<Notification> notifications = notificationRepository.findByRecipientUserId(userId);
        return notifications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get unread notifications for a user
    public List<NotificationDTO> getUnreadNotificationsByUserId(Integer userId) {
        List<Notification> notifications = notificationRepository.findUnreadByUserId(userId);
        return notifications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get count of unread notifications
    public long getUnreadNotificationCount(Integer userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }    // Create notification when a friend/followed user posts
    public NotificationDTO createFriendPostNotification(Integer postAuthorId, Long postId) {
        User postAuthor = userRepository.findById(postAuthorId)
                .orElseThrow(() -> new RuntimeException("Post author not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Use Set to avoid duplicate notifications
        Set<Integer> recipientIds = new HashSet<>();

        // Get all friends of the post author
        List<Friend> friendships = friendRepository.findAll().stream()
                .filter(friend -> friend.getUser1().getId().equals(postAuthorId) || 
                                 friend.getUser2().getId().equals(postAuthorId))
                .collect(Collectors.toList());

        // Add friends to recipients
        friendships.forEach(friendship -> {
            User friend = friendship.getUser1().getId().equals(postAuthorId) ? 
                         friendship.getUser2() : friendship.getUser1();
            recipientIds.add(friend.getId());
        });

        // Get all followers of the post author
        List<Integer> followerIds = followService.getFollowerIds(postAuthorId);
        recipientIds.addAll(followerIds);

        // Create notifications for each unique recipient (friends + followers)
        List<Notification> notifications = recipientIds.stream()
                .map(recipientId -> {
                    User recipient = userRepository.findById(recipientId)
                            .orElse(null);
                    if (recipient == null) return null;
                    
                    Notification notification = new Notification();
                    notification.setRecipientUser(recipient);
                    notification.setActorUser(postAuthor);
                    notification.setType("FRIEND_POST");
                    notification.setPost(post);
                    notification.setContent(postAuthor.getUsername() + " has posted something new");
                    notification.setReadStatus(false);
                    
                    return notificationRepository.save(notification);
                })
                .filter(notification -> notification != null)
                .collect(Collectors.toList());

        // Return the first notification as DTO (for API response)
        if (!notifications.isEmpty()) {
            return convertToDTO(notifications.get(0));
        }
        return null;
    }    // Create notification when someone comments on a user's post
    public NotificationDTO createCommentNotification(Integer commentAuthorId, Long postId, Long commentId) {
        User commentAuthor = userRepository.findById(commentAuthorId)
                .orElseThrow(() -> new RuntimeException("Comment author not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Don't notify if user comments on their own post
        if (post.getUser().getId().equals(commentAuthorId)) {
            return null;
        }

        // Check if users are friends OR if comment author follows the post author
        boolean areFriends = areFriends(commentAuthorId, post.getUser().getId());
        boolean isFollowing = followService.isFollowing(commentAuthorId, post.getUser().getId());
        
        if (!areFriends && !isFollowing) {
            return null;
        }

        Notification notification = new Notification();
        notification.setRecipientUser(post.getUser());
        notification.setActorUser(commentAuthor);
        notification.setType("COMMENT");
        notification.setPost(post);
        notification.setComment(comment);
        notification.setContent(commentAuthor.getUsername() + " commented on your post");
        notification.setReadStatus(false);

        Notification savedNotification = notificationRepository.save(notification);
        return convertToDTO(savedNotification);
    }    // Create notification when someone likes a user's post
    public NotificationDTO createLikeNotification(Integer likerId, Long postId) {
        User liker = userRepository.findById(likerId)
                .orElseThrow(() -> new RuntimeException("Liker not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Don't notify if user likes their own post
        if (post.getUser().getId().equals(likerId)) {
            return null;
        }

        // Check if users are friends OR if liker follows the post author
        boolean areFriends = areFriends(likerId, post.getUser().getId());
        boolean isFollowing = followService.isFollowing(likerId, post.getUser().getId());
        
        if (!areFriends && !isFollowing) {
            return null;
        }

        Notification notification = new Notification();
        notification.setRecipientUser(post.getUser());
        notification.setActorUser(liker);
        notification.setType("LIKE");
        notification.setPost(post);
        notification.setContent(liker.getUsername() + " liked your post");
        notification.setReadStatus(false);

        Notification savedNotification = notificationRepository.save(notification);
        return convertToDTO(savedNotification);
    }

    // Helper method to check if two users are friends
    private boolean areFriends(Integer userId1, Integer userId2) {
        return friendRepository.findAll().stream()
                .anyMatch(friend -> 
                    (friend.getUser1().getId().equals(userId1) && friend.getUser2().getId().equals(userId2)) ||
                    (friend.getUser1().getId().equals(userId2) && friend.getUser2().getId().equals(userId1))
                );
    }

    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        notification.setReadStatus(true);
        notificationRepository.save(notification);
    }    public void markAllAsRead(Integer userId) {
        List<Notification> notifications = notificationRepository.findByRecipientUserId(userId)
                .stream()
                .filter(n -> !n.getReadStatus())
                .collect(Collectors.toList());
        
        notifications.forEach(n -> n.setReadStatus(true));
        notificationRepository.saveAll(notifications);
    }

    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }    private NotificationDTO convertToDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setType(notification.getType());
        dto.setContent(notification.getContent());
        dto.setReadStatus(notification.getReadStatus());
        dto.setCreatedAt(notification.getCreatedAt());
        
        // Set recipient user info
        dto.setRecipientUserId(notification.getRecipientUser().getId());
        
        // Set actor user info
        dto.setActorUserId(notification.getActorUser().getId());
        dto.setActorUserName(notification.getActorUser().getUsername());
        if (notification.getActorUser().getUserData() != null) {
            dto.setActorDisplayName(notification.getActorUser().getUserData().getDisplayName());
            dto.setActorProfilePicture(notification.getActorUser().getUserData().getProfilePicture());
        }
        
        // Set post info if exists
        if (notification.getPost() != null) {
            dto.setPostId(notification.getPost().getId());
        }
        
        // Set comment info if exists
        if (notification.getComment() != null) {
            dto.setCommentId(notification.getComment().getId());
        }
        
        return dto;
    }
}
