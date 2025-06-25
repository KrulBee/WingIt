package com.example.server.service;

import com.example.server.model.Entity.Role;
import com.example.server.model.Entity.User;
import com.example.server.model.Entity.UserData;
import com.example.server.model.DTO.TempOAuth2User;
import com.example.server.repository.RoleRepository;
import com.example.server.repository.UserRepository;
import com.example.server.repository.UserDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Optional;

@Service
public class GoogleOidcUserService extends OidcUserService {

    private static final Logger logger = LoggerFactory.getLogger(GoogleOidcUserService.class);

    @Autowired
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
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {        OidcUser oidcUser = super.loadUser(userRequest);
        
        try {
            return processOidcUser(userRequest, oidcUser);
        } catch (OAuth2AuthenticationException e) {
            // Re-throw OAuth2AuthenticationException as-is to preserve OAuth2Error
            logger.error("OAuth2 authentication exception during OIDC processing", e);
            throw e;
        } catch (Exception e) {
            logger.error("Error processing OIDC user", e);
            throw new OAuth2AuthenticationException("OIDC processing error: " + e.getMessage());
        }
    }

    private OidcUser processOidcUser(OidcUserRequest userRequest, OidcUser oidcUser) {
        // Debug: Log all attributes to see what Google returns
        logger.info("OidcUser attributes: {}", oidcUser.getAttributes());
        
        // Google OIDC returns 'sub' as the unique identifier
        String providerId = oidcUser.getSubject();
        String email = oidcUser.getEmail();
        String name = oidcUser.getFullName();
        String picture = oidcUser.getAttribute("picture");
        String provider = userRequest.getClientRegistration().getRegistrationId(); // "google"

        logger.info("Processing OIDC user: providerId={}, email={}, name={}", providerId, email, name);

        // Validate that we have required fields
        if (providerId == null || email == null) {
            logger.error("Missing required OIDC fields: providerId={}, email={}", providerId, email);
            throw new OAuth2AuthenticationException("Missing required user information from OIDC provider");
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
                  logger.info("Stored temporary OIDC user data, setup token: {}", setupToken);
                  // Throw a specific exception that will be caught by the failure handler
                OAuth2Error error = new OAuth2Error("setup_required", "SETUP_REQUIRED:" + setupToken, null);
                OAuth2AuthenticationException exception = new OAuth2AuthenticationException(error);
                logger.error("Throwing setup required exception with error code: {} and description: {}", 
                    error.getErrorCode(), error.getDescription());
                throw exception;
            } else {
                // Link OAuth2 to existing user
                user.setProvider(provider);
                user.setProviderId(providerId);
                user = userRepository.save(user);
                logger.info("Linked OIDC account to existing user: {}", user.getUsername());
            }
        } else {
            // Update existing OAuth2 user info if needed
            updateUserData(user, name, picture, email);
            logger.info("Updated existing OIDC user: {}", user.getUsername());
        }

        // Create a custom OIDC user implementation that includes our User entity
        return new CustomOidcUser(oidcUser, user);
    }

    @Transactional
    private User createNewUser(String providerId, String email, String name, String picture, String provider) {
        logger.info("Creating new OIDC user with email: {}", email);

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
        userData.setProfilePicture(picture);        userData.setDateOfBirth(null);
        // createdAt will be automatically set by @PrePersist
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
