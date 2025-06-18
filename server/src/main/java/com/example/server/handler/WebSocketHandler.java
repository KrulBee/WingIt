package com.example.server.handler;

import com.example.server.config.JwtService;
import com.example.server.model.Entity.User;
import com.example.server.model.Entity.RoomUser;
import com.example.server.model.Entity.UserSettings;
import com.example.server.repository.UserRepository;
import com.example.server.repository.RoomUserRepository;
import com.example.server.repository.UserSettingsRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebSocketHandler extends TextWebSocketHandler {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketHandler.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // Store active WebSocket sessions with user information
    private final Map<String, WebSocketSession> userSessions = new ConcurrentHashMap<>();
    private final Map<String, String> sessionToUser = new ConcurrentHashMap<>();    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoomUserRepository roomUserRepository;
    
    @Autowired
    private UserSettingsRepository userSettingsRepository;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        logger.info("WebSocket connection established: {}", session.getId());
        
        // Send a welcome message to confirm connection
        sendMessage(session, createMessage("connection", "connected", "WebSocket connection established"));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try {
            String payload = message.getPayload();
            JsonNode jsonNode = objectMapper.readTree(payload);
            String type = jsonNode.get("type").asText();
            
            logger.info("Received WebSocket message - Type: {}, SessionId: {}", type, session.getId());

            switch (type) {
                case "authenticate":
                    handleAuthentication(session, jsonNode);
                    break;                case "message":
                    handleChatMessage(session, jsonNode);
                    break;
                case "typing":
                    handleTypingIndicator(session, jsonNode);
                    break;
                case "notification":
                    handleNotification(session, jsonNode);
                    break;
                case "status_request":
                    handleStatusRequest(session);
                    break;
                case "ping":
                    handlePing(session);
                    break;
                default:
                    logger.warn("Unknown message type: {}", type);
                    sendErrorMessage(session, "Unknown message type: " + type);
            }
        } catch (Exception e) {
            logger.error("Error handling WebSocket message", e);
            sendErrorMessage(session, "Error processing message: " + e.getMessage());
        }
    }

    private void handleAuthentication(WebSocketSession session, JsonNode jsonNode) throws IOException {
        try {
            String token = jsonNode.get("token").asText();
            
            if (jwtService.validateToken(token)) {
                String username = jwtService.getUsernameFromJWT(token);
                User user = userRepository.findByUsername(username);
                
                if (user != null) {
                    // Store the authenticated session
                    userSessions.put(username, session);
                    sessionToUser.put(session.getId(), username);
                    
                    logger.info("User {} authenticated via WebSocket", username);
                    sendMessage(session, createMessage("auth", "success", "Authentication successful"));
                    
                    // Notify other users that this user is online
                    broadcastUserStatus(username, "online");
                } else {
                    sendErrorMessage(session, "User not found");
                }
            } else {
                sendErrorMessage(session, "Invalid token");
            }
        } catch (Exception e) {
            logger.error("Authentication error", e);
            sendErrorMessage(session, "Authentication failed");
        }
    }    private void handleChatMessage(WebSocketSession session, JsonNode jsonNode) throws IOException {
        String username = sessionToUser.get(session.getId());
        if (username == null) {
            sendErrorMessage(session, "Not authenticated");
            return;
        }

        try {
            // Handle both direct message format and nested data format
            String content = null;
            String recipientUsername = null;
            String roomId = null;
            
            // Check if message has nested 'data' structure
            if (jsonNode.has("data") && jsonNode.get("data").isObject()) {
                JsonNode dataNode = jsonNode.get("data");
                content = dataNode.has("content") ? dataNode.get("content").asText() : null;
                recipientUsername = dataNode.has("recipient") ? dataNode.get("recipient").asText() : null;
                roomId = dataNode.has("roomId") ? dataNode.get("roomId").asText() : null;
            } else {
                // Direct message format
                content = jsonNode.has("content") ? jsonNode.get("content").asText() : null;
                recipientUsername = jsonNode.has("recipient") ? jsonNode.get("recipient").asText() : null;
                roomId = jsonNode.has("roomId") ? jsonNode.get("roomId").asText() : null;
            }
            
            // Validate required fields
            if (content == null || content.trim().isEmpty()) {
                sendErrorMessage(session, "Message content is required");
                return;
            }            // Create message object in format expected by frontend
            String messageData = objectMapper.writeValueAsString(Map.of(
                "type", "message",
                "id", System.currentTimeMillis(), // Temporary ID for real-time message
                "roomId", roomId != null ? Long.parseLong(roomId) : 0,
                "senderId", userRepository.findByUsername(username).getId(),
                "content", content,
                "messageType", "TEXT",
                "createdDate", java.time.LocalDateTime.now().toString(),
                "sender", Map.of(
                    "id", userRepository.findByUsername(username).getId(),
                    "username", username,
                    "displayName", userRepository.findByUsername(username).getUserData() != null ? 
                        userRepository.findByUsername(username).getUserData().getDisplayName() : username
                )
            ));

            if (recipientUsername != null) {
                // Direct message to specific user
                WebSocketSession recipientSession = userSessions.get(recipientUsername);
                if (recipientSession != null && recipientSession.isOpen()) {
                    recipientSession.sendMessage(new TextMessage(messageData));
                }
                // Also send back to sender for confirmation
                sendMessage(session, messageData);            } else if (roomId != null) {
                // Broadcast to users in the specific room only
                try {
                    Long roomIdLong = Long.parseLong(roomId);
                    broadcastToRoom(messageData, roomIdLong, username);
                } catch (NumberFormatException e) {
                    logger.error("Invalid roomId format: {}", roomId);
                    sendErrorMessage(session, "Invalid room ID");
                    return;
                }
            }

            logger.info("Chat message from {} to {}: {}", username, 
                       recipientUsername != null ? recipientUsername : "room:" + roomId, content);
                       
        } catch (Exception e) {
            logger.error("Error handling chat message", e);
            sendErrorMessage(session, "Error sending message");
        }
    }

    private void handleTypingIndicator(WebSocketSession session, JsonNode jsonNode) throws IOException {
        String username = sessionToUser.get(session.getId());
        if (username == null) {
            sendErrorMessage(session, "Not authenticated");
            return;
        }

        try {
            String recipientUsername = jsonNode.has("recipient") ? jsonNode.get("recipient").asText() : null;
            boolean isTyping = jsonNode.get("isTyping").asBoolean();

            String typingData = objectMapper.writeValueAsString(Map.of(
                "type", "typing",
                "user", username,
                "isTyping", isTyping,
                "timestamp", System.currentTimeMillis()
            ));

            if (recipientUsername != null) {
                WebSocketSession recipientSession = userSessions.get(recipientUsername);
                if (recipientSession != null && recipientSession.isOpen()) {
                    recipientSession.sendMessage(new TextMessage(typingData));
                }
            } else {
                // Broadcast typing indicator to all users
                broadcastMessage(typingData, username);
            }

        } catch (Exception e) {
            logger.error("Error handling typing indicator", e);
        }
    }

    private void handleNotification(WebSocketSession session, JsonNode jsonNode) throws IOException {
        String username = sessionToUser.get(session.getId());
        if (username == null) {
            sendErrorMessage(session, "Not authenticated");
            return;
        }

        try {
            String notificationType = jsonNode.get("notificationType").asText();
            String content = jsonNode.get("content").asText();
            String targetUser = jsonNode.has("targetUser") ? jsonNode.get("targetUser").asText() : null;

            String notificationData = objectMapper.writeValueAsString(Map.of(
                "type", "notification",
                "notificationType", notificationType,
                "content", content,
                "sender", username,
                "timestamp", System.currentTimeMillis()
            ));

            if (targetUser != null) {
                WebSocketSession targetSession = userSessions.get(targetUser);
                if (targetSession != null && targetSession.isOpen()) {
                    targetSession.sendMessage(new TextMessage(notificationData));
                }
            } else {
                // Broadcast notification to all users
                broadcastMessage(notificationData, username);
            }

            logger.info("Notification from {}: {} - {}", username, notificationType, content);

        } catch (Exception e) {
            logger.error("Error handling notification", e);
            sendErrorMessage(session, "Error sending notification");
        }
    }

    private void handlePing(WebSocketSession session) throws IOException {
        sendMessage(session, createMessage("pong", "success", "pong"));
    }    private void broadcastUserStatus(String username, String status) {
        try {
            // Get user ID from username
            User user = userRepository.findByUsername(username);
            if (user == null) {
                logger.warn("User not found for status broadcast: {}", username);
                return;
            }
              // Check user's privacy setting - only broadcast if they allow showing online status
            UserSettings userSettings = userSettingsRepository.findByUserId(user.getId()).orElse(null);
            if (userSettings != null && userSettings.getShowOnlineStatus() != null && !userSettings.getShowOnlineStatus()) {
                logger.debug("User {} has disabled online status visibility, skipping broadcast", username);
                return;
            }
            
            // Create proper status data structure
            Map<String, Object> statusData = Map.of(
                "userId", user.getId(),
                "username", username,
                "isOnline", "online".equals(status),
                "presence", status
            );
            
            String statusMessage = createMessage("userStatus", status, statusData);
            broadcastMessage(statusMessage, username);
        } catch (Exception e) {
            logger.error("Error broadcasting user status", e);
        }
    }

    private void broadcastToRoom(String message, Long roomId, String excludeUser) {
        try {
            // Get all users in the room from the database
            List<RoomUser> roomUsers = roomUserRepository.findByChatRoomId(roomId);
            
            logger.info("Broadcasting message to room {} with {} participants", roomId, roomUsers.size());
            
            // Send message to each user in the room (excluding the sender)
            roomUsers.parallelStream()
                .map(roomUser -> roomUser.getUser().getUsername())
                .filter(username -> !username.equals(excludeUser))
                .forEach(username -> {
                    WebSocketSession session = userSessions.get(username);
                    if (session != null && session.isOpen()) {
                        try {
                            session.sendMessage(new TextMessage(message));
                            logger.debug("Sent message to user {} in room {}", username, roomId);
                        } catch (IOException e) {
                            logger.error("Error sending message to user {} in room {}", username, roomId, e);
                        }
                    } else {
                        logger.debug("User {} not connected or session closed", username);
                    }
                });
                
        } catch (Exception e) {
            logger.error("Error broadcasting message to room {}", roomId, e);
        }
    }

    private void broadcastMessage(String message, String excludeUser) {
        userSessions.entrySet().parallelStream()
            .filter(entry -> !entry.getKey().equals(excludeUser))
            .forEach(entry -> {
                try {
                    WebSocketSession session = entry.getValue();
                    if (session.isOpen()) {
                        session.sendMessage(new TextMessage(message));
                    }
                } catch (IOException e) {
                    logger.error("Error broadcasting message to user {}", entry.getKey(), e);
                }
            });
    }

    private void sendMessage(WebSocketSession session, String message) throws IOException {
        if (session.isOpen()) {
            session.sendMessage(new TextMessage(message));
        }
    }

    private void sendErrorMessage(WebSocketSession session, String error) throws IOException {
        sendMessage(session, createMessage("error", "error", error));
    }    private String createMessage(String type, String status, String data) {
        try {
            return objectMapper.writeValueAsString(Map.of(
                "type", type,
                "status", status,
                "data", data,
                "timestamp", System.currentTimeMillis()
            ));
        } catch (Exception e) {
            logger.error("Error creating message", e);
            return "{\"type\":\"error\",\"status\":\"error\",\"data\":\"Failed to create message\"}";
        }
    }

    private String createMessage(String type, String status, Object data) {
        try {
            return objectMapper.writeValueAsString(Map.of(
                "type", type,
                "status", status,
                "data", data,
                "timestamp", System.currentTimeMillis()
            ));
        } catch (Exception e) {
            logger.error("Error creating message", e);
            return "{\"type\":\"error\",\"status\":\"error\",\"data\":\"Failed to create message\"}";
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        logger.error("WebSocket transport error for session {}", session.getId(), exception);
        cleanupSession(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        logger.info("WebSocket connection closed: {} - Status: {}", session.getId(), status);
        cleanupSession(session);
    }

    private void cleanupSession(WebSocketSession session) {
        String username = sessionToUser.remove(session.getId());
        if (username != null) {
            userSessions.remove(username);
            logger.info("Cleaned up session for user: {}", username);
            
            // Notify other users that this user is offline
            broadcastUserStatus(username, "offline");
        }
    }

    // Public method to send notifications from other parts of the application
    public void sendNotificationToUser(String username, String notificationType, String content) {
        WebSocketSession session = userSessions.get(username);
        if (session != null && session.isOpen()) {
            try {
                String notificationData = objectMapper.writeValueAsString(Map.of(
                    "type", "notification",
                    "notificationType", notificationType,
                    "content", content,
                    "timestamp", System.currentTimeMillis()
                ));
                session.sendMessage(new TextMessage(notificationData));
                logger.info("Sent notification to {}: {}", username, content);
            } catch (IOException e) {
                logger.error("Error sending notification to user {}", username, e);
            }
        }
    }

    // Public method to check if user is online
    public boolean isUserOnline(String username) {
        WebSocketSession session = userSessions.get(username);
        return session != null && session.isOpen();
    }

    // Public method to get active user count
    public int getActiveUserCount() {
        return (int) userSessions.values().stream()
                .filter(WebSocketSession::isOpen)
                .count();
    }

    private void handleStatusRequest(WebSocketSession session) throws IOException {
        try {
            String username = getUsernameFromSession(session);
            if (username == null) {
                sendErrorMessage(session, "User not authenticated");
                return;
            }

            // Get list of currently online users
            List<Map<String, Object>> onlineUsers = new ArrayList<>();
            
            for (Map.Entry<String, WebSocketSession> entry : userSessions.entrySet()) {
                String onlineUsername = entry.getKey();
                WebSocketSession onlineSession = entry.getValue();
                  // Only include if session is open and not the requesting user
                if (onlineSession.isOpen() && !onlineUsername.equals(username)) {
                    try {
                        User user = userRepository.findByUsername(onlineUsername);
                        if (user != null) {                            // Check user's privacy setting - only include if they allow showing online status
                            UserSettings userSettings = userSettingsRepository.findByUserId(user.getId()).orElse(null);
                            if (userSettings != null && userSettings.getShowOnlineStatus() != null && !userSettings.getShowOnlineStatus()) {
                                continue; // Skip this user if they've disabled online status visibility
                            }
                            
                            Map<String, Object> userStatus = Map.of(
                                "userId", user.getId(),
                                "username", onlineUsername,
                                "isOnline", true,
                                "presence", "online" // Default presence
                            );
                            onlineUsers.add(userStatus);
                        }
                    } catch (Exception e) {
                        logger.warn("Error getting user info for {}: {}", onlineUsername, e.getMessage());
                    }
                }
            }            // Send status response back to requesting user
            String responseMessage = objectMapper.writeValueAsString(Map.of(
                "type", "status_response",
                "data", onlineUsers,
                "timestamp", new Date().toString()
            ));
            
            session.sendMessage(new TextMessage(responseMessage));
            logger.info("Sent online users list to {}: {} users online", username, onlineUsers.size());

        } catch (Exception e) {
            logger.error("Error handling status request", e);
            sendErrorMessage(session, "Error getting online users");
        }
    }

    private String getUsernameFromSession(WebSocketSession session) {
        return sessionToUser.get(session.getId());
    }
}
