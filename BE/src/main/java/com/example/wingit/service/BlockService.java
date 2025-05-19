package com.example.wingit.service;

import com.example.wingit.model.Entity.Block;
import com.example.wingit.repository.BlockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BlockService {

    private final BlockRepository blockRepository;

    @Autowired
    public BlockService(BlockRepository blockRepository) {
        this.blockRepository = blockRepository;
    }

    // Add service methods related to Block entity here
}
