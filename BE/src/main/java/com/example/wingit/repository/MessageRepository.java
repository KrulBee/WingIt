package com.example.wingit.repository;

import com.example.wingit.model.Entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    // Add custom query methods here if needed
}