package com.example.server.controller;

import com.example.server.model.Entity.PostType;
import com.example.server.repository.PostTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/post-types")
public class PostTypeController {

    @Autowired
    private PostTypeRepository postTypeRepository;

    @GetMapping
    public ResponseEntity<List<PostType>> getAllPostTypes() {
        List<PostType> postTypes = postTypeRepository.findAll();
        return ResponseEntity.ok(postTypes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostType> getPostTypeById(@PathVariable Long id) {
        PostType postType = postTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PostType not found"));
        return ResponseEntity.ok(postType);
    }
}
