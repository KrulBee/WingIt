package com.example.server.repository;

import com.example.server.model.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.time.ZonedDateTime;

import com.example.server.model.Entity.Role;

public interface UserRepository extends JpaRepository<User, Integer> {
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    User findByUsername(String username);
    User findByEmail(String email);
    User findByProviderAndProviderId(String provider, String providerId);
    User findById(int id);
    Optional<Role> findRoleById(int id);
    // Admin analytics methods
    @Query("SELECT COUNT(u) FROM User u WHERE u.userData.createdAt > :date")
    long countByCreatedDateAfter(@Param("date") ZonedDateTime date);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.userData.createdAt BETWEEN :startDate AND :endDate")
    long countByCreatedDateBetween(@Param("startDate") ZonedDateTime startDate, @Param("endDate") ZonedDateTime endDate);
    
    // Method for counting users created on a specific date (using ZonedDateTime)
    @Query("SELECT COUNT(u) FROM User u WHERE DATE(u.userData.createdAt) = DATE(:date)")
    long countByCreatedDateOnDate(@Param("date") ZonedDateTime date);
}
