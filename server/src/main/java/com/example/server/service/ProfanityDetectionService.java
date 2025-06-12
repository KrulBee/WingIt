package com.example.server.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    private final ObjectMapper objectMapper;
    
    public ProfanityDetectionService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }
    
    /**
     * Check if text contains profanity
     * @param text The text to check
     * @return ProfanityResult containing detection results
     */
    public ProfanityResult checkProfanity(String text) {
        if (!profanityDetectionEnabled) {
            logger.debug("Profanity detection is disabled, returning clean result");
            return createCleanResult(text);
        }
        
        if (text == null || text.trim().isEmpty()) {
            return createCleanResult(text);
        }
        
        try {
            // Check if AI server is available first
            if (!isServerHealthy()) {
                logger.warn("AI server is not healthy, allowing content through");
                return createCleanResult(text);
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
                
                return ProfanityResult.builder()
                    .profane(apiResponse.isProfane)
                    .confidence(apiResponse.confidence)
                    .originalText(text)
                    .processedText(apiResponse.processedText)
                    .toxicSpans(apiResponse.toxicSpans)
                    .timestamp(LocalDateTime.now())
                    .error(apiResponse.error)
                    .build();
            } else {
                logger.error("Received non-2xx response from profanity detection service: {}", 
                    response.getStatusCode());
                return createErrorResult(text, "Invalid response from AI server");
            }
            
        } catch (ResourceAccessException e) {
            logger.error("Failed to connect to profanity detection service: {}", e.getMessage());
            // Allow content through if AI service is down
            return createCleanResult(text);
        } catch (Exception e) {
            logger.error("Error during profanity detection: {}", e.getMessage(), e);
            // Allow content through on error to avoid blocking users
            return createCleanResult(text);
        }
    }
    
    /**
     * Check multiple texts for profanity in batch
     * @param texts List of texts to check
     * @return List of ProfanityResult
     */
    public List<ProfanityResult> checkProfanityBatch(List<String> texts) {
        if (!profanityDetectionEnabled || texts == null || texts.isEmpty()) {
            return texts.stream()
                .map(this::createCleanResult)
                .toList();
        }
        
        try {
            if (!isServerHealthy()) {
                logger.warn("AI server is not healthy, allowing all content through");
                return texts.stream()
                    .map(this::createCleanResult)
                    .toList();
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
                
                return apiResponse.results.stream()
                    .map(result -> ProfanityResult.builder()
                        .profane(result.isProfane)
                        .confidence(result.confidence)
                        .originalText(texts.get(result.index))
                        .processedText(result.processedText)
                        .toxicSpans(result.toxicSpans)
                        .timestamp(LocalDateTime.now())
                        .error(result.error)
                        .build())
                    .toList();
            } else {
                logger.error("Received non-2xx response from batch profanity detection: {}", 
                    response.getStatusCode());
                return texts.stream()
                    .map(text -> createErrorResult(text, "Invalid response from AI server"))
                    .toList();
            }
            
        } catch (Exception e) {
            logger.error("Error during batch profanity detection: {}", e.getMessage(), e);
            return texts.stream()
                .map(this::createCleanResult)
                .toList();
        }
    }
    
    /**
     * Check if the AI server is healthy
     * @return true if server is healthy, false otherwise
     */
    public boolean isServerHealthy() {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(
                profanityServerUrl + "/health",
                Map.class
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> health = response.getBody();
                return "healthy".equals(health.get("status")) && 
                       Boolean.TRUE.equals(health.get("model_loaded"));
            }
        } catch (Exception e) {
            logger.debug("Health check failed: {}", e.getMessage());
        }
        
        return false;
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
    
    private ProfanityResult createErrorResult(String text, String error) {
        return ProfanityResult.builder()
            .profane(false) // Allow content through on error
            .confidence(0.0)
            .originalText(text)
            .processedText(text)
            .timestamp(LocalDateTime.now())
            .error(error)
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
        public double getConfidence() { return confidence; }
        public String getOriginalText() { return originalText; }
        public String getProcessedText() { return processedText; }
        public List<List<Integer>> getToxicSpans() { return toxicSpans; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public String getError() { return error; }
        
        public boolean hasError() { return error != null && !error.isEmpty(); }
    }
}
