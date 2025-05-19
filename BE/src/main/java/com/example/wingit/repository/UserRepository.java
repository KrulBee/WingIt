package com.example.wingit.repository;

import com.example.wingit.model.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.Optional;
import com.example.wingit.model.Entity.Role;

public interface UserRepository extends JpaRepository<User, Integer> {
    boolean existsByUsername(String username);
    User findByUsername(String username);
    User findById(int id);
    Optional<Role> findRoleById(int id);
}
