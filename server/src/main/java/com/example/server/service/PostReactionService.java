package com.example.server.service;

import com.example.server.repository.PostReactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PostReactionService {

    private final PostReactionRepository postReactionRepository;

    @Autowired
    public PostReactionService(PostReactionRepository postReactionRepository) {
        this.postReactionRepository = postReactionRepository;
    }

    // Add service methods related to PostReaction entity here
}
