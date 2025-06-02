package com.example.server.repository;

import com.example.server.model.Entity.EmailChangeToken;
import com.example.server.model.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface EmailChangeTokenRepository extends JpaRepository<EmailChangeToken, Long> {
    
    Optional<EmailChangeToken> findByTokenAndUsedFalse(String token);
    
    void deleteByUser(User user);
    
    void deleteByExpiryDateBefore(LocalDateTime dateTime);
    
    boolean existsByNewEmailAndUsedFalse(String newEmail);
}
