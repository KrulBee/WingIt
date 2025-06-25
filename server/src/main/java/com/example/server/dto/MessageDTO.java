package com.example.server.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {
    private Long id;
    private Long chatRoomId;
    private Integer senderId;
    private UserDTO sender;
    private String content;
    private ZonedDateTime timestamp;
}
