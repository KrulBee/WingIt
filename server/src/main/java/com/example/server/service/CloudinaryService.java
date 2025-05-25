package com.example.server.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    /**
     * Upload a file to Cloudinary
     * 
     * @param file The file to upload
     * @param folder The folder in Cloudinary to store the file (e.g., "posts", "profile_pictures")
     * @return The URL of the uploaded file
     * @throws IOException If there's an error during upload
     */
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        try {
            // Generate a unique public ID for the file
            String publicId = folder + "/" + UUID.randomUUID().toString();
            
            // Upload file to Cloudinary
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                    "public_id", publicId,
                    "resource_type", "auto" // Automatically detect file type
                )
            );
            
            // Return the secure URL of the uploaded file
            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            throw new IOException("Failed to upload file to Cloudinary", e);
        }
    }
    
    /**
     * Delete a file from Cloudinary by URL
     * 
     * @param url The URL of the file to delete
     * @throws IOException If there's an error during deletion
     */
    public void deleteFile(String url) throws IOException {
        try {
            // Extract the public ID from the Cloudinary URL
            String publicId = extractPublicIdFromUrl(url);
            
            if (publicId != null) {
                // Delete the file from Cloudinary
                cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.emptyMap()
                );
            }
        } catch (IOException e) {
            throw new IOException("Failed to delete file from Cloudinary", e);
        }
    }
    
    /**
     * Helper method to extract the public ID from a Cloudinary URL
     * 
     * @param url The Cloudinary URL
     * @return The public ID of the file
     */
    private String extractPublicIdFromUrl(String url) {
        if (url == null || url.isEmpty()) {
            return null;
        }
        
        try {
            // Extract the path part of the URL
            String path = url.substring(url.indexOf("/image/upload/") + 14);
            
            // Extract the public ID (without the file extension)
            int lastDotIndex = path.lastIndexOf('.');
            if (lastDotIndex != -1) {
                path = path.substring(0, lastDotIndex);
            }
            
            return path;
        } catch (Exception e) {
            return null;
        }
    }
}
