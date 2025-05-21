package com.example.server.controller;

import com.example.server.model.Entity.RequestStatus;
import com.example.server.repository.RequestStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/request-statuses")
public class RequestStatusController {

    @Autowired
    private RequestStatusRepository requestStatusRepository;

    @GetMapping
    public ResponseEntity<List<RequestStatus>> getAllRequestStatuses() {
        List<RequestStatus> statuses = requestStatusRepository.findAll();
        return ResponseEntity.ok(statuses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RequestStatus> getRequestStatusById(@PathVariable Long id) {
        RequestStatus status = requestStatusRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("RequestStatus not found"));
        return ResponseEntity.ok(status);
    }
}
