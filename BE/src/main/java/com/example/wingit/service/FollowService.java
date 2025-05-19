package com.example.wingit.service;

import com.example.wingit.model.Entity.Follow;
import com.example.wingit.repository.FollowRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FollowService {

    private final FollowRepository followRepository;

    @Autowired
    public FollowService(FollowRepository followRepository) {
        this.followRepository = followRepository;
    }

    // Add service methods related to Follow entity here
}
