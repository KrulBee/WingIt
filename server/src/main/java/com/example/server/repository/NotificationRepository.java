package com.example.server.repository;

import com.example.server.model.Entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientUserIdOrderByCreatedAtDesc(Integer recipientUserId);
    List<Notification> findByRecipientUserIdAndReadStatusOrderByCreatedAtDesc(Integer recipientUserId, Boolean readStatus);
    
    @Query("SELECT n FROM Notification n WHERE n.recipientUser.id = :userId AND n.readStatus = false ORDER BY n.createdAt DESC")
    List<Notification> findUnreadByUserId(@Param("userId") Integer userId);
    
    @Query("SELECT n FROM Notification n WHERE n.recipientUser.id = :userId ORDER BY n.createdAt DESC")
    List<Notification> findByRecipientUserId(@Param("userId") Integer userId);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipientUser.id = :userId AND n.readStatus = false")
    Long countUnreadByUserId(@Param("userId") Integer userId);
}
