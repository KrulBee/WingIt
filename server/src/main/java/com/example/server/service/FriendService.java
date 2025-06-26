package com.example.server.service;

import com.example.server.dto.*;
import com.example.server.model.Entity.*;
import com.example.server.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FriendService {    private final FriendRepository friendRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final UserRepository userRepository;
    private final RequestStatusRepository requestStatusRepository;
    private final ChatRoomService chatRoomService;    private final RoomUserRepository roomUserRepository;

    public FriendService(FriendRepository friendRepository, FriendRequestRepository friendRequestRepository,
                        UserRepository userRepository, RequestStatusRepository requestStatusRepository,
                        ChatRoomService chatRoomService, RoomUserRepository roomUserRepository) {
        this.friendRepository = friendRepository;
        this.friendRequestRepository = friendRequestRepository;
        this.userRepository = userRepository;
        this.requestStatusRepository = requestStatusRepository;
        this.chatRoomService = chatRoomService;
        this.roomUserRepository = roomUserRepository;
    }

    public List<FriendDTO> getFriendsByUserId(Integer userId) {
        List<Friend> friendships = friendRepository.findByUserIdWithDetails(userId);
        
        return friendships.stream()
                .map(friend -> convertToDTO(friend, userId))
                .collect(Collectors.toList());
    }    public FriendRequestDTO sendFriendRequest(Integer senderId, Integer receiverId) {
        System.out.println("Attempting to send friend request from user " + senderId + " to user " + receiverId);
        
        if (senderId.equals(receiverId)) {
            System.err.println("Error: User " + senderId + " tried to send friend request to themselves");
            throw new RuntimeException("Cannot send friend request to yourself");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> {
                    System.err.println("Error: Sender with ID " + senderId + " not found");
                    return new RuntimeException("Sender not found");
                });
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> {
                    System.err.println("Error: Receiver with ID " + receiverId + " not found");
                    return new RuntimeException("Receiver not found");
                });

        System.out.println("Found sender: " + sender.getUsername() + ", receiver: " + receiver.getUsername());

        // Check if friendship already exists
        boolean friendshipExists = friendRepository.existsBetweenUsers(senderId, receiverId);

        if (friendshipExists) {
            System.err.println("Error: Users " + senderId + " and " + receiverId + " are already friends");
            throw new RuntimeException("Users are already friends");
        }

        // Check if request already exists
        boolean requestExists = friendRequestRepository.existsPendingRequest(senderId, receiverId);

        if (requestExists) {
            System.err.println("Error: Friend request from " + senderId + " to " + receiverId + " already exists");
            throw new RuntimeException("Friend request already sent");
        }

        // Find pending status
        System.out.println("Looking for PENDING status in request statuses...");
        RequestStatus pendingStatus = requestStatusRepository.findByStatusName("PENDING")
                .orElseThrow(() -> {
                    System.err.println("Error: PENDING status not found in database");
                    System.out.println("Available statuses: " + 
                        requestStatusRepository.findAll().stream()
                            .map(s -> s.getStatusName())
                            .collect(Collectors.joining(", ")));
                    return new RuntimeException("Pending status not found");
                });

        System.out.println("Found pending status: " + pendingStatus.getStatusName());

        try {
            FriendRequest friendRequest = new FriendRequest();
            friendRequest.setSender(sender);
            friendRequest.setReceiver(receiver);
            friendRequest.setStatus(pendingStatus);
            friendRequest.setRequestDate(LocalDateTime.now());

            System.out.println("Saving friend request...");
            FriendRequest savedRequest = friendRequestRepository.save(friendRequest);
            System.out.println("Friend request saved successfully with ID: " + savedRequest.getId());
            
            return convertRequestToDTO(savedRequest);
        } catch (Exception e) {
            System.err.println("Error saving friend request: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to save friend request: " + e.getMessage());
        }
    }

    public List<FriendRequestDTO> getSentFriendRequests(Integer userId) {
        return friendRequestRepository.findBySenderIdWithDetails(userId).stream()
                .map(this::convertRequestToDTO)
                .collect(Collectors.toList());
    }

    public List<FriendRequestDTO> getReceivedFriendRequests(Integer userId) {
        return friendRequestRepository.findByReceiverIdWithDetails(userId).stream()
                .map(this::convertRequestToDTO)
                .collect(Collectors.toList());
    }    public FriendDTO acceptFriendRequest(Long requestId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Friend request not found"));

        RequestStatus acceptedStatus = requestStatusRepository.findByStatusName("ACCEPTED")
                .orElseThrow(() -> new RuntimeException("Accepted status not found"));

        request.setStatus(acceptedStatus);
        request.setResponseDate(LocalDateTime.now());
        friendRequestRepository.save(request);

        // Create friendship
        Friend friendship = new Friend();
        friendship.setUser1(request.getSender());
        friendship.setUser2(request.getReceiver());
        friendship.setFriendshipDate(LocalDateTime.now());

        Friend savedFriendship = friendRepository.save(friendship);
        
        // Automatically create a private chat room between the two users
        createPrivateChatRoomBetweenUsers(request.getSender().getId(), request.getReceiver().getId());
        
        return convertToDTO(savedFriendship, request.getReceiver().getId());
    }

    public void rejectFriendRequest(Long requestId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Friend request not found"));

        RequestStatus rejectedStatus = requestStatusRepository.findByStatusName("REJECTED")
                .orElseThrow(() -> new RuntimeException("Rejected status not found"));

        request.setStatus(rejectedStatus);
        request.setResponseDate(LocalDateTime.now());
        friendRequestRepository.save(request);
    }    public void removeFriend(Integer userId, Integer friendId) {
        Friend friendship = friendRepository.findFriendshipBetweenUsers(userId, friendId)
                .orElseThrow(() -> new RuntimeException("Friendship not found"));

        // Delete the friendship record
        friendRepository.delete(friendship);
        
        // Note: We keep the private chat room intact so users can preserve their conversation history
        // The chat room can be manually deleted by users if they choose to do so
    }

    /**
     * Creates a private chat room between two users if one doesn't already exist
     */
    private void createPrivateChatRoomBetweenUsers(Integer userId1, Integer userId2) {
        // Check if a private chat room already exists between these two users
        if (privateChatRoomExists(userId1, userId2)) {
            System.out.println("Private chat room already exists between users " + userId1 + " and " + userId2);
            return;
        }        try {
            // Verify both users exist
            userRepository.findById(userId1)
                    .orElseThrow(() -> new RuntimeException("User 1 not found"));
            userRepository.findById(userId2)
                    .orElseThrow(() -> new RuntimeException("User 2 not found"));

            // Use findOrCreatePrivateChat to ensure proper private chat creation
            chatRoomService.findOrCreatePrivateChat(userId1, userId2);
            
            System.out.println("Successfully created/found private chat room between users " + userId1 + " and " + userId2);
        } catch (Exception e) {
            System.err.println("Failed to create private chat room between users " + userId1 + " and " + userId2 + ": " + e.getMessage());
            // Don't throw exception here to avoid breaking friend acceptance if chat creation fails
        }
    }    /**
     * Checks if a private chat room already exists between two users
     */
    private boolean privateChatRoomExists(Integer userId1, Integer userId2) {
        // Get all chat rooms for user1
        List<RoomUser> user1Rooms = roomUserRepository.findByUserId(userId1);
        
        for (RoomUser roomUser1 : user1Rooms) {
            // Get all participants in this room
            List<RoomUser> roomParticipants = roomUserRepository
                    .findByChatRoomId(roomUser1.getChatRoom().getId());
            
            // Check if this is a 2-person room containing both users
            if (roomParticipants.size() == 2) {
                boolean containsUser1 = roomParticipants.stream()
                        .anyMatch(ru -> ru.getUser().getId().equals(userId1));
                boolean containsUser2 = roomParticipants.stream()
                        .anyMatch(ru -> ru.getUser().getId().equals(userId2));
                
                if (containsUser1 && containsUser2) {
                    return true;
                }
            }        }
        
        return false;
    }

    /**
     * Removes the private chat room between two users
     * Note: Currently not used automatically when unfriending, but available for manual chat deletion
     */
    /*
    private void removePrivateChatRoomBetweenUsers(Integer userId1, Integer userId2) {
        try {
            // Get all chat rooms for user1
            List<RoomUser> user1Rooms = roomUserRepository.findByUserId(userId1);
            
            for (RoomUser roomUser1 : user1Rooms) {
                // Get all participants in this room
                List<RoomUser> roomParticipants = roomUserRepository
                        .findByChatRoomId(roomUser1.getChatRoom().getId());
                
                // Check if this is a 2-person room containing both users
                if (roomParticipants.size() == 2) {
                    boolean containsUser1 = roomParticipants.stream()
                            .anyMatch(ru -> ru.getUser().getId().equals(userId1));
                    boolean containsUser2 = roomParticipants.stream()
                            .anyMatch(ru -> ru.getUser().getId().equals(userId2));
                    
                    if (containsUser1 && containsUser2) {
                        // This is the private chat room between these two users
                        Long chatRoomId = roomUser1.getChatRoom().getId();
                        
                        // Remove all room users (participants)
                        roomUserRepository.deleteAll(roomParticipants);
                        
                        // Delete the chat room itself
                        chatRoomService.deleteChatRoom(chatRoomId);
                        
                        System.out.println("Deleted private chat room " + chatRoomId + " between users " + userId1 + " and " + userId2);
                        break; // Found and deleted the room, exit loop
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error removing private chat room between users " + userId1 + " and " + userId2 + ": " + e.getMessage());
            // Don't throw the exception to avoid breaking the friend removal process
        }
    }
    */

    public List<UserDTO> getFriendSuggestions(Integer userId) {
        // Get current user's friend IDs efficiently
        Set<Integer> friendIds = new HashSet<>(friendRepository.findFriendIdsByUserId(userId));

        // Get pending friend request user IDs efficiently
        Set<Integer> pendingRequestIds = new HashSet<>(friendRequestRepository.findPendingRequestUserIds(userId));

        // Get all users (cached query - this is acceptable for suggestions)
        List<User> allUsers = userRepository.findAll();
        List<User> eligibleUsers = allUsers.stream()
                .filter(user -> !user.getId().equals(userId) &&
                               !friendIds.contains(user.getId()) &&
                               !pendingRequestIds.contains(user.getId()))
                .collect(Collectors.toList());

        // For suggestions, we'll use a simpler approach to avoid N+1 queries
        // Instead of calculating exact mutual friends, we'll prioritize by user activity
        List<UserDTO> suggestions = eligibleUsers.stream()
                .limit(50) // Limit to first 50 eligible users to avoid performance issues
                .map(user -> {
                    // Create UserDTO
                    UserDTO userDTO = new UserDTO();
                    userDTO.setId(user.getId());
                    userDTO.setUsername(user.getUsername());

                    // Get user data from UserData entity
                    String displayName = user.getUserData() != null ? user.getUserData().getDisplayName() : null;
                    String profilePicture = user.getUserData() != null ? user.getUserData().getProfilePicture() : null;
                    String bio = user.getUserData() != null ? user.getUserData().getBio() : null;

                    userDTO.setDisplayName(displayName);
                    userDTO.setProfilePicture(profilePicture);
                    userDTO.setBio(bio);

                    // Calculate simple suggestion score based on profile completeness
                    int score = 1; // Base score
                    if (displayName != null && !displayName.isEmpty()) score += 2;
                    if (profilePicture != null && !profilePicture.isEmpty()) score += 2;
                    if (bio != null && !bio.isEmpty()) score += 1;

                    // Store score in a custom field (we'll use email field temporarily for sorting)
                    userDTO.setEmail(String.valueOf(score));

                    return userDTO;
                })
                .sorted((a, b) -> Integer.compare(Integer.parseInt(b.getEmail()), Integer.parseInt(a.getEmail())))
                .limit(10)
                .peek(userDTO -> userDTO.setEmail(null)) // Clear the temporary score field
                .collect(Collectors.toList());

        return suggestions;
    }

    /**
     * Check if two users are friends
     * @param userId1 First user ID
     * @param userId2 Second user ID
     * @return true if users are friends, false otherwise
     */
    public boolean areFriends(Integer userId1, Integer userId2) {
        return friendRepository.findAll().stream()
                .anyMatch(friend -> 
                    (friend.getUser1().getId().equals(userId1) && friend.getUser2().getId().equals(userId2)) ||
                    (friend.getUser1().getId().equals(userId2) && friend.getUser2().getId().equals(userId1))
                );
    }

    private FriendDTO convertToDTO(Friend friend, Integer currentUserId) {
        FriendDTO dto = new FriendDTO();
        dto.setId(friend.getId());
        dto.setFriendshipDate(friend.getFriendshipDate());

        // Determine which user is the friend
        User friendUser = friend.getUser1().getId().equals(currentUserId) ? 
                         friend.getUser2() : friend.getUser1();

        UserDTO friendDTO = new UserDTO();
        friendDTO.setId(friendUser.getId());
        friendDTO.setUsername(friendUser.getUsername());
        if (friendUser.getUserData() != null) {
            friendDTO.setDisplayName(friendUser.getUserData().getDisplayName());
            friendDTO.setBio(friendUser.getUserData().getBio());
            friendDTO.setProfilePicture(friendUser.getUserData().getProfilePicture());
        }
        dto.setFriend(friendDTO);

        return dto;
    }

    private FriendRequestDTO convertRequestToDTO(FriendRequest request) {
        FriendRequestDTO dto = new FriendRequestDTO();
        dto.setId(request.getId());
        dto.setStatus(request.getStatus().getStatusName());
        dto.setRequestDate(request.getRequestDate());
        dto.setResponseDate(request.getResponseDate());

        // Convert sender
        UserDTO senderDTO = new UserDTO();
        senderDTO.setId(request.getSender().getId());
        senderDTO.setUsername(request.getSender().getUsername());
        if (request.getSender().getUserData() != null) {
            senderDTO.setDisplayName(request.getSender().getUserData().getDisplayName());
            senderDTO.setProfilePicture(request.getSender().getUserData().getProfilePicture());
        }
        dto.setSender(senderDTO);

        // Convert receiver
        UserDTO receiverDTO = new UserDTO();
        receiverDTO.setId(request.getReceiver().getId());
        receiverDTO.setUsername(request.getReceiver().getUsername());
        if (request.getReceiver().getUserData() != null) {
            receiverDTO.setDisplayName(request.getReceiver().getUserData().getDisplayName());
            receiverDTO.setProfilePicture(request.getReceiver().getUserData().getProfilePicture());
        }
        dto.setReceiver(receiverDTO);

        return dto;
    }
}
