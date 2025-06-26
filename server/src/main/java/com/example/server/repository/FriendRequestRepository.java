package com.example.server.repository;

import com.example.server.model.Entity.FriendRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {
    
    // Find sent friend requests by sender ID
    @Query("SELECT DISTINCT fr FROM FriendRequest fr " +
           "LEFT JOIN FETCH fr.sender s " +
           "LEFT JOIN FETCH s.userData " +
           "LEFT JOIN FETCH fr.receiver r " +
           "LEFT JOIN FETCH r.userData " +
           "LEFT JOIN FETCH fr.status " +
           "WHERE fr.sender.id = :userId")
    List<FriendRequest> findBySenderIdWithDetails(@Param("userId") Integer userId);
    
    // Find received friend requests by receiver ID
    @Query("SELECT DISTINCT fr FROM FriendRequest fr " +
           "LEFT JOIN FETCH fr.sender s " +
           "LEFT JOIN FETCH s.userData " +
           "LEFT JOIN FETCH fr.receiver r " +
           "LEFT JOIN FETCH r.userData " +
           "LEFT JOIN FETCH fr.status " +
           "WHERE fr.receiver.id = :userId")
    List<FriendRequest> findByReceiverIdWithDetails(@Param("userId") Integer userId);
    
    // Check if pending friend request exists between users
    @Query("SELECT COUNT(fr) > 0 FROM FriendRequest fr " +
           "WHERE fr.sender.id = :senderId AND fr.receiver.id = :receiverId " +
           "AND fr.status.statusName = 'PENDING'")
    boolean existsPendingRequest(@Param("senderId") Integer senderId, @Param("receiverId") Integer receiverId);
    
    // Get pending request user IDs for a specific user (for suggestions)
    @Query("SELECT CASE WHEN fr.sender.id = :userId THEN fr.receiver.id ELSE fr.sender.id END " +
           "FROM FriendRequest fr " +
           "WHERE (fr.sender.id = :userId OR fr.receiver.id = :userId) " +
           "AND fr.status.statusName = 'PENDING'")
    List<Integer> findPendingRequestUserIds(@Param("userId") Integer userId);
}