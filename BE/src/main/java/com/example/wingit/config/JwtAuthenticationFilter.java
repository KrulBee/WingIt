package com.example.wingit.config;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtConfig jwtConfig;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtConfig jwtConfig, UserDetailsService userDetailsService) {
        this.jwtConfig = jwtConfig;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        try {
            String header = request.getHeader("Authorization");
            logger.debug("Authorization header: {}", header);

            if (header != null && header.startsWith("Bearer ")) {
                String token = header.replace("Bearer ", "");
                logger.debug("Extracted token: {}", token);
                
                String username = jwtConfig.extractUsername(token);
                logger.debug("Extracted username: {}", username);
                
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                logger.debug("Loaded user details for: {}", username);
                
                if (jwtConfig.validateToken(token, userDetails)) {
                    logger.debug("Token is valid for user: {}", username);
                    
                    if (SecurityContextHolder.getContext().getAuthentication() == null) {
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        logger.debug("Set authentication in SecurityContext for user: {}", username);
                    }
                } else {
                    logger.warn("Token validation failed for user: {}", username);
                }
            } else {
                logger.debug("No Bearer token found in request");
            }
        } catch (Exception e) {
            logger.error("Error processing JWT token", e);
        }

        chain.doFilter(request, response);
    }
}
