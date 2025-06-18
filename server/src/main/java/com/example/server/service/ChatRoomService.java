package com.example.server.service;

import com.example.server.dto.*;
import com.example.server.model.Entity.*;
import com.example.server.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;
    private final RoomUserRepository roomUserRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @Autowired
    public ChatRoomService(ChatRoomRepository chatRoomRepository, RoomUserRepository roomUserRepository,
                          MessageRepository messageRepository, UserRepository userRepository) {
        this.chatRoomRepository = chatRoomRepository;
        this.roomUserRepository = roomUserRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }    public List<ChatRoomDTO> getChatRoomsByUserId(Integer userId) {
        List<RoomUser> userRooms = roomUserRepository.findByUserId(userId);
        
        return userRooms.stream()
                .map(roomUser -> convertToDTO(roomUser.getChatRoom()))
                .collect(Collectors.toList());
    }

    public ChatRoomDTO getChatRoomById(Long id) {
        ChatRoom chatRoom = chatRoomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));
        return convertToDTO(chatRoom);
    }    public ChatRoomDTO createChatRoom(CreateChatRoomRequest request, Integer creatorId) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("Creator not found"));        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setRoomName(request.getRoomName());
        chatRoom.setIsGroupChat(request.isGroupChat()); // Fix: Set group chat flag properly
        chatRoom.setCreatedDate(LocalDateTime.now());

        ChatRoom savedChatRoom = chatRoomRepository.save(chatRoom);

        // Add creator to the room
        RoomUser creatorRoomUser = new RoomUser();
        creatorRoomUser.setChatRoom(savedChatRoom);
        creatorRoomUser.setUser(creator);
        creatorRoomUser.setJoinedAt(LocalDateTime.now());
        roomUserRepository.save(creatorRoomUser);

        // Add other participants if provided
        if (request.getParticipantIds() != null) {
            for (Integer participantId : request.getParticipantIds()) {
                if (!participantId.equals(creatorId)) {
                    User participant = userRepository.findById(participantId)
                            .orElseThrow(() -> new RuntimeException("Participant not found: " + participantId));
                    
                    RoomUser roomUser = new RoomUser();
                    roomUser.setChatRoom(savedChatRoom);
                    roomUser.setUser(participant);
                    roomUser.setJoinedAt(LocalDateTime.now());
                    roomUserRepository.save(roomUser);
                }
            }
        }

        return convertToDTO(savedChatRoom);
    }

    /**
     * Find or create a private chat between two users
     */
    public ChatRoomDTO findOrCreatePrivateChat(Integer userId1, Integer userId2) {
        // Check if a private chat already exists between these two users
        ChatRoom existingChat = chatRoomRepository.findPrivateChatBetweenUsers(userId1, userId2);
        
        if (existingChat != null) {
            System.out.println("Found existing private chat: " + existingChat.getId());
            return convertToDTO(existingChat);
        }
        
        // Create new private chat
        System.out.println("Creating new private chat between users " + userId1 + " and " + userId2);
        
        User user1 = userRepository.findById(userId1)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId1));
        User user2 = userRepository.findById(userId2)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId2));

        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setRoomName("Private Chat"); // Generic name for private chats
        chatRoom.setIsGroupChat(false);
        chatRoom.setCreatedDate(LocalDateTime.now());

        ChatRoom savedChatRoom = chatRoomRepository.save(chatRoom);

        // Add both users to the room
        RoomUser roomUser1 = new RoomUser();
        roomUser1.setChatRoom(savedChatRoom);
        roomUser1.setUser(user1);
        roomUser1.setJoinedAt(LocalDateTime.now());
        roomUserRepository.save(roomUser1);

        RoomUser roomUser2 = new RoomUser();
        roomUser2.setChatRoom(savedChatRoom);
        roomUser2.setUser(user2);
        roomUser2.setJoinedAt(LocalDateTime.now());
        roomUserRepository.save(roomUser2);

        return convertToDTO(savedChatRoom);
    }public void joinChatRoom(Long chatRoomId, Integer userId) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user is already in the room
        if (roomUserRepository.existsByChatRoomIdAndUserId(chatRoomId, userId)) {
            throw new RuntimeException("User already in chat room");
        }

        RoomUser roomUser = new RoomUser();
        roomUser.setChatRoom(chatRoom);
        roomUser.setUser(user);
        roomUser.setJoinedAt(LocalDateTime.now());
        roomUserRepository.save(roomUser);
    }    public void leaveChatRoom(Long chatRoomId, Integer userId) {
        RoomUser roomUser = roomUserRepository.findByChatRoomIdAndUserId(chatRoomId, userId)
                .orElseThrow(() -> new RuntimeException("User not in chat room"));

        roomUserRepository.delete(roomUser);
    }    /**
     * Deletes a chat room completely (used when friends unfriend each other)
     */
    public void deleteChatRoom(Long chatRoomId) {
        try {
            // First delete all messages in the chat room
            List<Message> messages = messageRepository.findByChatRoomIdOrderByTimestampAsc(chatRoomId);
            if (!messages.isEmpty()) {
                messageRepository.deleteAll(messages);
            }
            
            // Then delete all room users
            List<RoomUser> roomUsers = roomUserRepository.findByChatRoomId(chatRoomId);
            if (!roomUsers.isEmpty()) {
                roomUserRepository.deleteAll(roomUsers);
            }
            
            // Finally delete the chat room itself
            chatRoomRepository.deleteById(chatRoomId);
            
            System.out.println("Successfully deleted chat room " + chatRoomId + " and all associated data");
        } catch (Exception e) {
            System.err.println("Error deleting chat room " + chatRoomId + ": " + e.getMessage());
            throw new RuntimeException("Failed to delete chat room", e);
        }
    }

    public List<MessageDTO> getChatRoomMessages(Long chatRoomId) {
        return messageRepository.findByChatRoomIdOrderByTimestampAsc(chatRoomId).stream()
                .map(this::convertMessageToDTO)
                .collect(Collectors.toList());
    }    public MessageDTO sendMessage(Long chatRoomId, CreateMessageRequest request, Integer senderId) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));
        
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify user is in the chat room
        if (!roomUserRepository.existsByChatRoomIdAndUserId(chatRoomId, senderId)) {
            throw new RuntimeException("User not in chat room");
        }

        Message message = new Message();
        message.setChatRoom(chatRoom);
        message.setSender(sender);
        message.setContent(request.getContent());
        message.setTimestamp(LocalDateTime.now());

        Message savedMessage = messageRepository.save(message);
        return convertMessageToDTO(savedMessage);
    }

    private ChatRoomDTO convertToDTO(ChatRoom chatRoom) {
        ChatRoomDTO dto = new ChatRoomDTO();
        dto.setId(chatRoom.getId());
        dto.setRoomName(chatRoom.getRoomName());
        dto.setCreatedDate(chatRoom.getCreatedDate());        // Get participants
        List<RoomUser> roomUsers = roomUserRepository.findByChatRoomId(chatRoom.getId());

        List<UserDTO> participants = roomUsers.stream()
                .map(roomUser -> {
                    UserDTO userDTO = new UserDTO();
                    userDTO.setId(roomUser.getUser().getId());
                    userDTO.setUsername(roomUser.getUser().getUsername());
                    if (roomUser.getUser().getUserData() != null) {
                        userDTO.setDisplayName(roomUser.getUser().getUserData().getDisplayName());
                        userDTO.setProfilePicture(roomUser.getUser().getUserData().getProfilePicture());
                    }
                    return userDTO;
                })
                .collect(Collectors.toList());

        dto.setParticipants(participants);
        dto.setGroupChat(participants.size() > 2);        // Get last message
        List<Message> messages = messageRepository.findByChatRoomIdOrderByTimestampDesc(chatRoom.getId());

        if (!messages.isEmpty()) {
            dto.setLastMessage(convertMessageToDTO(messages.get(0)));
        }

        return dto;
    }    private MessageDTO convertMessageToDTO(Message message) {
        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setChatRoomId(message.getChatRoom().getId());
        dto.setSenderId(message.getSender().getId());
        dto.setContent(message.getContent());
        dto.setTimestamp(message.getTimestamp());

        UserDTO senderDTO = new UserDTO();
        senderDTO.setId(message.getSender().getId());
        senderDTO.setUsername(message.getSender().getUsername());
        if (message.getSender().getUserData() != null) {
            senderDTO.setDisplayName(message.getSender().getUserData().getDisplayName());
            senderDTO.setProfilePicture(message.getSender().getUserData().getProfilePicture());
        }
        dto.setSender(senderDTO);

        return dto;
    }
}
