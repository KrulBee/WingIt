package com.example.server.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class HealthController {

    @Autowired
    private DataSource dataSource;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = new HashMap<>();
        
        try {
            // Check database connection
            try (Connection connection = dataSource.getConnection()) {
                boolean dbHealthy = connection.isValid(5); // 5 second timeout
                health.put("database", dbHealthy ? "UP" : "DOWN");
            }
            
            // Basic application health
            health.put("status", "UP");
            health.put("application", "WingIt Backend");
            health.put("version", "1.0.0");
            health.put("timestamp", System.currentTimeMillis());
            
            // Memory info for debugging
            Runtime runtime = Runtime.getRuntime();
            long maxMemory = runtime.maxMemory();
            long totalMemory = runtime.totalMemory();
            long freeMemory = runtime.freeMemory();
            long usedMemory = totalMemory - freeMemory;
            
            Map<String, Object> memory = new HashMap<>();
            memory.put("max", maxMemory / 1024 / 1024 + " MB");
            memory.put("total", totalMemory / 1024 / 1024 + " MB");
            memory.put("used", usedMemory / 1024 / 1024 + " MB");
            memory.put("free", freeMemory / 1024 / 1024 + " MB");
            health.put("memory", memory);
            
            return ResponseEntity.ok(health);
            
        } catch (Exception e) {
            health.put("status", "DOWN");
            health.put("error", e.getMessage());
            health.put("database", "DOWN");
            return ResponseEntity.status(503).body(health);
        }
    }

    @GetMapping("/ready")
    public ResponseEntity<Map<String, Object>> ready() {
        Map<String, Object> readiness = new HashMap<>();
        
        try {
            // Check if application is ready to serve requests
            try (Connection connection = dataSource.getConnection()) {
                boolean dbReady = connection.isValid(2);
                if (dbReady) {
                    readiness.put("status", "READY");
                    readiness.put("database", "READY");
                    return ResponseEntity.ok(readiness);
                } else {
                    readiness.put("status", "NOT_READY");
                    readiness.put("database", "NOT_READY");
                    return ResponseEntity.status(503).body(readiness);
                }
            }
        } catch (Exception e) {
            readiness.put("status", "NOT_READY");
            readiness.put("error", e.getMessage());
            return ResponseEntity.status(503).body(readiness);
        }
    }
}
