# WingIt Social Media Platform - Sequence Diagram Generation Prompt

## System Overview
WingIt is a comprehensive social media platform built with modern technology stack:
- **Backend**: Spring Boot + MySQL with JWT authentication and OAuth2 integration
- **Frontend**: Next.js + TypeScript with real-time WebSocket communication
- **Database**: MySQL with 20+ interconnected tables
- **Real-time Features**: WebSocket for messaging, notifications, and live updates

## Core System Architecture

### Backend Components
- **Controllers**: AuthController, UserController, PostController, CommentController, FriendController, ChatRoomController, NotificationController
- **Services**: UserService, PostService, CommentService, FriendService, NotificationService, ChatRoomService
- **Entities**: User, Post, Comment, Friend, Message, Notification, PostReaction, CommentReaction
- **Security**: JWT + OAuth2 (Google login) with Spring Security

### Frontend Components
- **Services**: AuthService, PostService, CommentService, ChatService, UserService, FriendService, NotificationService
- **Components**: Feed, Post, CommentSection, FriendChatModal, RealTimeNotification
- **Real-time**: WebSocket integration for live updates

### Database Schema (Key Tables)
- **Users**: user, user_data, user_settings
- **Social**: posts, comments, comment_replies, friends, friend_requests, follows, block
- **Engagement**: post_reactions, comment_reactions, bookmarks, post_views
- **Communication**: chat_room, room_user, messages
- **System**: notifications, location, post_type, reaction_type, request_status

## Key User Flows for Sequence Diagrams

### 1. Authentication Flow
**Actors**: User, Frontend (Next.js), AuthController, UserService, JWT Service, Database
**Scenarios**:
- Regular login with username/password
- OAuth2 Google login
- JWT token validation and refresh
- User registration with email verification

### 2. Post Management Flow
**Actors**: User, Frontend, PostController, PostService, NotificationService, Database, WebSocket
**Scenarios**:
- Create new post with media upload
- View post feed with pagination
- React to posts (like/dislike)
- Bookmark posts
- View post analytics and statistics

### 3. Comment System Flow
**Actors**: User, Frontend, CommentController, CommentService, NotificationService, Database
**Scenarios**:
- Add comment to post
- Reply to existing comment
- React to comments
- Nested comment replies handling
- Real-time comment updates

### 4. Friend System Flow
**Actors**: User, Frontend, FriendController, FriendService, NotificationService, Database
**Scenarios**:
- Send friend request
- Accept/reject friend request
- View friends list
- Block/unblock users
- Follow/unfollow users

### 5. Real-time Chat Flow
**Actors**: User, Frontend, ChatRoomController, ChatRoomService, WebSocket, Database
**Scenarios**:
- Create chat room (1-on-1 or group)
- Send/receive messages in real-time
- Join/leave chat rooms
- Typing indicators
- Message history retrieval

### 6. Notification System Flow
**Actors**: System, NotificationController, NotificationService, WebSocket, Database, Frontend
**Scenarios**:
- Generate notifications (friend request, comment, reaction)
- Real-time notification delivery via WebSocket
- Mark notifications as read
- Notification preferences management

### 7. Content Moderation Flow
**Actors**: Admin, User, Frontend, AdminController, PostService, CommentService, Database
**Scenarios**:
- Report inappropriate content
- Admin content review and moderation
- Content approval/rejection
- User account management

## Technical Integration Points

### API Communication
- RESTful endpoints for CRUD operations
- JWT authentication headers
- Request/response data transformation
- Error handling and validation

### Real-time Features
- WebSocket connection establishment
- Real-time message broadcasting
- Live notification delivery
- Online status tracking

### Database Interactions
- Complex JOIN operations across multiple tables
- Transaction management for data consistency
- Indexing for performance optimization
- Foreign key constraint enforcement

## Sequence Diagram Creation Instructions

When creating sequence diagrams for WingIt, please:

1. **Choose specific user flow** from the scenarios above
2. **Include all relevant actors** (User, Frontend components, Backend controllers/services, Database, WebSocket when applicable)
3. **Show complete request/response cycle** including:
   - Frontend service calls
   - Controller endpoint handling
   - Service layer business logic
   - Database operations
   - Response data flow back to frontend
   - Real-time updates via WebSocket (when applicable)

4. **Include error handling scenarios** such as:
   - Authentication failures
   - Validation errors
   - Database constraint violations
   - Network connectivity issues

5. **Show data transformation** at each layer:
   - Frontend form data → API request
   - API response → Database entity
   - Database result → Frontend display format

6. **Highlight security checks**:
   - JWT token validation
   - User authorization for actions
   - Data access permissions

