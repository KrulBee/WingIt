package com.example.server.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.util.StringUtils;

import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserDetailsService userDetailsService;    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        try {
            // Enhanced logging for admin endpoints
            boolean isAdminRequest = request.getRequestURI().startsWith("/api/admin");
            if (isAdminRequest) {
                System.out.println("=== JWT FILTER: Admin Request Debug ===");
                System.out.println("Request: " + request.getMethod() + " " + request.getRequestURI());
                System.out.println("Authorization Header: " + request.getHeader("Authorization"));
                System.out.println("Content-Type: " + request.getHeader("Content-Type"));
            }
            
            String jwt = getJwtFromRequest(request);
            
            if (isAdminRequest) {
                System.out.println("JWT Token extracted: " + (jwt != null ? "Present (length: " + jwt.length() + ")" : "Not found"));
            }

            if (StringUtils.hasText(jwt)) {
                boolean isValid = jwtService.validateToken(jwt);
                if (isAdminRequest) {
                    System.out.println("JWT Token valid: " + isValid);
                }
                
                if (isValid) {
                    String username = jwtService.getUsernameFromJWT(jwt);
                    if (isAdminRequest) {
                        System.out.println("Username from JWT: " + username);
                    }

                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    if (isAdminRequest) {
                        System.out.println("User authorities: " + userDetails.getAuthorities());
                    }
                    
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    if (isAdminRequest) {
                        System.out.println("Authentication set successfully for user: " + username);
                    }
                } else if (isAdminRequest) {
                    System.out.println("JWT validation failed");
                }
            } else if (isAdminRequest) {
                System.out.println("No JWT token found in request");
            }
            
            if (isAdminRequest) {
                System.out.println("=== End JWT Filter Debug ===");
            }
        } catch (Exception ex) {
            System.err.println("JWT Authentication error: " + ex.getMessage());
            ex.printStackTrace();
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        // Only skip JWT filter for login and register endpoints, and preflight requests
        // Allow /api/v1/auth/me to be processed for JWT validation
        return path.equals("/api/v1/auth/login") || 
               path.equals("/api/v1/auth/register") || 
               "OPTIONS".equals(request.getMethod());
    }
}
