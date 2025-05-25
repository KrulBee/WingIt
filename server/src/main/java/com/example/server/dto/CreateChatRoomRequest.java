package com.example.server.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateChatRoomRequest {
    private String roomName;
    private List<Integer> participantIds;
    private boolean isGroupChat;
}