7. **Include notification triggers** where relevant:
   - When notifications are generated
   - How they're delivered in real-time
   - Update UI components

## Example Prompt for Specific Flow

**"Create a sequence diagram for the 'User Creates Post with Image' flow in WingIt social media platform. Include the following actors: User, CreatePostForm (Frontend), PostService (Frontend), PostController (Backend), PostService (Backend), NotificationService, Database, and WebSocket. Show the complete flow from user uploading image and entering post content, through backend processing, database storage, friend notification generation, and real-time feed updates. Include error handling for image upload failures and authentication validation."**

## Sample Data Models for Reference

### User Entity
```
User: id, username, email, provider, provider_id, role_id
UserData: user_id, display_name, bio, profile_picture, date_of_birth
UserSettings: user_id, privacy_level, show_online_status
```

### Post Entity
```
Post: id, user_id, content, created_date, type, location_id
PostMedia: id, post_id, media_url, media_type
PostReaction: id, post_id, user_id, react_type, timestamp
```

### Comment Entity
```
Comment: id, user_id, text, created_date, post_id, is_reply
CommentReply: id, root_comment_id, reply_id
CommentReaction: id, comment_id, user_id, react_type
```

This prompt provides comprehensive context for generating detailed and accurate sequence diagrams for any user flow within the WingIt social media platform.

---

## READY-TO-USE SEQUENCE DIAGRAM PROMPTS

### 1. User Creates Post Flow (Complete)
```
Create a detailed sequence diagram using Mermaid syntax for the "User Creates New Post" flow in WingIt social media platform.

**Actors:**
- User (browser)
- CreatePostForm (Frontend Component)
- PostService (Frontend Service)
- PostController (Spring Boot Controller)
- PostService (Backend Service)
- NotificationService (Backend Service)
- Database (MySQL)
- WebSocket (Real-time updates)

**Flow Description:**
1. User fills out post form (content, image upload, location)
2. Frontend validates input and calls API
3. Backend processes request with JWT authentication
4. Save post to database with media handling
5. Generate notifications for user's friends
6. Broadcast new post via WebSocket to online friends
7. Return success response and update UI

**Include:**
- Error handling for authentication, validation, and upload failures
- Image upload and processing steps
- Real-time notification delivery
- Database transaction management
- JWT token validation

**Format:** Use Mermaid sequenceDiagram syntax with proper actor naming and detailed step descriptions.
```

### 2. Friend Request Flow (Complete)
```
Create a detailed sequence diagram using Mermaid syntax for the "Send Friend Request" flow in WingIt social media platform.

**Actors:**
- User A (Sender)
- User B (Receiver)
- FriendService (Frontend)
- FriendController (Backend)
- FriendService (Backend)
- NotificationService (Backend)
- Database (MySQL)
- WebSocket (Real-time)

**Flow Description:**
1. User A clicks "Add Friend" on User B's profile
2. Frontend sends friend request via API
3. Backend validates users exist and aren't already friends
4. Create friend_request record in database
5. Generate notification for User B
6. Send real-time notification via WebSocket
7. Update User A's UI with "Request Sent" status
8. User B receives notification and can accept/reject

**Include:**
- Duplicate request prevention
- Privacy settings validation
- Block status checking
- Real-time notification delivery
- Error handling for various edge cases

**Format:** Use Mermaid sequenceDiagram syntax with clear actor interactions.
```

### 3. Real-time Chat Message Flow (Complete)
```
Create a detailed sequence diagram using Mermaid syntax for the "Send Real-time Chat Message" flow in WingIt social media platform.

**Actors:**
- User A (Sender)
- User B (Receiver)
- ChatService (Frontend)
- WebSocket Client (Frontend)
- WebSocket Server (Backend)
- ChatRoomController (Backend)
- ChatRoomService (Backend)
- Database (MySQL)

**Flow Description:**
1. User A types message in chat interface
2. Frontend sends message via WebSocket connection
3. Backend receives message and validates user authentication
4. Save message to database with timestamp
5. Broadcast message to all chat room participants
6. User B receives message in real-time
7. Update message status to "delivered"
8. Show typing indicators and online status

**Include:**
- WebSocket connection establishment
- Message persistence
- Typing indicators
- Online status tracking
- Message delivery confirmation
- Error handling for connection issues

**Format:** Use Mermaid sequenceDiagram syntax with WebSocket communication patterns.
```

