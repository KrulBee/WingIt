package com.example.wingit.controller;

import com.example.wingit.model.Entity.ReactionType;
import com.example.wingit.repository.ReactionTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reaction-types")
public class ReactionTypeController {

    @Autowired
    private ReactionTypeRepository reactionTypeRepository;

    @GetMapping
    public ResponseEntity<List<ReactionType>> getAllReactionTypes() {
        List<ReactionType> reactionTypes = reactionTypeRepository.findAll();
        return ResponseEntity.ok(reactionTypes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReactionType> getReactionTypeById(@PathVariable Long id) {
        ReactionType reactionType = reactionTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reaction type not found"));
        return ResponseEntity.ok(reactionType);
    }
}
