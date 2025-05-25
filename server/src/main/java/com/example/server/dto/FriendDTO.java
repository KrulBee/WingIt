package com.example.server.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FriendDTO {
    private Long id;
    private UserDTO friend; // The other user in the friendship
    private LocalDateTime friendshipDate;
}