### 4. User Login with JWT Flow (Complete)
```
Create a detailed sequence diagram using Mermaid syntax for the "User Login Authentication" flow in WingIt social media platform.

**Actors:**
- User (browser)
- LoginForm (Frontend Component)
- AuthService (Frontend Service)
- AuthController (Spring Boot Controller)
- UserService (Backend Service)
- JWT Service (Backend Service)
- Database (MySQL)
- SecurityFilter (Spring Security)

**Flow Description:**
1. User enters username/password and submits login form
2. Frontend validates input and calls login API
3. Backend authenticates credentials against database
4. Generate JWT access token and refresh token
5. Return tokens to frontend
6. Store tokens in secure storage
7. Redirect to main feed page
8. Subsequent requests include JWT in Authorization header

**Include:**
- Password hashing and verification
- JWT token generation and validation
- Refresh token mechanism
- Security filter authentication
- Error handling for invalid credentials
- Session management

**Format:** Use Mermaid sequenceDiagram syntax with security flow details.
```

### 5. Comment with Nested Replies Flow (Complete)
```
Create a detailed sequence diagram using Mermaid syntax for the "Add Comment with Nested Replies" flow in WingIt social media platform.

**Actors:**
- User (commenter)
- CommentSection (Frontend Component)
- CommentService (Frontend Service)
- CommentController (Spring Boot Controller)
- CommentService (Backend Service)
- NotificationService (Backend Service)
- Database (MySQL)
- WebSocket (Real-time updates)

**Flow Description:**
1. User clicks "Reply" on existing comment or post
2. User types comment text and submits
3. Frontend determines if it's root comment or reply
4. Backend processes comment with proper parent-child relationship
5. Save comment/reply to database with threading structure
6. Generate notification for original poster/commenter
7. Broadcast new comment via WebSocket
8. Update comment section UI with new comment
9. Handle nested reply structure display

**Include:**
- Comment threading and hierarchy
- Notification generation for multiple users
- Real-time comment updates
- Comment validation and moderation
- Database relationship management
- UI update for nested structure

**Format:** Use Mermaid sequenceDiagram syntax showing the comment hierarchy handling.
```

### 6. OAuth2 Google Login with Setup Flow (Complete)
```
Create a detailed sequence diagram using Mermaid syntax for the "OAuth2 Google Login with Profile Setup" flow in WingIt social media platform.

**Actors:**
- User (browser)
- LoginPage (Frontend Component)
- Google OAuth2 Server
- OAuth2AuthenticationSuccessHandler (Backend)
- GoogleOAuth2UserService (Backend Service)
- TempOAuth2UserService (Backend Service)
- UserService (Backend Service)
- JWT Service (Backend Service)
- Database (MySQL)
- SetupProfilePage (Frontend Component)

**Flow Description:**
1. User clicks "Login with Google" button
2. Redirect to Google OAuth2 authorization server
3. User authenticates with Google and grants permissions
4. Google redirects back with authorization code
5. Backend exchanges code for access token with Google
6. Fetch user profile information from Google API
7. Check if user exists in database by Google ID
8. If new user: store temporarily and redirect to profile setup
9. If existing user: generate JWT tokens and complete login
10. Complete profile setup for new users and finalize registration

**Include:**
- OAuth2 authorization code flow
- Temporary user storage mechanism
- Profile setup validation
- JWT token generation after setup
- Error handling for OAuth2 failures
- Google API integration
- User data mapping and validation

**Format:** Use Mermaid sequenceDiagram syntax with OAuth2 flow details.
```

### 7. AI Content Moderation Flow (Complete)
```
Create a detailed sequence diagram using Mermaid syntax for the "AI-Powered Content Moderation" flow in WingIt social media platform.

**Actors:**
- User (content creator)
- PostService/CommentService (Backend)
- AIContentModerationService (Backend Service)
- AI Server (Python Flask with PhoBERT)
- Database (MySQL)
- AdminNotificationService (Backend Service)
- WebSocket (Real-time alerts)

**Flow Description:**
1. User submits post or comment content
2. Backend triggers AI content moderation check
3. Send content to AI server for analysis
4. AI server processes text using PhoBERT model for Vietnamese
5. Return moderation result with confidence score and action
6. Based on AI decision: ALLOW, FLAG, REVIEW, or BLOCK content
7. If flagged/blocked: prevent publication and log incident
8. If needs review: queue for admin approval
9. Generate admin notifications for flagged content
10. Update content status and notify user if blocked

**Include:**
- PhoBERT model integration for Vietnamese text
- Confidence scoring and threshold management
- Multi-level moderation actions
- Admin notification system
- Content queuing for manual review
- Real-time admin alerts
- Error handling for AI server downtime

**Format:** Use Mermaid sequenceDiagram syntax with AI integration patterns.
```

