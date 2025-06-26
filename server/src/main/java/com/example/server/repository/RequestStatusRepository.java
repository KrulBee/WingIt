package com.example.server.repository;

import com.example.server.model.Entity.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RequestStatusRepository extends JpaRepository<RequestStatus, Long> {
    
    // Find status by name (avoid loading all statuses)
    @Query("SELECT rs FROM RequestStatus rs WHERE rs.statusName = :statusName")
    Optional<RequestStatus> findByStatusName(@Param("statusName") String statusName);
}
