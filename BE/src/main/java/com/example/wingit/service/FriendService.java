package com.example.wingit.service;

import com.example.wingit.model.Entity.Friend;
import com.example.wingit.repository.FriendRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FriendService {

    private final FriendRepository friendRepository;

    @Autowired
    public FriendService(FriendRepository friendRepository) {
        this.friendRepository = friendRepository;
    }

    // Add service methods related to Friend entity here
}
