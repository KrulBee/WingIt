package com.example.server.service;

import com.example.server.dto.NotificationDTO;
import com.example.server.model.Entity.Notification;
import com.example.server.model.Entity.User;
import com.example.server.model.Entity.Post;
import com.example.server.repository.NotificationRepository;
import com.example.server.repository.UserRepository;
import com.example.server.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    @Autowired
    public NotificationService(NotificationRepository notificationRepository, 
                              UserRepository userRepository, 
                              PostRepository postRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.postRepository = postRepository;
    }

    public List<NotificationDTO> getNotificationsByUserId(Integer userId) {
        // Note: This would require adding a findByUserId method to NotificationRepository
        List<Notification> notifications = notificationRepository.findAll()
                .stream()
                .filter(n -> n.getUser().getId().equals(userId))
                .collect(Collectors.toList());
        
        return notifications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<NotificationDTO> getUnreadNotificationsByUserId(Integer userId) {
        List<Notification> notifications = notificationRepository.findAll()
                .stream()
                .filter(n -> n.getUser().getId().equals(userId) && !n.getReadStatus())
                .collect(Collectors.toList());
        
        return notifications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public NotificationDTO createNotification(Integer userId, Long postId, String type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setPost(post);
        notification.setReadStatus(false);
        notification.setCreatedAt(LocalDateTime.now());

        Notification savedNotification = notificationRepository.save(notification);
        return convertToDTO(savedNotification);
    }

    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        notification.setReadStatus(true);
        notificationRepository.save(notification);
    }

    public void markAllAsRead(Integer userId) {
        List<Notification> notifications = notificationRepository.findAll()
                .stream()
                .filter(n -> n.getUser().getId().equals(userId) && !n.getReadStatus())
                .collect(Collectors.toList());
        
        notifications.forEach(n -> n.setReadStatus(true));
        notificationRepository.saveAll(notifications);
    }

    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    private NotificationDTO convertToDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setUserId(notification.getUser().getId());
        dto.setPostId(notification.getPost().getId());
        dto.setReadStatus(notification.getReadStatus());
        dto.setCreatedAt(notification.getCreatedAt());
        
        // Set user info
        dto.setUserName(notification.getUser().getUsername());
        if (notification.getUser().getUserData() != null) {
            dto.setUserDisplayName(notification.getUser().getUserData().getDisplayName());
            dto.setUserProfilePicture(notification.getUser().getUserData().getProfilePicture());
        }
        
        return dto;
    }
}
