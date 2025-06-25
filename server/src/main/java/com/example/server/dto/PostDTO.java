package com.example.server.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.ZonedDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostDTO {
    private Long id;
    private String content;
    private ZonedDateTime createdDate;
    private ZonedDateTime updatedAt;
    private UserDTO author;
    private PostTypeDTO type;
    private LocationDTO location;
    private List<PostMediaDTO> media;
    private List<CommentDTO> comments;
    private List<PostReactionDTO> reactions;
    private int likesCount;
    private int commentsCount;
    private boolean liked; // Whether current user liked this post
}
