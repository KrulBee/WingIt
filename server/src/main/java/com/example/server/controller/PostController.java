package com.example.server.controller;

import com.example.server.service.PostService;
// import com.example.wingit.dto.PostDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;
// import java.util.List;

@RestController
@RequestMapping("/api/v1/posts")
public class PostController {

    private final PostService postService;

    @Autowired
    public PostController(PostService postService) {
        this.postService = postService;
    }

    // Define REST endpoints for Post operations here
    // Example:
    // @GetMapping
    // public ResponseEntity<List<PostDTO>> getAllPosts() {
    //     // return ResponseEntity.ok(postService.getAllPosts());
    //     return null; // Placeholder
    // }
}
