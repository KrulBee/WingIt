package com.example.server.repository;

import com.example.server.model.Entity.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RequestStatusRepository extends JpaRepository<RequestStatus, Long> {
}