### 8. Password Reset Flow (Complete)
```
Create a detailed sequence diagram using Mermaid syntax for the "Password Reset with Email Verification" flow in WingIt social media platform.

**Actors:**
- User (browser)
- ForgotPasswordModal (Frontend Component)
- ResetPasswordPage (Frontend Component)
- AuthController (Backend Controller)
- PasswordResetService (Backend Service)
- EmailService (Backend Service)
- Database (MySQL)
- Email Server (SMTP)

**Flow Description:**
1. User clicks "Forgot Password" and enters email
2. Frontend calls password reset request API
3. Backend validates email exists in system
4. Generate secure reset token with expiration
5. Save reset token to database
6. Send HTML email with reset link containing token
7. User receives email and clicks reset link
8. Frontend validates token and shows reset form
9. User enters new password and confirms
10. Backend validates token, updates password, and invalidates token

**Include:**
- Secure token generation and validation
- Token expiration handling
- Email template and HTML content
- Password strength validation
- Token invalidation after use
- Error handling for expired/invalid tokens
- SMTP email delivery confirmation

**Format:** Use Mermaid sequenceDiagram syntax with security token flow.
```

### 9. Bookmark Management Flow (Complete)
```
Create a detailed sequence diagram using Mermaid syntax for the "Bookmark Post Management" flow in WingIt social media platform.

**Actors:**
- User (browser)
- Post Component (Frontend)
- BookmarksPage (Frontend Component)
- BookmarkService (Frontend Service)
- BookmarkController (Backend Controller)
- BookmarkService (Backend Service)
- Database (MySQL)
- NotificationService (Backend Service)

**Flow Description:**
1. User clicks bookmark icon on post
2. Frontend determines current bookmark status
3. Call API to add/remove bookmark
4. Backend validates user authentication and post existence
5. Toggle bookmark status in database
6. Update bookmark collections if specified
7. Generate notification for post author (optional)
8. Return updated bookmark status
9. Update UI with new bookmark state
10. Sync bookmarks page with latest changes

**Include:**
- Bookmark status toggle functionality
- Collection-based bookmark organization
- Bulk bookmark operations
- Bookmark analytics and statistics
- Privacy settings for bookmarks
- Error handling for non-existent posts
- Real-time UI updates

**Format:** Use Mermaid sequenceDiagram syntax with state management patterns.
```

### 10. User Block/Unblock Flow (Complete)
```
Create a detailed sequence diagram using Mermaid syntax for the "User Block and Unblock Management" flow in WingIt social media platform.

**Actors:**
- User A (blocker)
- User B (blocked user)
- UserProfile (Frontend Component)
- BlockService (Frontend Service)
- UserController (Backend Controller)
- BlockService (Backend Service)
- FriendService (Backend Service)
- Database (MySQL)
- NotificationService (Backend Service)

**Flow Description:**
1. User A clicks "Block User" on User B's profile
2. Frontend confirms action with user
3. Call block user API endpoint
4. Backend validates both users exist
5. Create block relationship in database
6. Remove existing friendship if present
7. Cancel pending friend requests between users
8. Update privacy restrictions for blocked user
9. Hide User B's content from User A's feeds
10. Return success and update UI restrictions

**Include:**
- Block relationship creation and management
- Friendship removal upon blocking
- Content filtering and privacy enforcement
- Reverse block detection (mutual blocking)
- Unblock process and relationship restoration
- Admin override capabilities
- Error handling for self-blocking attempts

**Format:** Use Mermaid sequenceDiagram syntax with relationship management patterns.
```

---

## HOW TO USE THESE PROMPTS

1. **Copy any prompt above** and paste it into your sequence diagram generation tool (ChatGPT, Claude, etc.)
2. **The tool will generate** complete Mermaid sequence diagram code
3. **Paste the Mermaid code** into any Mermaid editor (mermaid.live, VS Code extension, etc.)
4. **Customize as needed** - modify actors, add/remove steps, adjust error handling

Each prompt is designed to generate a complete, production-ready sequence diagram that accurately represents the WingIt system architecture and data flows.

---

## READY-TO-USE ACTIVITY DIAGRAM PROMPTS

### 1. User Registration Flow
```
Create a Mermaid activity diagram for "User Registration" in WingIt:

**Main Flow:**
Start → Choose method (Email/Google) → Validate credentials → Email verification → Profile setup → Complete registration → End

**Key Decisions:**
- Registration method?
- Email valid?
- Profile complete?

**Format:** Use Mermaid flowchart with decision diamonds and process rectangles.
```

