package com.example.server.service;

import com.example.server.repository.RoomUserRepository;
import com.example.server.repository.ChatRoomRepository;
import com.example.server.repository.UserRepository;
import com.example.server.dto.RoomUserDTO;
import com.example.server.model.Entity.RoomUser;
import com.example.server.model.Entity.ChatRoom;
import com.example.server.model.Entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.ZonedDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoomUserService {

    private final RoomUserRepository roomUserRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;

    @Autowired
    public RoomUserService(RoomUserRepository roomUserRepository, ChatRoomRepository chatRoomRepository, UserRepository userRepository) {
        this.roomUserRepository = roomUserRepository;
        this.chatRoomRepository = chatRoomRepository;
        this.userRepository = userRepository;
    }

    /**
     * Get all users in a specific chat room
     */
    public List<RoomUserDTO> getRoomUsers(Long roomId) {
        List<RoomUser> roomUsers = roomUserRepository.findByChatRoomId(roomId);
        return roomUsers.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }    /**
     * Check if a user is a member of a specific room
     */
    public boolean isUserInRoom(Integer userId, Long roomId) {
        return roomUserRepository.findByChatRoomIdAndUserId(roomId, userId).isPresent();
    }

    /**
     * Check if a room is a group chat
     */
    public boolean isGroupChat(Long roomId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));
        return chatRoom.getIsGroupChat();
    }

    /**
     * Add user to room (only for group chats)
     */
    public RoomUserDTO addUserToRoom(Long roomId, Integer userId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));
        
        if (!chatRoom.getIsGroupChat()) {
            throw new RuntimeException("Cannot add users to private chats");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user is already in room
        if (isUserInRoom(userId, roomId)) {
            throw new RuntimeException("User is already in this room");
        }

        RoomUser roomUser = new RoomUser();
        roomUser.setChatRoom(chatRoom);
        roomUser.setUser(user);
        roomUser.setJoinedAt(ZonedDateTime.now(ZoneOffset.UTC));

        RoomUser savedRoomUser = roomUserRepository.save(roomUser);
        return convertToDTO(savedRoomUser);
    }

    /**
     * Remove user from room (only for group chats)
     */
    public void removeUserFromRoom(Long roomId, Integer userId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));
        
        if (!chatRoom.getIsGroupChat()) {
            throw new RuntimeException("Cannot remove users from private chats");
        }        RoomUser roomUser = roomUserRepository.findByChatRoomIdAndUserId(roomId, userId)
                .orElseThrow(() -> new RuntimeException("User not found in this room"));

        roomUserRepository.delete(roomUser);
    }    /**
     * Convert RoomUser entity to DTO
     */
    private RoomUserDTO convertToDTO(RoomUser roomUser) {
        RoomUserDTO dto = new RoomUserDTO();
        dto.setId(roomUser.getId());
        dto.setUserId(roomUser.getUser().getId());
        dto.setUsername(roomUser.getUser().getUsername());
        dto.setDisplayName(roomUser.getUser().getUserData() != null ? 
                           roomUser.getUser().getUserData().getDisplayName() : 
                           roomUser.getUser().getUsername());        dto.setProfileImageUrl(roomUser.getUser().getUserData() != null ? 
                              roomUser.getUser().getUserData().getProfilePicture() : null);
        dto.setJoinedAt(roomUser.getJoinedAt());
        dto.setChatRoomId(roomUser.getChatRoom().getId());
        dto.setChatRoomName(roomUser.getChatRoom().getRoomName());
        dto.setIsGroupChat(roomUser.getChatRoom().getIsGroupChat());
        return dto;
    }
}
