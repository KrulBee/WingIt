package com.example.server.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.ResourceAccessException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ProfanityDetectionService {

    private static final Logger logger = LoggerFactory.getLogger(ProfanityDetectionService.class);
    
    @Value("${profanity.detection.url:http://localhost:5000}")
    private String profanityServerUrl;
    
    @Value("${profanity.detection.enabled:true}")
    private boolean profanityDetectionEnabled;
    
    @Value("${profanity.detection.timeout:5000}")
    private int timeoutMs;
      private final RestTemplate restTemplate;
    
    public ProfanityDetectionService() {
        this.restTemplate = new RestTemplate();
    }
      /**
     * Check if text contains profanity
     * @param text The text to check
     * @return ProfanityResult containing detection results
     */
    public ProfanityResult checkProfanity(String text) {
        if (!profanityDetectionEnabled) {
            throw new RuntimeException("Profanity detection is disabled in configuration");
        }
        
        if (text == null || text.trim().isEmpty()) {
            return createCleanResult(text);
        }
          try {
            // Check if AI server is available first - REQUIRED
            if (!isServerHealthy()) {
                throw new RuntimeException("Hệ thống kiểm tra nội dung đang khởi động. Vui lòng thử lại sau 2-3 phút.");
            }
            
            // Prepare request
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("text", text);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            // Make API call
            ResponseEntity<ProfanityApiResponse> response = restTemplate.postForEntity(
                profanityServerUrl + "/detect",
                request,
                ProfanityApiResponse.class
            );            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                ProfanityApiResponse apiResponse = response.getBody();
                
                // Handle potential null API response
                if (apiResponse == null) {
                    throw new RuntimeException("Received null response from AI server");
                }
                
                return ProfanityResult.builder()
                    .profane(apiResponse.isProfane)
                    .confidence(apiResponse.confidence)
                    .originalText(text)
                    .processedText(apiResponse.processedText != null ? apiResponse.processedText : text)
                    .toxicSpans(apiResponse.toxicSpans)
                    .timestamp(LocalDateTime.now())
                    .error(apiResponse.error)
                    .build();
            } else {
                throw new RuntimeException("Invalid response from AI server: " + response.getStatusCode());
            }
              } catch (ResourceAccessException e) {
            throw new RuntimeException("Hệ thống kiểm tra nội dung đang khởi động. Vui lòng thử lại sau 2-3 phút.");
        } catch (Exception e) {
            throw new RuntimeException("Hệ thống kiểm tra nội dung tạm thời không khả dụng. Vui lòng thử lại sau.");
        }
    }
      /**
     * Check multiple texts for profanity in batch
     * @param texts List of texts to check
     * @return List of ProfanityResult
     */
    public List<ProfanityResult> checkProfanityBatch(List<String> texts) {
        if (!profanityDetectionEnabled) {
            throw new RuntimeException("Profanity detection is disabled in configuration");
        }
        
        if (texts == null || texts.isEmpty()) {
            return List.of();
        }
        
        try {
            if (!isServerHealthy()) {
                throw new RuntimeException("AI server is not available - content moderation required");
            }
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("texts", texts);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<BatchProfanityApiResponse> response = restTemplate.postForEntity(
                profanityServerUrl + "/batch_detect",
                request,
                BatchProfanityApiResponse.class
            );
              if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                BatchProfanityApiResponse apiResponse = response.getBody();
                
                // Handle potential null API response
                if (apiResponse == null || apiResponse.results == null) {
                    throw new RuntimeException("Received null or incomplete response from AI server");
                }
                
                return apiResponse.results.stream()
                    .map(result -> ProfanityResult.builder()
                        .profane(result.isProfane)
                        .confidence(result.confidence)
                        .originalText(texts.get(result.index))
                        .processedText(result.processedText != null ? result.processedText : texts.get(result.index))
                        .toxicSpans(result.toxicSpans)
                        .timestamp(LocalDateTime.now())
                        .error(result.error)
                        .build())
                    .toList();
            } else {
                throw new RuntimeException("Invalid response from AI server: " + response.getStatusCode());
            }
            
        } catch (Exception e) {
            throw new RuntimeException("Error during batch profanity detection: " + e.getMessage());
        }
    }    /**
     * Check if the AI server is healthy and ready to process requests
     * @return true if server is healthy, false otherwise
     */    @SuppressWarnings("unchecked")
    public boolean isServerHealthy() {
        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.getForEntity(
                profanityServerUrl + "/health",
                (Class<Map<String, Object>>) (Class<?>) Map.class
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> health = response.getBody();
                
                // Handle potential null health response
                if (health == null) {
                    logger.warn("AI Server returned null health data");
                    return false;
                }
                
                boolean isHealthy = "healthy".equals(health.get("status"));
                boolean modelLoaded = Boolean.TRUE.equals(health.get("model_loaded"));
                
                logger.debug("AI Server Health - Status: {}, Model Loaded: {}", 
                    health.get("status"), modelLoaded);
                
                return isHealthy && modelLoaded;
            }
            
            logger.warn("AI Server health check returned non-200 status: {}", response.getStatusCode());
            return false;
            
        } catch (ResourceAccessException e) {
            logger.warn("AI Server is not reachable (likely starting up): {}", e.getMessage());
            return false;
        } catch (Exception e) {
            logger.error("AI Server health check failed: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Get model information from AI server
     * @return ModelInfo or null if unavailable
     */
    public ModelInfo getModelInfo() {
        try {
            ResponseEntity<ModelInfo> response = restTemplate.getForEntity(
                profanityServerUrl + "/model_info",
                ModelInfo.class
            );
            
            if (response.getStatusCode().is2xxSuccessful()) {
                return response.getBody();
            }
        } catch (Exception e) {
            logger.error("Error getting model info: {}", e.getMessage());
        }
        
        return null;
    }
      private ProfanityResult createCleanResult(String text) {
        return ProfanityResult.builder()
            .profane(false)
            .confidence(0.0)
            .originalText(text)
            .processedText(text)
            .timestamp(LocalDateTime.now())
            .build();
    }
    
    // Inner classes for API responses
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ProfanityApiResponse {
        @JsonProperty("is_profane")
        public boolean isProfane;
        
        public double confidence;
        
        @JsonProperty("toxic_spans")
        public List<List<Integer>> toxicSpans;
        
        @JsonProperty("processed_text")
        public String processedText;
        
        public String error;
    }
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class BatchProfanityApiResponse {
        public List<BatchResultItem> results;
        
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class BatchResultItem {
            public int index;
            
            @JsonProperty("is_profane")
            public boolean isProfane;
            
            public double confidence;
            
            @JsonProperty("toxic_spans")
            public List<List<Integer>> toxicSpans;
            
            @JsonProperty("processed_text")
            public String processedText;
            
            public String error;
        }
    }
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ModelInfo {
        @JsonProperty("model_name")
        public String modelName;
        
        @JsonProperty("max_length")
        public int maxLength;
        
        public List<String> labels;
        
        @JsonProperty("confidence_threshold")
        public double confidenceThreshold;
        
        @JsonProperty("model_loaded")
        public boolean modelLoaded;
        
        public String device;
    }
    
    // Result class
    public static class ProfanityResult {
        private boolean profane;
        private double confidence;
        private String originalText;
        private String processedText;
        private List<List<Integer>> toxicSpans;
        private LocalDateTime timestamp;
        private String error;
        
        // Builder pattern
        public static Builder builder() {
            return new Builder();
        }
        
        public static class Builder {
            private ProfanityResult result = new ProfanityResult();
            
            public Builder profane(boolean profane) {
                result.profane = profane;
                return this;
            }
            
            public Builder confidence(double confidence) {
                result.confidence = confidence;
                return this;
            }
            
            public Builder originalText(String originalText) {
                result.originalText = originalText;
                return this;
            }
            
            public Builder processedText(String processedText) {
                result.processedText = processedText;
                return this;
            }
            
            public Builder toxicSpans(List<List<Integer>> toxicSpans) {
                result.toxicSpans = toxicSpans;
                return this;
            }
            
            public Builder timestamp(LocalDateTime timestamp) {
                result.timestamp = timestamp;
                return this;
            }
            
            public Builder error(String error) {
                result.error = error;
                return this;
            }
            
            public ProfanityResult build() {
                return result;
            }
        }
        
        // Getters
        public boolean isProfane() { return profane; }
        public double getConfidence() { return confidence; }        public String getOriginalText() { return originalText; }
        public String getProcessedText() { return processedText; }
        public List<List<Integer>> getToxicSpans() { return toxicSpans; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public String getError() { return error; }
        
        public boolean hasError() { return error != null && !error.isEmpty(); }
    }
    
    /**
     * Server status class for detailed AI server monitoring
     */
    public static class ServerStatus {
        private final boolean reachable;
        private final boolean modelLoaded;
        private final String status;
        private final String modelStatus;
        private final String error;
        
        public ServerStatus(boolean reachable, boolean modelLoaded, String status, String modelStatus, String error) {
            this.reachable = reachable;
            this.modelLoaded = modelLoaded;
            this.status = status;
            this.modelStatus = modelStatus;
            this.error = error;
        }
        
        // Getters
        public boolean isReachable() { return reachable; }
        public boolean isModelLoaded() { return modelLoaded; }
        public String getStatus() { return status; }
        public String getModelStatus() { return modelStatus; }
        public String getError() { return error; }
        
        public boolean isReady() { return reachable && modelLoaded && "healthy".equals(status); }
        public boolean isLoading() { return reachable && !modelLoaded && ("initializing".equals(status) || "loading".equals(modelStatus)); }
        public boolean hasError() { return error != null && !error.isEmpty(); }
        
        public String getUserFriendlyMessage() {
            if (isReady()) {
                return "Hệ thống kiểm tra nội dung đang hoạt động bình thường.";
            } else if (isLoading()) {
                return "Hệ thống kiểm tra nội dung đang khởi động. Vui lòng thử lại sau 2-3 phút.";
            } else if (!reachable) {
                return "Hệ thống kiểm tra nội dung đang khởi động. Vui lòng thử lại sau 2-3 phút.";
            } else {
                return "Hệ thống kiểm tra nội dung tạm thời không khả dụng. Vui lòng thử lại sau.";
            }
        }
    }
}
