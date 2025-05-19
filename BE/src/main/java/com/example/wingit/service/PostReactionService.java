package com.example.wingit.service;

import com.example.wingit.repository.PostReactionRepository;
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
