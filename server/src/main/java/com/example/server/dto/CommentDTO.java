package com.example.server.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.ZonedDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentDTO {
    private Long id;
    private Long postId;
    private UserDTO author;
    private String text;
    private ZonedDateTime createdDate;
    private ZonedDateTime updatedAt;
    private Boolean isReply;
    private List<CommentDTO> replies; // Changed from CommentReplyDTO to CommentDTO
}
