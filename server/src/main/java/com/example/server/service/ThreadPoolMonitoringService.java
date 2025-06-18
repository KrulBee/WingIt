package com.example.server.service;

import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.task.TaskExecutor;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import java.util.concurrent.CompletableFuture;
import java.util.Map;
import java.util.HashMap;

/**
 * Thread Pool Monitoring Service for WingIt Social Media
 * Monitors the health and performance of all async thread pools
 * Ensures optimal performance and identifies potential bottlenecks
 */
@Service
public class ThreadPoolMonitoringService {

    private final TaskExecutor taskExecutor;
    private final TaskExecutor notificationExecutor;
    private final TaskExecutor emailExecutor;
    private final TaskExecutor mediaExecutor;
    private final TaskExecutor analyticsExecutor;
    private final TaskExecutor websocketExecutor;
    private final TaskExecutor backgroundExecutor;

    public ThreadPoolMonitoringService(
            @Qualifier("taskExecutor") TaskExecutor taskExecutor,
            @Qualifier("notificationExecutor") TaskExecutor notificationExecutor,
            @Qualifier("emailExecutor") TaskExecutor emailExecutor,
            @Qualifier("mediaExecutor") TaskExecutor mediaExecutor,
            @Qualifier("analyticsExecutor") TaskExecutor analyticsExecutor,
            @Qualifier("websocketExecutor") TaskExecutor websocketExecutor,
            @Qualifier("backgroundExecutor") TaskExecutor backgroundExecutor) {
        this.taskExecutor = taskExecutor;
        this.notificationExecutor = notificationExecutor;
        this.emailExecutor = emailExecutor;
        this.mediaExecutor = mediaExecutor;
        this.analyticsExecutor = analyticsExecutor;
        this.websocketExecutor = websocketExecutor;
        this.backgroundExecutor = backgroundExecutor;
    }

    /**
     * Get current thread pool statistics
     * Useful for monitoring and debugging performance issues
     */
    public Map<String, Object> getThreadPoolStats() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("mainExecutor", getExecutorStats((ThreadPoolTaskExecutor) taskExecutor));
        stats.put("notificationExecutor", getExecutorStats((ThreadPoolTaskExecutor) notificationExecutor));
        stats.put("emailExecutor", getExecutorStats((ThreadPoolTaskExecutor) emailExecutor));
        stats.put("mediaExecutor", getExecutorStats((ThreadPoolTaskExecutor) mediaExecutor));
        stats.put("analyticsExecutor", getExecutorStats((ThreadPoolTaskExecutor) analyticsExecutor));
        stats.put("websocketExecutor", getExecutorStats((ThreadPoolTaskExecutor) websocketExecutor));
        stats.put("backgroundExecutor", getExecutorStats((ThreadPoolTaskExecutor) backgroundExecutor));
        
