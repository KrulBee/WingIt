package com.example.server.repository;

import com.example.server.model.Entity.Friend;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendRepository extends JpaRepository<Friend, Integer> {
    Friend findByUser1IdOrUser2Id(int user1Id, int user2Id);
    
    // Optimized query to get friends by user ID with JOIN FETCH
    @Query("SELECT DISTINCT f FROM Friend f " +
           "LEFT JOIN FETCH f.user1 u1 " +
           "LEFT JOIN FETCH u1.userData " +
           "LEFT JOIN FETCH u1.role " +
           "LEFT JOIN FETCH f.user2 u2 " +
           "LEFT JOIN FETCH u2.userData " +
           "LEFT JOIN FETCH u2.role " +
           "WHERE f.user1.id = :userId OR f.user2.id = :userId")
    List<Friend> findByUserIdWithDetails(@Param("userId") Integer userId);
    
    // Check if friendship exists between two users
    @Query("SELECT COUNT(f) > 0 FROM Friend f WHERE " +
           "(f.user1.id = :userId1 AND f.user2.id = :userId2) OR " +
           "(f.user1.id = :userId2 AND f.user2.id = :userId1)")
    boolean existsBetweenUsers(@Param("userId1") Integer userId1, @Param("userId2") Integer userId2);
    
    // Get friend IDs for a user (for suggestions algorithm)
    @Query("SELECT CASE WHEN f.user1.id = :userId THEN f.user2.id ELSE f.user1.id END " +
           "FROM Friend f WHERE f.user1.id = :userId OR f.user2.id = :userId")
    List<Integer> findFriendIdsByUserId(@Param("userId") Integer userId);
    
    // Find specific friendship between two users
    @Query("SELECT f FROM Friend f WHERE " +
           "(f.user1.id = :userId1 AND f.user2.id = :userId2) OR " +
           "(f.user1.id = :userId2 AND f.user2.id = :userId1)")
    Optional<Friend> findFriendshipBetweenUsers(@Param("userId1") Integer userId1, @Param("userId2") Integer userId2);
}