package com.example.server.repository;

import java.util.List;
import com.example.server.model.Entity.Block;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BlockRepository extends JpaRepository<Block, Integer> {
    List<Block> findByUser_Id(Integer id);
    List<Block> findByBlockedUser_Id(Integer blockedUserId);

}