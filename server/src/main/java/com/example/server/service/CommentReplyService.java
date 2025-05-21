package com.example.server.service;

import com.example.server.repository.CommentReplyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CommentReplyService {

    private final CommentReplyRepository commentReplyRepository;

    @Autowired
    public CommentReplyService(CommentReplyRepository commentReplyRepository) {
        this.commentReplyRepository = commentReplyRepository;
    }

    // Add service methods related to CommentReply entity here
}
