package com.example.server.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePostRequest {
    private String content;
    private Long typeId;
    private List<String> mediaUrls;
    private Integer locationId;
}
