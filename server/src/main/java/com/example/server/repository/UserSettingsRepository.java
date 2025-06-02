package com.example.server.repository;

import com.example.server.model.Entity.UserSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserSettingsRepository extends JpaRepository<UserSettings, Integer> {
    
    /**
     * Find user settings by user ID
     * @param userId the user ID
     * @return Optional containing user settings if found
     */
    Optional<UserSettings> findByUserId(Integer userId);
    
    /**
     * Check if user settings exist for a given user ID
     * @param userId the user ID
     * @return true if settings exist, false otherwise
     */
    boolean existsByUserId(Integer userId);
    
    /**
     * Delete user settings by user ID
     * @param userId the user ID
     */
    void deleteByUserId(Integer userId);
}
