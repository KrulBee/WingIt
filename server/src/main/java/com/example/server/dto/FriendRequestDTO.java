package com.example.server.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FriendRequestDTO {
    private Long id;
    private UserDTO sender;
    private UserDTO receiver;
    private String status; // PENDING, ACCEPTED, DECLINED
    private LocalDateTime requestDate;
    private LocalDateTime responseDate;
}
