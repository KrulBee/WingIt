package com.example.server.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.core.task.TaskExecutor;

/**
 * Async configuration for social media operations
 * Handles concurrent user requests, notifications, and background tasks
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    /**
     * Main task executor for general async operations
     * Handles user interactions, posts, comments, etc.
     */
    @Bean(name = "taskExecutor")
    public TaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);  // Always keep 5 threads alive
        executor.setMaxPoolSize(20);  // Max 20 threads during peak load
        executor.setQueueCapacity(200); // Queue up to 200 tasks
        executor.setThreadNamePrefix("WingIt-Main-");
        executor.setKeepAliveSeconds(60);
        executor.setRejectedExecutionHandler(new java.util.concurrent.ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }

    /**
     * Notification-specific executor
     * Dedicated thread pool for real-time notifications
     */
    @Bean(name = "notificationExecutor")
    public TaskExecutor notificationExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(3);  // Core threads for notifications
        executor.setMaxPoolSize(10);  // Max threads for notification bursts
        executor.setQueueCapacity(500); // Large queue for notifications
        executor.setThreadNamePrefix("WingIt-Notification-");
        executor.setKeepAliveSeconds(30);
        executor.setRejectedExecutionHandler(new java.util.concurrent.ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }

    /**
     * Email executor for background email sending
     * Separate pool to avoid blocking other operations
     */
    @Bean(name = "emailExecutor")
    public TaskExecutor emailExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);  // Limited core threads for email
        executor.setMaxPoolSize(5);   // Max threads for email sending
        executor.setQueueCapacity(100); // Queue email tasks
        executor.setThreadNamePrefix("WingIt-Email-");
        executor.setKeepAliveSeconds(120);
        executor.setRejectedExecutionHandler(new java.util.concurrent.ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }

    /**
     * Media processing executor for image/video uploads
     * High-capacity pool for media operations
     */
    @Bean(name = "mediaExecutor")
    public TaskExecutor mediaExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(3);  // Core threads for media processing
        executor.setMaxPoolSize(8);   // Max threads for concurrent uploads
        executor.setQueueCapacity(50); // Queue media processing tasks
        executor.setThreadNamePrefix("WingIt-Media-");
        executor.setKeepAliveSeconds(90);
        executor.setRejectedExecutionHandler(new java.util.concurrent.ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }

    /**
     * Analytics executor for background analytics processing
     * Low priority, background processing
     */
    @Bean(name = "analyticsExecutor")
    public TaskExecutor analyticsExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(1);  // Single core thread
        executor.setMaxPoolSize(3);   // Limited max threads
        executor.setQueueCapacity(1000); // Large queue for analytics
        executor.setThreadNamePrefix("WingIt-Analytics-");
        executor.setKeepAliveSeconds(300); // Keep threads alive longer
        executor.setRejectedExecutionHandler(new java.util.concurrent.ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }

    /**
     * WebSocket executor for real-time communications
     * Dedicated pool for WebSocket operations and real-time updates
     */
    @Bean(name = "websocketExecutor")
    public TaskExecutor websocketExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);  // Core threads for WebSocket operations
        executor.setMaxPoolSize(15);  // Max threads for concurrent connections
        executor.setQueueCapacity(300); // Queue WebSocket tasks
        executor.setThreadNamePrefix("WingIt-WebSocket-");
        executor.setKeepAliveSeconds(45);
        executor.setRejectedExecutionHandler(new java.util.concurrent.ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }

    /**
     * Background processing executor for heavy operations
     * Used for data migration, bulk operations, and maintenance tasks
     */
    @Bean(name = "backgroundExecutor")
    public TaskExecutor backgroundExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);  // Limited core threads for background tasks
        executor.setMaxPoolSize(4);   // Max threads for background processing
        executor.setQueueCapacity(2000); // Large queue for background tasks
        executor.setThreadNamePrefix("WingIt-Background-");
        executor.setKeepAliveSeconds(600); // Keep threads alive longer for background work
        executor.setRejectedExecutionHandler(new java.util.concurrent.ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}
