package com.example.wingit.service;

import com.example.wingit.dto.UserDTO;
import com.example.wingit.model.Entity.User;
import com.example.wingit.model.Entity.UserData;
import com.example.wingit.model.Entity.Role; // Changed import from com.example.wingit.model.Enum.Role
import com.example.wingit.repository.RoleRepository;
import com.example.wingit.repository.UserDataRepository;
import com.example.wingit.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserDataRepository userDataRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

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
        userData.setUserId(user.getId());
        userData.setDisplayName(userDTO.getDisplayName());
        userData.setBio(userDTO.getBio());
        userData.setProfilePicture(userDTO.getProfilePicture());
        userData.setDateOfBirth(userDTO.getDateOfBirth());
        userData.setCreatedAt(new java.sql.Date(System.currentTimeMillis()).toString());
        userDataRepository.save(userData); // Added save operation for userData

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