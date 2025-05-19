package com.example.wingit.controller;

import com.example.wingit.service.PostMediaService;
// import com.example.wingit.dto.PostMediaDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;
// import java.util.List;

@RestController
@RequestMapping("/api/v1/post-media")
public class PostMediaController {

    private final PostMediaService postMediaService;

    @Autowired
    public PostMediaController(PostMediaService postMediaService) {
        this.postMediaService = postMediaService;
    }

    // Define REST endpoints for PostMedia operations here
}
