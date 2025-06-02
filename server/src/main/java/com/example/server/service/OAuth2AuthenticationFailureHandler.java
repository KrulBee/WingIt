package com.example.server.service;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2AuthenticationFailureHandler implements AuthenticationFailureHandler {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2AuthenticationFailureHandler.class);
    
    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                      AuthenticationException exception) throws IOException, ServletException {
        
        logger.error("OAuth2 authentication failed", exception);
        logger.info("Failure handler called with exception message: {}", exception.getMessage());
        
        String errorMessage = "Authentication failed";
        
        // For OAuth2AuthenticationException, check the error description
        if (exception instanceof OAuth2AuthenticationException) {
            OAuth2AuthenticationException oauth2Exception = (OAuth2AuthenticationException) exception;
            if (oauth2Exception.getError() != null && oauth2Exception.getError().getDescription() != null) {
                errorMessage = oauth2Exception.getError().getDescription();
                logger.info("Processing OAuth2 error description: {}", errorMessage);
            }
        } else if (exception.getMessage() != null) {
            errorMessage = exception.getMessage();
            logger.info("Processing general exception message: {}", errorMessage);
        }
        
        // Check if this is a setup required scenario
        if (errorMessage.startsWith("SETUP_REQUIRED:")) {
            String setupToken = errorMessage.substring("SETUP_REQUIRED:".length());
            logger.info("Redirecting to setup page with token: {}", setupToken);
            
            String redirectUrl = "http://localhost:3000/auth/setup?token=" + 
                               URLEncoder.encode(setupToken, StandardCharsets.UTF_8);
            logger.info("Full redirect URL: {}", redirectUrl);
            response.sendRedirect(redirectUrl);
            return;
        }

        // Default error handling - redirect to callback with error
        logger.info("Redirecting to error callback with message: {}", errorMessage);
        String redirectUrl = "http://localhost:3000/auth/callback?error=" +
                           URLEncoder.encode(errorMessage, StandardCharsets.UTF_8);
        response.sendRedirect(redirectUrl);
    }
}
