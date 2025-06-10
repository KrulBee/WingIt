package com.example.server.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookmarkDTO {
    private Long id;
    private Integer userId;
    private Long postId;
    private LocalDateTime createdAt;
    private PostDTO post;    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PostDTO {
        private Long id;
        private String content;
        private LocalDateTime createdDate;
        private Integer userId;
        private UserDTO user;        private List<String> mediaUrls;
        private Integer likesCount;
        private Integer dislikesCount;
        private Integer commentsCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDTO {
        private Integer id;
        private String username;
        private String displayName;
        private String profilePicture;
    }
}
