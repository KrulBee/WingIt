package com.example.server.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostMediaDTO {
    private Long id;
    private Long postId;
    private String mediaUrl;
    private String mediaType; // IMAGE, VIDEO, etc.
    private ZonedDateTime uploadedAt;
}
