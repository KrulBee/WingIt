package com.example.server.service;

import com.example.server.repository.PostMediaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PostMediaService {

    private final PostMediaRepository postMediaRepository;

    @Autowired
    public PostMediaService(PostMediaRepository postMediaRepository) {
        this.postMediaRepository = postMediaRepository;
    }

    // Add service methods related to PostMedia entity here
}
