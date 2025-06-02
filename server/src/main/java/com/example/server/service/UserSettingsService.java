package com.example.server.service;

import com.example.server.model.Entity.User;
import com.example.server.model.Entity.UserSettings;
import com.example.server.model.DTO.UserSettingsDTO;
import com.example.server.repository.UserRepository;
import com.example.server.repository.UserSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class UserSettingsService {
    
    @Autowired
    private UserSettingsRepository userSettingsRepository;
    
    @Autowired
    private UserRepository userRepository;
      /**
     * Get user settings by user ID. Creates default settings if none exist.
     * @param userId the user ID
     * @return UserSettingsDTO with current settings
     * @throws RuntimeException if user not found
     */
    public UserSettingsDTO getUserSettings(Integer userId) {
        Optional<UserSettings> userSettingsOpt = userSettingsRepository.findByUserId(userId);
        
        if (userSettingsOpt.isPresent()) {
            return convertToDTO(userSettingsOpt.get());
        } else {
            // Create default settings if none exist
            return createDefaultSettings(userId);
        }
    }
    
    /**
     * Update user settings
     * @param userSettingsDTO the settings to update
     * @return updated UserSettingsDTO
     * @throws RuntimeException if user not found or validation fails
     */
    public UserSettingsDTO updateUserSettings(UserSettingsDTO userSettingsDTO) {
        // Validate user exists
        User user = userRepository.findById(userSettingsDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userSettingsDTO.getUserId()));
        
        // Find existing settings or create new
        Optional<UserSettings> existingSettingsOpt = userSettingsRepository.findByUserId(userSettingsDTO.getUserId());
        UserSettings userSettings;
        
        if (existingSettingsOpt.isPresent()) {
            userSettings = existingSettingsOpt.get();
            updateSettingsFromDTO(userSettings, userSettingsDTO);
        } else {
            userSettings = createSettingsFromDTO(user, userSettingsDTO);
        }
          // Validate settings before saving
        userSettings.validatePrivacyLevel();
        
        UserSettings savedSettings = userSettingsRepository.save(userSettings);
        return convertToDTO(savedSettings);
    }
      /**
     * Delete user settings
     * @param userId the user ID
     */
    public void deleteUserSettings(Integer userId) {
        userSettingsRepository.deleteByUserId(userId);
    }
    
    /**
     * Reset user settings to default values
     * @param userId the user ID
     * @return UserSettingsDTO with default settings
     */
    public UserSettingsDTO resetToDefaults(Integer userId) {
        // Delete existing settings
        userSettingsRepository.deleteByUserId(userId);
        
        // Create new default settings
        return createDefaultSettings(userId);
    }    /**
     * Create default settings for a user
     * @param userId the user ID
     * @return UserSettingsDTO with default settings
     */
    public UserSettingsDTO createDefaultSettings(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        UserSettings defaultSettings = new UserSettings();
        defaultSettings.setUser(user);
        defaultSettings.setPrivacyLevel("friends");
        defaultSettings.setShowOnlineStatus(true);
        defaultSettings.setAllowSearchEngines(false);
        
        UserSettings savedSettings = userSettingsRepository.save(defaultSettings);
        return convertToDTO(savedSettings);
    }
      /**
     * Convert UserSettings entity to DTO
     * @param userSettings the entity
     * @return UserSettingsDTO
     */
    private UserSettingsDTO convertToDTO(UserSettings userSettings) {
        return new UserSettingsDTO(
                userSettings.getUser().getId(),
                userSettings.getPrivacyLevel(),
                userSettings.getShowOnlineStatus(),
                userSettings.getAllowSearchEngines()
        );
    }
      /**
     * Update existing UserSettings entity from DTO
     * @param userSettings the entity to update
     * @param dto the DTO with new values
     */
    private void updateSettingsFromDTO(UserSettings userSettings, UserSettingsDTO dto) {
        if (dto.getPrivacyLevel() != null) {
            userSettings.setPrivacyLevel(dto.getPrivacyLevel());
        }
        if (dto.getShowOnlineStatus() != null) {
            userSettings.setShowOnlineStatus(dto.getShowOnlineStatus());
        }
        if (dto.getAllowSearchEngines() != null) {
            userSettings.setAllowSearchEngines(dto.getAllowSearchEngines());
        }
    }
      /**
     * Create new UserSettings entity from DTO
     * @param user the user entity
     * @param dto the DTO with values
     * @return new UserSettings entity
     */
    private UserSettings createSettingsFromDTO(User user, UserSettingsDTO dto) {
        UserSettings userSettings = new UserSettings();
        userSettings.setUser(user);
        userSettings.setPrivacyLevel(dto.getPrivacyLevel() != null ? dto.getPrivacyLevel() : "friends");
        userSettings.setShowOnlineStatus(dto.getShowOnlineStatus() != null ? dto.getShowOnlineStatus() : true);
        userSettings.setAllowSearchEngines(dto.getAllowSearchEngines() != null ? dto.getAllowSearchEngines() : false);
        return userSettings;
    }
}
