package com.example.wingit.repository;

import com.example.wingit.model.Entity.UserData;
import org.springframework.data.jpa.repository.JpaRepository;
public interface UserDataRepository extends JpaRepository<UserData, Integer>{
}
