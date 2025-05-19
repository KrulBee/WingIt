package com.example.wingit.repository;

import com.example.wingit.model.Entity.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RequestStatusRepository extends JpaRepository<RequestStatus, Long> {
}
