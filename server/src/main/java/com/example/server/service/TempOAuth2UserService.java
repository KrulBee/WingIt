// filepath: c:\Study\2024-2025\DATN\Project\WingIt\server\src\main\java\com\example\server\service\TempOAuth2UserService.java
package com.example.server.service;

import com.example.server.model.DTO.TempOAuth2User;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.UUID;

/**
 * Service to temporarily store OAuth2 user data during account setup process
 * Uses in-memory storage with automatic cleanup after 1 hour
 */
@Service
public class TempOAuth2UserService {
    
    private static final Logger logger = LoggerFactory.getLogger(TempOAuth2UserService.class);
    private static final long CLEANUP_INTERVAL_HOURS = 1;
    
    private final Map<String, TempOAuth2UserEntry> tempUsers = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    
    public TempOAuth2UserService() {
        // Schedule cleanup task to run every hour
        scheduler.scheduleAtFixedRate(this::cleanupExpiredEntries, 
            CLEANUP_INTERVAL_HOURS, CLEANUP_INTERVAL_HOURS, TimeUnit.HOURS);
    }
    
    /**
     * Store temporary OAuth2 user data and return a setup token
     */
    public String storeTempUser(TempOAuth2User tempUser) {
        String setupToken = UUID.randomUUID().toString();
        long expiryTime = System.currentTimeMillis() + TimeUnit.HOURS.toMillis(1);
        
        tempUsers.put(setupToken, new TempOAuth2UserEntry(tempUser, expiryTime));
        
        logger.info("Stored temporary OAuth2 user data for setup token: {}", setupToken);
        return setupToken;
    }
    
    /**
     * Retrieve temporary OAuth2 user data by setup token
     */
    public TempOAuth2User getTempUser(String setupToken) {
        TempOAuth2UserEntry entry = tempUsers.get(setupToken);
        
        if (entry == null) {
            logger.warn("Setup token not found: {}", setupToken);
            return null;
        }
        
        if (entry.isExpired()) {
            tempUsers.remove(setupToken);
            logger.warn("Setup token expired: {}", setupToken);
            return null;
        }
        
        return entry.getTempUser();
    }
    
    /**
     * Remove temporary OAuth2 user data after successful account creation
     */
    public void removeTempUser(String setupToken) {
        TempOAuth2UserEntry removed = tempUsers.remove(setupToken);
        if (removed != null) {
            logger.info("Removed temporary OAuth2 user data for setup token: {}", setupToken);
        }
    }
      /**
     * Clean up expired entries
     */
    private void cleanupExpiredEntries() {
        long currentTime = System.currentTimeMillis();
        final int[] removedCount = {0}; // Use array to make it effectively final
        
        tempUsers.entrySet().removeIf(entry -> {
            if (entry.getValue().isExpired()) {
                removedCount[0]++;
                return true;
            }
            return false;
        });
        
        if (removedCount[0] > 0) {
            logger.info("Cleaned up {} expired temporary OAuth2 user entries", removedCount[0]);
        }
    }
    
    /**
     * Inner class to hold temporary user data with expiry time
     */
    private static class TempOAuth2UserEntry {
        private final TempOAuth2User tempUser;
        private final long expiryTime;
        
        public TempOAuth2UserEntry(TempOAuth2User tempUser, long expiryTime) {
            this.tempUser = tempUser;
            this.expiryTime = expiryTime;
        }
        
        public TempOAuth2User getTempUser() {
            return tempUser;
        }
        
        public boolean isExpired() {
            return System.currentTimeMillis() > expiryTime;
        }
    }
}
