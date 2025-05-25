package com.example.server.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentReplyDTO {
    private Long id;
    private Long commentId;
    private UserDTO author;
    private String text;
    private LocalDateTime createdDate;
    private LocalDateTime updatedAt;
}