        return stats;
    }

    /**
     * Get statistics for a specific thread pool executor
     */
    private Map<String, Object> getExecutorStats(ThreadPoolTaskExecutor executor) {
        Map<String, Object> stats = new HashMap<>();
        
        if (executor.getThreadPoolExecutor() != null) {
            var threadPool = executor.getThreadPoolExecutor();
            
            stats.put("activeCount", threadPool.getActiveCount());
            stats.put("corePoolSize", threadPool.getCorePoolSize());
            stats.put("maximumPoolSize", threadPool.getMaximumPoolSize());
            stats.put("poolSize", threadPool.getPoolSize());
            stats.put("queueSize", threadPool.getQueue().size());
            stats.put("queueRemainingCapacity", threadPool.getQueue().remainingCapacity());
            stats.put("completedTaskCount", threadPool.getCompletedTaskCount());
            stats.put("taskCount", threadPool.getTaskCount());
            
            // Calculate utilization percentages
            double threadUtilization = (double) threadPool.getActiveCount() / threadPool.getMaximumPoolSize() * 100;
            double queueUtilization = (double) threadPool.getQueue().size() / 
                (threadPool.getQueue().size() + threadPool.getQueue().remainingCapacity()) * 100;
            
            stats.put("threadUtilization", Math.round(threadUtilization * 100.0) / 100.0);
            stats.put("queueUtilization", Math.round(queueUtilization * 100.0) / 100.0);
        }
        
        return stats;
    }

    /**
     * Check if any thread pools are experiencing high load
     * Returns recommendations for optimization
     */
    @Async("backgroundExecutor")
    public CompletableFuture<Map<String, Object>> analyzeThreadPoolHealthAsync() {
        try {
            Map<String, Object> stats = getThreadPoolStats();
            Map<String, Object> analysis = new HashMap<>();
            Map<String, String> recommendations = new HashMap<>();
            
            // Analyze each executor's health
            for (Map.Entry<String, Object> entry : stats.entrySet()) {
                String executorName = entry.getKey();
                @SuppressWarnings("unchecked")
                Map<String, Object> executorStats = (Map<String, Object>) entry.getValue();
                
                if (executorStats.containsKey("threadUtilization")) {
                    double threadUtil = (Double) executorStats.get("threadUtilization");
                    double queueUtil = (Double) executorStats.get("queueUtilization");
                    
                    if (threadUtil > 90) {
                        recommendations.put(executorName, "HIGH_THREAD_USAGE: Consider increasing max pool size");
                    } else if (queueUtil > 80) {
                        recommendations.put(executorName, "HIGH_QUEUE_USAGE: Consider increasing queue capacity or threads");
                    } else if (threadUtil < 10 && queueUtil < 10) {
                        recommendations.put(executorName, "LOW_USAGE: Pool is healthy and has capacity");
                    } else {
                        recommendations.put(executorName, "NORMAL: Pool is operating within normal parameters");
                    }
                }
            }
            
            analysis.put("timestamp", System.currentTimeMillis());
            analysis.put("overallHealth", calculateOverallHealth(stats));
            analysis.put("recommendations", recommendations);
            analysis.put("stats", stats);
            
            return CompletableFuture.completedFuture(analysis);
        } catch (Exception e) {
            return CompletableFuture.failedFuture(new RuntimeException("Thread pool analysis failed", e));
        }
    }

    /**
     * Calculate overall health score based on all thread pools
     */
    private String calculateOverallHealth(Map<String, Object> stats) {
        int healthyCount = 0;
        int totalCount = 0;
        
        for (Map.Entry<String, Object> entry : stats.entrySet()) {
            @SuppressWarnings("unchecked")
            Map<String, Object> executorStats = (Map<String, Object>) entry.getValue();
            
            if (executorStats.containsKey("threadUtilization")) {
                totalCount++;
                double threadUtil = (Double) executorStats.get("threadUtilization");
                double queueUtil = (Double) executorStats.get("queueUtilization");
                
                if (threadUtil < 90 && queueUtil < 80) {
                    healthyCount++;
                }
            }
        }
        
        if (totalCount == 0) return "UNKNOWN";
        
        double healthRatio = (double) healthyCount / totalCount;
        if (healthRatio >= 0.9) return "EXCELLENT";
        if (healthRatio >= 0.7) return "GOOD";
        if (healthRatio >= 0.5) return "FAIR";
        return "POOR";
    }

    /**
     * Scheduled monitoring task - runs every 5 minutes
     * Logs thread pool health for monitoring and alerting
     */
    @Scheduled(fixedRate = 300000) // 5 minutes
    @Async("backgroundExecutor")
    public CompletableFuture<Void> scheduledHealthCheckAsync() {
        try {
            Map<String, Object> analysis = analyzeThreadPoolHealthAsync().get();
            String overallHealth = (String) analysis.get("overallHealth");
            
            // In real implementation, this would:
            // 1. Log health metrics to monitoring system
            // 2. Send alerts if health is poor
            // 3. Update health dashboards
            // 4. Store historical health data
            
            System.out.println("Thread Pool Health Check - Overall Health: " + overallHealth);
            
            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            return CompletableFuture.failedFuture(new RuntimeException("Scheduled health check failed", e));
        }
    }

    /**
     * Emergency thread pool optimization
     * Temporarily adjusts pool sizes during high load
     */
    @Async("backgroundExecutor")
    public CompletableFuture<Void> emergencyOptimizationAsync() {
        try {
            // Simulate emergency optimization
            Thread.sleep(100);
            
            // In real implementation:
            // 1. Temporarily increase pool sizes for overloaded executors
            // 2. Redistribute tasks to less loaded pools
            // 3. Enable emergency mode with increased resources
            // 4. Send alerts to administrators
            
            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            return CompletableFuture.failedFuture(new RuntimeException("Emergency optimization failed", e));
        }
    }
}
