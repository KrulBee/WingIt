package com.example.wingit.service;

import com.example.wingit.model.Entity.CommentReply;
import com.example.wingit.repository.CommentReplyRepository;
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