### 2. Create Post Flow
```
Create a Mermaid activity diagram for "Create Post" in WingIt:

**Main Flow:**
Start → Compose content → Upload media → Set privacy → AI moderation → Publish/Queue for review → Notify friends → End

**Key Decisions:**
- Include media?
- Privacy level?
- AI approval?

**Format:** Use Mermaid flowchart with parallel processes.
```

### 3. Friend Request Flow
```
Create a Mermaid activity diagram for "Friend Request" in WingIt:

**Main Flow:**
Start → Find user → Send request → Validate users → Create request → Notify receiver → Update UI → End

**Key Decisions:**
- Users exist?
- Already friends?
- Not blocked?

**Format:** Use Mermaid flowchart with validation checks.
```

### 4. Real-time Chat Flow
```
Create a Mermaid activity diagram for "Real-time Chat" in WingIt:

**Main Flow:**
Start → Connect WebSocket → Join room → Send message → Validate → Deliver → Update status → End

**Key Decisions:**
- Connection OK?
- Permission granted?
- Message valid?

**Format:** Use Mermaid flowchart with real-time emphasis.
```

### 5. Content Feed Flow
```
Create a Mermaid activity diagram for "Content Feed" in WingIt:

**Main Flow:**
Start → Load preferences → Filter by location → Rank content → Compose feed → Display → Track engagement → End

**Key Decisions:**
- Location filter on?
- Content available?
- More content?

**Format:** Use Mermaid flowchart with data processing flow.
```

### 6. Content Moderation Flow
```
Create a Mermaid activity diagram for "Content Moderation" in WingIt:

**Main Flow:**
Start → AI analysis → Risk scoring → Auto-approve/Flag/Block → Human review (if needed) → Final decision → End

**Key Decisions:**
- Risk level?
- Need human review?
- Appeal valid?

**Format:** Use Mermaid flowchart with AI and human review lanes.
```

### 7. User Login Flow
```
Create a Mermaid activity diagram for "User Login" in WingIt:

**Main Flow:**
Start → Enter credentials → Validate → Generate JWT → Store tokens → Redirect to feed → End

**Key Decisions:**
- Credentials valid?
- Account active?
- Need 2FA?

**Format:** Use Mermaid flowchart with security checkpoints.
```

### 8. Notification Flow
```
Create a Mermaid activity diagram for "Notification System" in WingIt:

**Main Flow:**
Start → Event trigger → Check preferences → Format message → Choose channel → Send → Track delivery → End

**Key Decisions:**
- User preferences?
- Delivery method?
- Retry needed?

**Format:** Use Mermaid flowchart with multi-channel delivery.
```

### 9. Bookmark Management Flow
```
Create a Mermaid activity diagram for "Bookmark Management" in WingIt:

**Main Flow:**
Start → Click bookmark → Check status → Toggle bookmark → Update database → Sync UI → End

**Key Decisions:**
- Currently bookmarked?
- Post exists?
- Collection specified?

**Format:** Use Mermaid flowchart with state management.
```

### 10. User Block Flow
```
Create a Mermaid activity diagram for "User Block" in WingIt:

**Main Flow:**
Start → Confirm block → Validate users → Create block → Remove friendship → Hide content → Update UI → End

**Key Decisions:**
- Confirm action?
- Users exist?
- Currently friends?

**Format:** Use Mermaid flowchart with relationship management.
```

---

## ACTIVITY DIAGRAM USAGE INSTRUCTIONS

### For Activity Diagrams:
1. **Copy any activity diagram prompt** from the section above
2. **Paste into your diagram generation tool** (ChatGPT, Claude, etc.)
3. **The tool will generate** complete Mermaid flowchart code
4. **Use these Mermaid editors:**
   - mermaid.live (online editor)
   - VS Code Mermaid extension
   - GitHub/GitLab (native support)
   - Draw.io (with Mermaid plugin)

### Key Differences from Sequence Diagrams:
- **Activity Diagrams** focus on **business processes and workflows**
- **Sequence Diagrams** focus on **technical interactions between systems**
- **Activity Diagrams** show **decision points and parallel processes**
- **Sequence Diagrams** show **chronological message exchanges**

### When to Use Each:
- **Use Activity Diagrams for:**
  - Business process documentation
  - User journey mapping
  - Workflow optimization
  - Stakeholder communication
  - Requirements gathering

- **Use Sequence Diagrams for:**
  - Technical system design
  - API interaction documentation
  - Debugging and troubleshooting
  - Developer onboarding
  - System integration planning

Both diagram types complement each other and provide comprehensive system documentation for the WingIt social media platform.
