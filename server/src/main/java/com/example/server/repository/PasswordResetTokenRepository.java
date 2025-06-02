package com.example.server.repository;

import com.example.server.model.Entity.PasswordResetToken;
import com.example.server.model.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    
    Optional<PasswordResetToken> findByToken(String token);
    
    Optional<PasswordResetToken> findByTokenAndUsedFalse(String token);
    
    List<PasswordResetToken> findByUser(User user);
    
    void deleteByUser(User user);
    
    void deleteByExpiryDateBefore(LocalDateTime now);
    
    boolean existsByTokenAndUsedFalse(String token);
}
