package com.example.server.service;

import com.example.server.dto.UserDTO;
import com.example.server.model.Entity.User;
import com.example.server.model.Entity.UserData;
import com.example.server.model.Entity.Role; // Changed import from com.example.wingit.model.Enum.Role
import com.example.server.repository.RoleRepository;
import com.example.server.repository.UserDataRepository;
import com.example.server.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserDataRepository userDataRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;

    public UserService(UserRepository userRepository, UserDataRepository userDataRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userDataRepository = userDataRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserDTO registerUser(UserDTO userDTO) {
        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword())); // Now using passwordEncoder
        
        // Fetch the default role (assuming ID 1 is the default user role)
        Optional<Role> defaultRoleOpt = roleRepository.findById(1);
        if (defaultRoleOpt.isEmpty()) {
            // Handle case where default role is not found - this should not happen in a configured system
            // For now, throw an exception or return null/error DTO
            throw new RuntimeException("Default user role not found"); 
        }
        user.setRole(defaultRoleOpt.get());
        
        user = userRepository.save(user);

        UserData userData = new UserData();
        userData.setUser(user);  // Set the User entity instead of just the ID
        userData.setDisplayName(userDTO.getDisplayName());
        userData.setBio(userDTO.getBio());
        userData.setProfilePicture(userDTO.getProfilePicture());
        // Convert String dateOfBirth to LocalDate
        if (userDTO.getDateOfBirth() != null) {
            try {
                LocalDate dateOfBirth = LocalDate.parse(userDTO.getDateOfBirth(), DATE_FORMATTER);
                userData.setDateOfBirth(dateOfBirth);
            } catch (DateTimeParseException e) {
                throw new IllegalArgumentException("Invalid date format. Please use ISO format (YYYY-MM-DD)");
            }
        }
        // createdAt will be automatically set by @PrePersist
        userDataRepository.save(userData);

        userDTO.setId(user.getId());
        return userDTO;
    }

    public UserDTO loginUser(UserDTO userDTO) {
        User user = userRepository.findByUsername(userDTO.getUsername());
        if (user != null && passwordEncoder.matches(userDTO.getPassword(), user.getPassword())) {
            userDTO.setId(user.getId());
            return userDTO;
        }
        return null; // Handle authentication failure
    }
}