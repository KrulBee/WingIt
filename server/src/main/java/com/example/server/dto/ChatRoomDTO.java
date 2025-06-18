package com.example.server.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomDTO {
    private Long id;
    private String roomName;
    private List<UserDTO> participants;
    private MessageDTO lastMessage;
    private LocalDateTime createdDate;
    
    @JsonProperty("isGroupChat")
    private boolean groupChat;
}
