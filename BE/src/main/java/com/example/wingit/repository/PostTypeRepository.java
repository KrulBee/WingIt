package com.example.wingit.repository;

import com.example.wingit.model.Enum.PostType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostTypeRepository extends JpaRepository<PostType, Long> {
}
