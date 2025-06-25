package com.example.server.controller;

import com.example.server.config.JwtService;
import com.example.server.model.Entity.User;
import com.example.server.model.Entity.UserData;
import com.example.server.model.Entity.Role;
import com.example.server.model.DTO.TempOAuth2User;
import com.example.server.repository.UserRepository;
import com.example.server.repository.UserDataRepository;
import com.example.server.repository.RoleRepository;
import com.example.server.service.UserSettingsService;
import com.example.server.service.TempOAuth2UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.example.server.dto.LoginRequest;
import com.example.server.dto.RegisterRequest;
import com.example.server.dto.AuthResponse;
import com.example.server.dto.UserDTO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.io.IOException;
import java.util.HashMap;
import java.util.Optional;
import java.io.IOException;

@RestController
@RequestMapping(value = "/api/v1/auth", produces = MediaType.APPLICATION_JSON_VALUE)
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserDataRepository userDataRepository;    @Autowired
    private RoleRepository roleRepository;    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserSettingsService userSettingsService;

    @Autowired
    private TempOAuth2UserService tempOAuth2UserService;

    @PostMapping(value = "/login", 
                consumes = MediaType.APPLICATION_JSON_VALUE,
                produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
        try {
            System.out.println("Login attempt for user: " + loginRequest.getUsername());
            
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtService.generateToken((UserDetails) authentication.getPrincipal());
            System.out.println("Login successful for user: " + loginRequest.getUsername());
            
            return ResponseEntity.ok(new AuthResponse(jwt));
        } catch (Exception e) {
            System.err.println("Login failed for user: " + loginRequest.getUsername() + " - " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @PostMapping(value = "/register",
                consumes = MediaType.APPLICATION_JSON_VALUE,
                produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        try {
            System.out.println("Registration attempt for user: " + registerRequest.getUsername());
            
            if (userRepository.existsByUsername(registerRequest.getUsername())) {
                System.out.println("Registration failed: Username already exists - " + registerRequest.getUsername());
                return ResponseEntity.badRequest().body("Username already exists");
            }

            // Create and save User entity
            User user = new User();
            user.setUsername(registerRequest.getUsername());
            user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
            user.setRole(roleRepository.findById(1).orElseThrow(() -> new RuntimeException("Role not found")));

            user = userRepository.save(user);
            System.out.println("User created successfully with ID: " + user.getId());

            // Create and save UserData entity with display name same as username
            UserData userData = new UserData();
            userData.setUser(user);
            userData.setDisplayName(registerRequest.getUsername()); // Set display name to username
            userData.setBio(""); // Empty bio by default
            userData.setProfilePicture(null); // No profile picture by default
            userData.setDateOfBirth(null); // No date of birth by default
              userDataRepository.save(userData);
            System.out.println("UserData created successfully for user: " + registerRequest.getUsername() + 
                             " with display name: " + userData.getDisplayName());

            // Create default user settings
            userSettingsService.createDefaultSettings(user.getId());
            System.out.println("UserSettings created successfully for user: " + registerRequest.getUsername());

            return ResponseEntity.ok("User registered successfully");
        } catch (Exception e) {
            System.err.println("Registration failed for user: " + registerRequest.getUsername() + " - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping(value = "/logout",
                produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> logout(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.replace("Bearer ", "");
            jwtService.blacklistToken(token);
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok("Logged out successfully");
    }

    @GetMapping(value = "/me",
                produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            // Enhanced debugging for auth issues
            System.out.println("=== AUTH DEBUG /me endpoint ===");
            System.out.println("Authentication: " + authentication);
            System.out.println("Is authenticated: " + (authentication != null ? authentication.isAuthenticated() : "null"));
            System.out.println("Principal: " + (authentication != null ? authentication.getPrincipal() : "null"));
            System.out.println("Name: " + (authentication != null ? authentication.getName() : "null"));

            if (authentication == null || !authentication.isAuthenticated() ||
                "anonymousUser".equals(authentication.getPrincipal())) {
                System.out.println("Authentication failed - returning 401");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Not authenticated"));
            }

            String username = authentication.getName();
            User user = userRepository.findByUsername(username);

            if (user != null) {
                System.out.println("User found: " + user.getUsername() + " (ID: " + user.getId() + ")");

                UserDTO userDTO = new UserDTO();
                userDTO.setId(user.getId());
                userDTO.setUsername(user.getUsername());
                if (user.getUserData() != null) {
                    userDTO.setDisplayName(user.getUserData().getDisplayName());
                    userDTO.setBio(user.getUserData().getBio());
                    userDTO.setProfilePicture(user.getUserData().getProfilePicture());
                    if (user.getUserData().getDateOfBirth() != null) {
                        userDTO.setDateOfBirth(user.getUserData().getDateOfBirth().toString());
                    }
                }
                return ResponseEntity.ok(userDTO);
            } else {
                System.out.println("User not found for username: " + username);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found"));
            }
        } catch (Exception e) {
            System.err.println("Error in /me endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get current user", "message", e.getMessage()));
        }
    }

    @PostMapping("/oauth2/setup")
    @Transactional
    public ResponseEntity<?> completeOAuth2Setup(@RequestBody Map<String, String> request) {
        String setupToken = request.get("setupToken");
        String username = request.get("username");
        String password = request.get("password");

        if (setupToken == null || username == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing required fields"));
        }

        // Get temporary OAuth2 user data
        TempOAuth2User tempUser = tempOAuth2UserService.getTempUser(setupToken);
        if (tempUser == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired setup token"));
        }

        // Check if username is already taken
        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Tên đăng nhập đã được sử dụng"));
        }

        // Check if email is already used (in case someone registered with same email)
        if (userRepository.existsByEmail(tempUser.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }

        try {
            // Create the user account
            User user = new User();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(password));
            user.setEmail(tempUser.getEmail());
            user.setProvider(tempUser.getProvider());
            user.setProviderId(tempUser.getProviderId());

            // Set default role
            Optional<Role> defaultRoleOpt = roleRepository.findById(1);
            if (defaultRoleOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Default user role not found"));
            }
            user.setRole(defaultRoleOpt.get());

            user = userRepository.save(user);

            // Create UserData
            UserData userData = new UserData();            userData.setUser(user);
            userData.setDisplayName(tempUser.getDisplayName() != null ? tempUser.getDisplayName() : username);
            userData.setBio("");
            userData.setProfilePicture(tempUser.getProfilePicture());
            userData.setDateOfBirth(null);
            // createdAt will be automatically set by @PrePersist
            userDataRepository.save(userData);

            // Create default user settings
            userSettingsService.createDefaultSettings(user.getId());

            // Clean up temporary data
            tempOAuth2UserService.removeTempUser(setupToken);

            // Generate JWT token
            UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .roles(user.getRole() != null ? user.getRole().getRoleName() : "USER")
                .build();            String token = jwtService.generateToken(userDetails);

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("message", "OAuth2 account setup completed successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to create account: " + e.getMessage()));
        }
    }

    @GetMapping("/oauth2/setup/info")
    public ResponseEntity<?> getSetupInfo(@RequestParam String token) {
        TempOAuth2User tempUser = tempOAuth2UserService.getTempUser(token);
        if (tempUser == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired setup token"));
        }

        Map<String, Object> info = new HashMap<>();
        info.put("email", tempUser.getEmail());
        info.put("displayName", tempUser.getDisplayName());
        info.put("profilePicture", tempUser.getProfilePicture());
        info.put("provider", tempUser.getProvider());

        return ResponseEntity.ok(info);
    }

    @GetMapping("/oauth2/google")
    public void initiateGoogleLogin(HttpServletResponse response) throws IOException {
        // Redirect directly to Spring Security's OAuth2 authorization endpoint
        response.sendRedirect("/oauth2/authorization/google");
    }

    @GetMapping("/debug-token")
    public ResponseEntity<?> debugToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        System.out.println("=== TOKEN DEBUG ===");
        System.out.println("Authorization Header: " + authHeader);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            System.out.println("Token length: " + token.length());
            System.out.println("Token first 20 chars: " + token.substring(0, Math.min(20, token.length())));

            // Test token validation
            try {
                boolean isValid = jwtService.validateToken(token);
                System.out.println("Token valid: " + isValid);

                if (isValid) {
                    String username = jwtService.getUsernameFromJWT(token);
                    System.out.println("Username from token: " + username);
                }
            } catch (Exception e) {
                System.out.println("Token validation error: " + e.getMessage());
            }
        }

        return ResponseEntity.ok(Map.of("message", "Check server console for debug info"));
    }
}
