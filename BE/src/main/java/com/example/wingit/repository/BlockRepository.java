package com.example.wingit.repository;

import java.util.List;
import com.example.wingit.model.Entity.Block;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlockRepository extends JpaRepository<Block, Integer> {
    List<Block> findByBlocker_Id(Integer blockerId);
    List<Block> findByBlockedUser_Id(Integer blockedUserId);

}