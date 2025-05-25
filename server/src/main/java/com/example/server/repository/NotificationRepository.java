package com.example.server.repository;

import com.example.server.model.Entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Integer userId);
    List<Notification> findByUserIdAndReadStatusOrderByCreatedAtDesc(Integer userId, Boolean readStatus);
    
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.readStatus = false")
    List<Notification> findUnreadByUserId(@Param("userId") Integer userId);
}
