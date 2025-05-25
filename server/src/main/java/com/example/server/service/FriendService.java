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
public class FriendService {

    private final FriendRepository friendRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final UserRepository userRepository;
    private final RequestStatusRepository requestStatusRepository;

    @Autowired
    public FriendService(FriendRepository friendRepository, FriendRequestRepository friendRequestRepository,
                        UserRepository userRepository, RequestStatusRepository requestStatusRepository) {
        this.friendRepository = friendRepository;
        this.friendRequestRepository = friendRequestRepository;
        this.userRepository = userRepository;
        this.requestStatusRepository = requestStatusRepository;
    }

    public List<FriendDTO> getFriendsByUserId(Integer userId) {
        List<Friend> friendships = friendRepository.findAll().stream()
                .filter(friend -> friend.getUser1().getId().equals(userId) || friend.getUser2().getId().equals(userId))
                .collect(Collectors.toList());
        
        return friendships.stream()
                .map(friend -> convertToDTO(friend, userId))
                .collect(Collectors.toList());
    }

    public FriendRequestDTO sendFriendRequest(Integer senderId, Integer receiverId) {
        if (senderId.equals(receiverId)) {
            throw new RuntimeException("Cannot send friend request to yourself");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        // Check if friendship already exists
        boolean friendshipExists = friendRepository.findAll().stream()
                .anyMatch(friend -> 
                    (friend.getUser1().getId().equals(senderId) && friend.getUser2().getId().equals(receiverId)) ||
                    (friend.getUser1().getId().equals(receiverId) && friend.getUser2().getId().equals(senderId))
                );

        if (friendshipExists) {
            throw new RuntimeException("Users are already friends");
        }

        // Check if request already exists
        boolean requestExists = friendRequestRepository.findAll().stream()
                .anyMatch(request -> 
                    request.getSender().getId().equals(senderId) && 
                    request.getReceiver().getId().equals(receiverId) &&
                    "PENDING".equals(request.getStatus().getStatusName())
                );

        if (requestExists) {
            throw new RuntimeException("Friend request already sent");
        }

        RequestStatus pendingStatus = requestStatusRepository.findAll().stream()
                .filter(status -> "PENDING".equals(status.getStatusName()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Pending status not found"));

        FriendRequest friendRequest = new FriendRequest();
        friendRequest.setSender(sender);
        friendRequest.setReceiver(receiver);
        friendRequest.setStatus(pendingStatus);
        friendRequest.setRequestDate(LocalDateTime.now());

        FriendRequest savedRequest = friendRequestRepository.save(friendRequest);
        return convertRequestToDTO(savedRequest);
    }

    public List<FriendRequestDTO> getSentFriendRequests(Integer userId) {
        return friendRequestRepository.findAll().stream()
                .filter(request -> request.getSender().getId().equals(userId))
                .map(this::convertRequestToDTO)
                .collect(Collectors.toList());
    }

    public List<FriendRequestDTO> getReceivedFriendRequests(Integer userId) {
        return friendRequestRepository.findAll().stream()
                .filter(request -> request.getReceiver().getId().equals(userId))
                .map(this::convertRequestToDTO)
                .collect(Collectors.toList());
    }

    public FriendDTO acceptFriendRequest(Long requestId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Friend request not found"));

        RequestStatus acceptedStatus = requestStatusRepository.findAll().stream()
                .filter(status -> "ACCEPTED".equals(status.getStatusName()))
                .findFirst()
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
        return convertToDTO(savedFriendship, request.getReceiver().getId());
    }

    public void rejectFriendRequest(Long requestId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Friend request not found"));

        RequestStatus rejectedStatus = requestStatusRepository.findAll().stream()
                .filter(status -> "REJECTED".equals(status.getStatusName()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Rejected status not found"));

        request.setStatus(rejectedStatus);
        request.setResponseDate(LocalDateTime.now());
        friendRequestRepository.save(request);
    }

    public void removeFriend(Integer userId, Integer friendId) {
        Friend friendship = friendRepository.findAll().stream()
                .filter(friend -> 
                    (friend.getUser1().getId().equals(userId) && friend.getUser2().getId().equals(friendId)) ||
                    (friend.getUser1().getId().equals(friendId) && friend.getUser2().getId().equals(userId))
                )
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Friendship not found"));

        friendRepository.delete(friendship);
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
