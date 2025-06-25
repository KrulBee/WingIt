package com.example.server.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomUserDTO {
    private Long id;
    private Integer userId;
    private String username;
    private String displayName;
    private String profileImageUrl;
    private ZonedDateTime joinedAt;
    private Long chatRoomId;
    private String chatRoomName;
    private Boolean isGroupChat;
}
