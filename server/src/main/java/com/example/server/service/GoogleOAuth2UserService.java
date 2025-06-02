package com.example.server.service;

import com.example.server.model.Entity.Role;
import com.example.server.model.Entity.User;
import com.example.server.model.Entity.UserData;
import com.example.server.model.DTO.TempOAuth2User;
import com.example.server.repository.RoleRepository;
import com.example.server.repository.UserRepository;
import com.example.server.repository.UserDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Optional;

@Service
public class GoogleOAuth2UserService extends DefaultOAuth2UserService {

    private static final Logger logger = LoggerFactory.getLogger(GoogleOAuth2UserService.class);    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserDataRepository userDataRepository;

    @Autowired
    private UserSettingsService userSettingsService;

    @Autowired
    private TempOAuth2UserService tempOAuth2UserService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        
        try {
            return processOAuth2User(userRequest, oauth2User);
        } catch (Exception e) {
            logger.error("Error processing OAuth2 user", e);
            throw new OAuth2AuthenticationException("OAuth2 processing error: " + e.getMessage());
        }
    }    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oauth2User) {
        // Debug: Log all attributes to see what Google returns
        logger.info("OAuth2User attributes: {}", oauth2User.getAttributes());
        
        // Google OAuth2 can return either 'sub' (v3/OpenID) or 'id' (v2) as the unique identifier
        String providerId = oauth2User.getAttribute("sub");
        if (providerId == null) {
            providerId = oauth2User.getAttribute("id");
        }
        
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String picture = oauth2User.getAttribute("picture");
        String provider = userRequest.getClientRegistration().getRegistrationId(); // "google"

        logger.info("Processing OAuth2 user: providerId={}, email={}, name={}", providerId, email, name);

        // Validate that we have required fields
        if (providerId == null || email == null) {
            logger.error("Missing required OAuth2 fields: providerId={}, email={}", providerId, email);
            throw new OAuth2AuthenticationException("Missing required user information from OAuth2 provider");
        }

        // Check if user already exists by provider and providerId
        User user = userRepository.findByProviderAndProviderId(provider, providerId);
        
        if (user == null) {
            // Check if user exists by email (for linking existing accounts)
            user = userRepository.findByEmail(email);
            
            if (user == null) {
                // NEW FLOW: Store temporary user data and throw exception to trigger setup flow
                TempOAuth2User tempUser = new TempOAuth2User(email, provider, providerId, name, picture);
                String setupToken = tempOAuth2UserService.storeTempUser(tempUser);
                
                logger.info("Stored temporary OAuth2 user data, setup token: {}", setupToken);
                
                // Throw a specific exception that will be caught by the success handler
                throw new OAuth2AuthenticationException("SETUP_REQUIRED:" + setupToken);
            } else {
                // Link OAuth2 to existing user
                user.setProvider(provider);
                user.setProviderId(providerId);
                user = userRepository.save(user);
                logger.info("Linked OAuth2 account to existing user: {}", user.getUsername());
            }
        } else {
            // Update existing OAuth2 user info if needed
            updateUserData(user, name, picture, email);
            logger.info("Updated existing OAuth2 user: {}", user.getUsername());
        }

        // Create a custom OAuth2User implementation that includes our User entity
        return new CustomOAuth2User(oauth2User, user);
    }@Transactional
    private User createNewUser(String providerId, String email, String name, String picture, String provider) {
        logger.info("Creating new OAuth2 user with email: {}", email);

        // Create User entity
        User user = new User();
        user.setUsername(generateUniqueUsername(email, name));
        user.setEmail(email);
        user.setProvider(provider);
        user.setProviderId(providerId);
        user.setPassword(null); // OAuth2 users don't have passwords

        // Set default role
        Optional<Role> defaultRoleOpt = roleRepository.findById(1);
        if (defaultRoleOpt.isEmpty()) {
            throw new RuntimeException("Default user role not found");
        }
        user.setRole(defaultRoleOpt.get());

        user = userRepository.save(user);
        logger.info("Created user with ID: {}", user.getId());

        // Create UserData with the managed user entity
        UserData userData = new UserData();
        userData.setUser(user); // Use the saved (managed) user entity
        userData.setDisplayName(name != null ? name : user.getUsername());
        userData.setBio("");
        userData.setProfilePicture(picture);
        userData.setDateOfBirth(null);
        userData.setCreatedAt(new java.sql.Date(System.currentTimeMillis()).toLocalDate());
        userDataRepository.save(userData);
        logger.info("Created UserData for user: {}", user.getUsername());

        // Create default user settings
        userSettingsService.createDefaultSettings(user.getId());
        logger.info("Created default settings for user: {}", user.getUsername());

        return user;
    }

    private void updateUserData(User user, String name, String picture, String email) {
        boolean updated = false;

        // Update email if changed
        if (email != null && !email.equals(user.getEmail())) {
            user.setEmail(email);
            updated = true;
        }

        // Update UserData if it exists
        UserData userData = user.getUserData();
        if (userData != null) {
            if (name != null && !name.equals(userData.getDisplayName())) {
                userData.setDisplayName(name);
                updated = true;
            }
            if (picture != null && !picture.equals(userData.getProfilePicture())) {
                userData.setProfilePicture(picture);
                updated = true;
            }
            
            if (updated) {
                userDataRepository.save(userData);
            }
        }

        if (updated) {
            userRepository.save(user);
        }
    }

    private String generateUniqueUsername(String email, String name) {
        String baseUsername;
        
        if (name != null && !name.trim().isEmpty()) {
            // Use name as base, remove spaces and convert to lowercase
            baseUsername = name.trim().toLowerCase().replaceAll("\\s+", "");
        } else if (email != null) {
            // Use email prefix as base
            baseUsername = email.substring(0, email.indexOf('@')).toLowerCase();
        } else {
            baseUsername = "user";
        }

        // Remove any non-alphanumeric characters
        baseUsername = baseUsername.replaceAll("[^a-zA-Z0-9]", "");
        
        // Ensure it's not empty
        if (baseUsername.isEmpty()) {
            baseUsername = "user";
        }

        String username = baseUsername;
        int counter = 1;

        // Keep trying until we find a unique username
        while (userRepository.existsByUsername(username)) {
            username = baseUsername + counter;
            counter++;
        }

        return username;
    }
}
