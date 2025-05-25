package com.example.server.controller;

import com.example.server.config.JwtConfig;
import com.example.server.model.Entity.User;
import com.example.server.model.Entity.UserData;
import com.example.server.repository.UserRepository;
import com.example.server.repository.UserDataRepository;
import com.example.server.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
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

@RestController
@RequestMapping(value = "/api/v1/auth", produces = MediaType.APPLICATION_JSON_VALUE)
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtConfig jwtConfig;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserDataRepository userDataRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

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
            String jwt = jwtConfig.generateToken((UserDetails) authentication.getPrincipal());
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
            jwtConfig.blacklistToken(token);
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok("Logged out successfully");
    }

    @GetMapping(value = "/me",
                produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<UserDTO> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepository.findByUsername(username);
        
        if (user != null) {
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
        }
        
        return ResponseEntity.notFound().build();
    }
}
