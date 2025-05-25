package com.example.server.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentDTO {
    private Long id;
    private Long postId;
    private UserDTO author;
    private String text;
    private LocalDateTime createdDate;
    private LocalDateTime updatedAt;
    private List<CommentReplyDTO> replies;
}
