package com.example.server.controller;

import com.example.server.model.Entity.*;
import com.example.server.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/init")
@CrossOrigin(origins = {"http://localhost:3000", "https://wingit-frontend.onrender.com"}, allowCredentials = "true")
public class DatabaseInitController {

    @Autowired
    private PostTypeRepository postTypeRepository;
    
    @Autowired
    private ReactionTypeRepository reactionTypeRepository;
    
    @Autowired
    private RequestStatusRepository requestStatusRepository;
    
    @Autowired
    private LocationRepository locationRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserDataRepository userDataRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/database")
    public ResponseEntity<?> initializeDatabase() {
        try {
            // Initialize Roles FIRST (required for user registration)
            if (roleRepository.count() == 0) {
                Role userRole = new Role();
                userRole.setId(1);
                userRole.setRoleName("user");
                roleRepository.save(userRole);

                Role adminRole = new Role();
                adminRole.setId(2);
                adminRole.setRoleName("admin");
                roleRepository.save(adminRole);
            }

            // Initialize Post Types
            if (postTypeRepository.count() == 0) {
                PostType info = new PostType();
                info.setTypeName("info");
                postTypeRepository.save(info);

                PostType scenic = new PostType();
                scenic.setTypeName("scenic");
                postTypeRepository.save(scenic);

                PostType discussion = new PostType();
                discussion.setTypeName("discussion");
                postTypeRepository.save(discussion);
            }
            
            // Initialize Reaction Types
            if (reactionTypeRepository.count() == 0) {
                ReactionType like = new ReactionType();
                like.setName("like");
                like.setDescription("Like reaction");
                reactionTypeRepository.save(like);
                
                ReactionType dislike = new ReactionType();
                dislike.setName("dislike");
                dislike.setDescription("Dislike reaction");
                reactionTypeRepository.save(dislike);
            }
            
            // Initialize Request Status
            if (requestStatusRepository.count() == 0) {
                RequestStatus pending = new RequestStatus();
                pending.setStatusName("PENDING");
                requestStatusRepository.save(pending);
                
                RequestStatus accepted = new RequestStatus();
                accepted.setStatusName("ACCEPTED");
                requestStatusRepository.save(accepted);
                
                RequestStatus rejected = new RequestStatus();
                rejected.setStatusName("REJECTED");
                requestStatusRepository.save(rejected);
            }
            
            // Initialize ALL Vietnamese locations
            if (locationRepository.count() == 0) {
                initializeAllLocations();
            }
            
            // Initialize Admin Account
            if (userRepository.findByUsername("Admin") == null) {
                createAdminAccount();
            }
            
            return ResponseEntity.ok(Map.of(
                "message", "Database initialized successfully",
                "roles", roleRepository.count(),
                "postTypes", postTypeRepository.count(),
                "reactionTypes", reactionTypeRepository.count(),
                "requestStatuses", requestStatusRepository.count(),
                "locations", locationRepository.count(),
                "adminCreated", userRepository.findByUsername("Admin") != null
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to initialize database: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/status")
    public ResponseEntity<?> getDatabaseStatus() {
        return ResponseEntity.ok(Map.of(
            "postTypes", postTypeRepository.count(),
            "reactionTypes", reactionTypeRepository.count(),
            "requestStatuses", requestStatusRepository.count(),
            "locations", locationRepository.count(),
            "roles", roleRepository.count()
        ));
    }

    private void initializeAllLocations() {
        // All 63 Vietnamese provinces and cities
        String[][] locations = {
            {"1", "Hà Nội"}, {"2", "Hồ Chí Minh"}, {"3", "Hải Phòng"}, {"4", "Đà Nẵng"}, {"5", "Cần Thơ"},
            {"6", "An Giang"}, {"7", "Bà Rịa - Vũng Tàu"}, {"8", "Bắc Giang"}, {"9", "Bắc Kạn"}, {"10", "Bạc Liêu"},
            {"11", "Bắc Ninh"}, {"12", "Bến Tre"}, {"13", "Bình Định"}, {"14", "Bình Dương"}, {"15", "Bình Phước"},
            {"16", "Bình Thuận"}, {"17", "Cà Mau"}, {"18", "Cao Bằng"}, {"19", "Đắk Lắk"}, {"20", "Đắk Nông"},
            {"21", "Điện Biên"}, {"22", "Đồng Nai"}, {"23", "Đồng Tháp"}, {"24", "Gia Lai"}, {"25", "Hà Giang"},
            {"26", "Hà Nam"}, {"27", "Hà Tĩnh"}, {"28", "Hải Dương"}, {"29", "Hậu Giang"}, {"30", "Hòa Bình"},
            {"31", "Hưng Yên"}, {"32", "Khánh Hòa"}, {"33", "Kiên Giang"}, {"34", "Kon Tum"}, {"35", "Lai Châu"},
            {"36", "Lâm Đồng"}, {"37", "Lạng Sơn"}, {"38", "Lào Cai"}, {"39", "Long An"}, {"40", "Nam Định"},
            {"41", "Nghệ An"}, {"42", "Ninh Bình"}, {"43", "Ninh Thuận"}, {"44", "Phú Thọ"}, {"45", "Phú Yên"},
            {"46", "Quảng Bình"}, {"47", "Quảng Nam"}, {"48", "Quảng Ngãi"}, {"49", "Quảng Ninh"}, {"50", "Quảng Trị"},
            {"51", "Sóc Trăng"}, {"52", "Sơn La"}, {"53", "Tây Ninh"}, {"54", "Thái Bình"}, {"55", "Thái Nguyên"},
            {"56", "Thanh Hóa"}, {"57", "Thừa Thiên Huế"}, {"58", "Tiền Giang"}, {"59", "Trà Vinh"}, {"60", "Tuyên Quang"},
            {"61", "Vĩnh Long"}, {"62", "Vĩnh Phúc"}, {"63", "Yên Bái"}
        };

        for (String[] loc : locations) {
            Location location = new Location();
            location.setId(Integer.parseInt(loc[0]));
            location.setLocation(loc[1]);
            locationRepository.save(location);
        }
    }
    
    private void createAdminAccount() {
        try {
            // Create admin user
            User adminUser = new User();
            adminUser.setUsername("Admin");
            adminUser.setPassword(passwordEncoder.encode("12345678"));
            adminUser.setEmail("admin@wingit.com");
            
            // Set admin role (ID = 2)
            Role adminRole = roleRepository.findById(2)
                .orElseThrow(() -> new RuntimeException("Admin role not found"));
            adminUser.setRole(adminRole);
            
            User savedUser = userRepository.save(adminUser);
            
            // Create admin user data
            UserData adminUserData = new UserData();
            adminUserData.setUser(savedUser);
            adminUserData.setDisplayName("Administrator");
            adminUserData.setBio("System Administrator Account");
            adminUserData.setCreatedAt(LocalDate.now());
            
            userDataRepository.save(adminUserData);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to create admin account: " + e.getMessage());
        }
    }
}
