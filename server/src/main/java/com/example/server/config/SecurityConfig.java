package com.example.server.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsUtils;
import org.springframework.web.cors.CorsConfiguration;
import com.example.server.service.GoogleOAuth2UserService;
import com.example.server.service.GoogleOidcUserService;
import com.example.server.service.OAuth2AuthenticationSuccessHandler;
import com.example.server.service.OAuth2AuthenticationFailureHandler;

import java.io.IOException;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Autowired
    private UserDetailsService userDetailsService;    @Autowired
    private GoogleOAuth2UserService googleOAuth2UserService;

    @Autowired
    private GoogleOidcUserService googleOidcUserService;

    @Autowired
    private OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;

    @Autowired
    private OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, UserDetailsService userDetailsService) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.userDetailsService = userDetailsService;
    }    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(request -> {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowCredentials(true); // Enable credentials for JWT auth
                // Allow multiple origins for different deployment environments
                config.addAllowedOrigin("http://localhost:3000"); // Local development
                config.addAllowedOrigin("https://wingit-frontend.onrender.com"); // Production frontend
                config.addAllowedOriginPattern("https://*.onrender.com"); // Render deployment
                config.addAllowedOriginPattern("https://*.railway.app"); // Railway deployment (backup)
                config.addAllowedHeader("*");
                config.addAllowedMethod("*");
                config.addExposedHeader("Authorization"); // Expose auth header
                return config;
            }))            .authorizeHttpRequests(auth -> auth
                .requestMatchers(CorsUtils::isPreFlightRequest).permitAll()
                .requestMatchers("/api/v1/health", "/api/v1/ready").permitAll() // Health check endpoints
                .requestMatchers("/api/v1/auth/**").permitAll() // This covers all auth endpoints
                .requestMatchers("/api/v1/password-reset/**").permitAll() // Allow password reset endpoints
                .requestMatchers("/api/v1/users/verify-email-change").permitAll() // Allow email change verification
                .requestMatchers("/api/v1/init/**").permitAll() // Allow database initialization endpoints
                .requestMatchers("/ws/**").permitAll() // Allow WebSocket connections
                .requestMatchers("/api/v1/post-views/locations/**").permitAll() // Allow location view stats without auth                .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll() // Allow OAuth2 endpoints
                .requestMatchers("/api/admin/**").hasRole("admin") // Admin endpoints require admin role
                .anyRequest().authenticated()
            )            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    // Enhanced debugging for authentication failures
                    System.out.println("=== AUTHENTICATION FAILURE DEBUG ===");
                    System.out.println("Request URI: " + request.getRequestURI());
                    System.out.println("Request Method: " + request.getMethod());
                    System.out.println("Authorization Header: " + request.getHeader("Authorization"));
                    System.out.println("Exception: " + authException.getMessage());
                    System.out.println("Exception Type: " + authException.getClass().getSimpleName());

                    // ALWAYS return 401 for API endpoints - NO redirects
                    String requestURI = request.getRequestURI();
                    System.out.println("API endpoint detected - returning 401: " + requestURI);
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.setCharacterEncoding("UTF-8");
                    // Don't set CORS headers here - let the main CORS config handle it
                    response.getWriter().write("{\"error\": \"Unauthorized\", \"message\": \"Authentication required\"}");
                    response.getWriter().flush();
                    System.out.println("=== END AUTHENTICATION FAILURE DEBUG ===");
                })
            )
            // Temporarily disable OAuth2 to test JWT authentication
            /*.oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(googleOAuth2UserService)
                    .oidcUserService(googleOidcUserService)
                )
                .successHandler(oAuth2AuthenticationSuccessHandler)
                .failureHandler(oAuth2AuthenticationFailureHandler)
            )*/
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
