package com.example.server.controller;

import com.example.server.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    @Autowired
    private CloudinaryService cloudinaryService;

    /**
     * Upload a media file (image/video) to Cloudinary
     * 
     * @param file The file to upload
     * @param type The type of media (e.g., "post", "profile")
     * @return The URL of the uploaded file
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadMedia(
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type) {
        
        try {
            String folder = "wingit/" + type;
            String mediaUrl = cloudinaryService.uploadFile(file, folder);
            
            Map<String, String> response = new HashMap<>();
            response.put("url", mediaUrl);
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload media: " + e.getMessage());
        }
    }

    /**
     * Delete a media file from Cloudinary
     * 
     * @param url The URL of the file to delete
     * @return Success or error message
     */
    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteMedia(@RequestParam("url") String url) {
        try {
            cloudinaryService.deleteFile(url);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Media deleted successfully");
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete media: " + e.getMessage());
        }
    }
}
