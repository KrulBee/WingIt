package com.example.server.service;

import com.example.server.config.JwtService;
import com.example.server.model.Entity.User;
import com.example.server.service.CustomOAuth2User;
import com.example.server.service.CustomOidcUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
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
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2AuthenticationSuccessHandler.class);    @Autowired
    private JwtService jwtService;

    @Value("${app.base-url}")
    private String frontendUrl;@Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                      Authentication authentication) throws IOException, ServletException {
        
        logger.info("OAuth2 authentication successful");

        try {
            User user = null;
            Object principal = authentication.getPrincipal();
            
            // Handle both CustomOAuth2User and CustomOidcUser
            if (principal instanceof CustomOAuth2User) {
                CustomOAuth2User oAuth2User = (CustomOAuth2User) principal;
                user = oAuth2User.getUser();
                logger.info("Processing CustomOAuth2User: {}", user.getUsername());
            } else if (principal instanceof CustomOidcUser) {
                CustomOidcUser oidcUser = (CustomOidcUser) principal;
                user = oidcUser.getUser();
                logger.info("Processing CustomOidcUser: {}", user.getUsername());
            } else {
                logger.error("Unexpected principal type: {}", principal.getClass().getName());
                throw new IllegalStateException("Unexpected principal type: " + principal.getClass().getName());
            }

            // Create UserDetails for JWT generation
            org.springframework.security.core.userdetails.UserDetails userDetails = 
                org.springframework.security.core.userdetails.User
                    .withUsername(user.getUsername())
                    .password("") // OAuth2 users don't have passwords
                    .roles(user.getRole() != null ? user.getRole().getRoleName() : "USER")
                    .build();

            // Generate JWT token
            String token = jwtService.generateToken(userDetails);
            
            logger.info("Generated JWT token for OAuth2 user: {}", user.getUsername());            // Redirect to frontend with token
            String redirectUrl = frontendUrl + "/auth/callback?token=" + 
                               URLEncoder.encode(token, StandardCharsets.UTF_8) + 
                               "&type=success";
            
            response.sendRedirect(redirectUrl);
            
        } catch (Exception e) {
            logger.error("Error handling OAuth2 authentication success", e);
              String errorUrl = frontendUrl + "/auth/callback?error=" + 
                            URLEncoder.encode("Authentication processing failed", StandardCharsets.UTF_8);
            response.sendRedirect(errorUrl);
        }
    }
}
