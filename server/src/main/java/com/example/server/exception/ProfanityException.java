package com.example.server.exception;

import com.example.server.service.ProfanityDetectionService;

/**
 * Custom exception for profanity detection errors
 */
public class ProfanityException extends RuntimeException {
    
    private final ProfanityDetectionService.ProfanityResult profanityResult;
    
    public ProfanityException(String message, ProfanityDetectionService.ProfanityResult profanityResult) {
        super(message);
        this.profanityResult = profanityResult;
    }
    
    public ProfanityDetectionService.ProfanityResult getProfanityResult() {
        return profanityResult;
    }
    
    public boolean isProfanityError() {
        return true;
    }
}
