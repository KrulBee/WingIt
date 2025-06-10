-- Create the schema (database) named 'db'
CREATE SCHEMA IF NOT EXISTS db;
USE db;

-- Drop tables if they exist
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS bookmarks;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS room_user;
DROP TABLE IF EXISTS chat_room;
DROP TABLE IF EXISTS comment_replies;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS post_media;
DROP TABLE IF EXISTS post_reactions;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS post_type;
DROP TABLE IF EXISTS reaction_type;
DROP TABLE IF EXISTS location;
DROP TABLE IF EXISTS block;
DROP TABLE IF EXISTS follows;
DROP TABLE IF EXISTS friends;
DROP TABLE IF EXISTS friend_requests;
DROP TABLE IF EXISTS request_status;
DROP TABLE IF EXISTS user_settings;
DROP TABLE IF EXISTS user_data;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS role;

-- Create lookup tables first (role, reaction_type, request_status, post_type, location, chat_room)
CREATE TABLE role (
    id INT PRIMARY KEY,
    role VARCHAR(50) NOT NULL
);

CREATE TABLE reaction_type (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE request_status (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    status_name VARCHAR(50) NOT NULL
);

CREATE TABLE post_type (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    type_name VARCHAR(50) NOT NULL
);

CREATE TABLE location (
    id INT PRIMARY KEY,
    location VARCHAR(50) NOT NULL
);

CREATE TABLE chat_room (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    room_name VARCHAR(50) NOT NULL,
    is_group_chat BOOLEAN NOT NULL DEFAULT FALSE,
    created_date DATETIME NOT NULL
);

-- Create user table (for login)
CREATE TABLE user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NULL, -- Changed to nullable for OAuth2 users
    email VARCHAR(100) UNIQUE, -- For OAuth2 users
    provider VARCHAR(20), -- google, facebook, etc. null for regular users
    provider_id VARCHAR(100), -- OAuth2 provider user ID
    role_id INT NOT NULL,
    FOREIGN KEY (role_id) REFERENCES role(id),
    UNIQUE (username)
);

-- Create user_data table (for profile info)
CREATE TABLE user_data (
    user_id INT PRIMARY KEY,
    display_name VARCHAR(50) NOT NULL,
    bio TEXT,
    profile_picture VARCHAR(255),
    cover_photo VARCHAR(255),
    date_of_birth DATE,
    created_at DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
);

-- Create user_settings table (for user preferences)
CREATE TABLE user_settings (
    user_id INT PRIMARY KEY,
    privacy_level VARCHAR(20) NOT NULL DEFAULT 'friends', -- 'public', 'friends', or 'private'
    show_online_status BOOLEAN NOT NULL DEFAULT TRUE, -- Show user's online status to others
    allow_search_engines BOOLEAN NOT NULL DEFAULT FALSE, -- Enable sound notifications (repurposed from search engines)
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    CONSTRAINT chk_privacy_level CHECK (privacy_level IN ('public', 'friends', 'private'))
);

-- Create friend table
CREATE TABLE friends (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user1_id INT NOT NULL,
    user2_id INT NOT NULL,
    friendship_date DATETIME NOT NULL,
    FOREIGN KEY (user1_id) REFERENCES user(id),
    FOREIGN KEY (user2_id) REFERENCES user(id),
    CONSTRAINT unique_friendship UNIQUE (user1_id, user2_id),
    CONSTRAINT no_self_friendship CHECK (user1_id != user2_id)
);

-- Create friend_request table
CREATE TABLE friend_requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    request_status BIGINT NOT NULL,
    request_date DATETIME NOT NULL,
    response_date DATETIME,
    FOREIGN KEY (sender_id) REFERENCES user(id),
    FOREIGN KEY (receiver_id) REFERENCES user(id),
    FOREIGN KEY (request_status) REFERENCES request_status(id),
    CONSTRAINT unique_request UNIQUE (sender_id, receiver_id),
    CONSTRAINT no_self_request CHECK (sender_id != receiver_id)
);

-- Create follow table
CREATE TABLE follows (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    follower_id INT NOT NULL,
    following_id INT NOT NULL,
    timestamp DATETIME NOT NULL,
    FOREIGN KEY (follower_id) REFERENCES user(id),
    FOREIGN KEY (following_id) REFERENCES user(id),
    CONSTRAINT unique_follow UNIQUE (follower_id, following_id),
    CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Create block table
CREATE TABLE block (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    blocked_user_id INT NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (blocked_user_id) REFERENCES user(id),
    CONSTRAINT unique_block UNIQUE (user_id, blocked_user_id),
    CONSTRAINT no_self_block CHECK (user_id != blocked_user_id)
);

-- Create post table
CREATE TABLE posts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    content TEXT,
    created_date DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    type BIGINT NOT NULL,
    location_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (type) REFERENCES post_type(id),
    FOREIGN KEY (location_id) REFERENCES location(id)
);

-- Create post_reaction table
CREATE TABLE post_reactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    post_id BIGINT NOT NULL,
    user_id INT NOT NULL,
    react_type BIGINT NOT NULL,
    timestamp DATETIME NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (react_type) REFERENCES reaction_type(id),
    CONSTRAINT unique_reaction UNIQUE (post_id, user_id)
);

-- Create post_media table
CREATE TABLE post_media (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    post_id BIGINT NOT NULL,
    media_url VARCHAR(255) NOT NULL,
    media_type VARCHAR(50) NOT NULL,
    uploaded_at DATETIME NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id)
);

-- Create comment table
CREATE TABLE comments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    text TEXT NOT NULL,
    created_date DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    post_id BIGINT NOT NULL,
    is_reply BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (post_id) REFERENCES posts(id)
);

-- Create comment_reply table (relationship table for replies)
CREATE TABLE comment_replies (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    root_comment_id BIGINT NOT NULL,
    reply_id BIGINT NOT NULL,
    created_date DATETIME NOT NULL,
    FOREIGN KEY (root_comment_id) REFERENCES comments(id),
    FOREIGN KEY (reply_id) REFERENCES comments(id),
    CONSTRAINT unique_reply_relationship UNIQUE (root_comment_id, reply_id)
);

-- Create comment_reactions table
CREATE TABLE comment_reactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    comment_id BIGINT NOT NULL,
    user_id INT NOT NULL,
    react_type BIGINT NOT NULL,
    timestamp DATETIME NOT NULL,
    FOREIGN KEY (comment_id) REFERENCES comments(id),
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (react_type) REFERENCES reaction_type(id),
    CONSTRAINT unique_comment_reaction UNIQUE (comment_id, user_id)
);

-- Create room_user table
CREATE TABLE room_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    chat_room_id BIGINT NOT NULL,
    joined_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (chat_room_id) REFERENCES chat_room(id),
    CONSTRAINT unique_room_user UNIQUE (user_id, chat_room_id)
);

-- Create message table
CREATE TABLE messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    chat_room_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    FOREIGN KEY (sender_id) REFERENCES user(id),
    FOREIGN KEY (chat_room_id) REFERENCES chat_room(id)
);

-- Create notifications table
CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    recipient_user_id INT NOT NULL,
    actor_user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    post_id BIGINT NULL,
    comment_id BIGINT NULL,
    content TEXT NULL,
    read_status BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipient_user_id) REFERENCES user(id),
    FOREIGN KEY (actor_user_id) REFERENCES user(id),
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (comment_id) REFERENCES comments(id)
);

-- Create bookmarks table
CREATE TABLE bookmarks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    post_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (post_id) REFERENCES posts(id),
    CONSTRAINT unique_bookmark UNIQUE (user_id, post_id)
);

-- Create post_views table for tracking post views
CREATE TABLE post_views (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    post_id BIGINT NOT NULL,
    user_id INT NULL, -- NULL for anonymous views
    view_source ENUM('feed', 'modal', 'profile', 'search', 'bookmark', 'notification') NOT NULL,
    duration_ms BIGINT NULL, -- For modal views (duration in milliseconds)
    viewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(255) NULL, -- For tracking view sessions
    ip_address VARCHAR(45) NULL, -- For anonymous tracking
    user_agent TEXT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE SET NULL
);

-- Create reports table for user/post/comment reporting system
CREATE TABLE reports (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    reporter_id INT NOT NULL,
    reported_user_id INT NULL, -- For user reports
    post_id BIGINT NULL, -- For post reports  
    comment_id BIGINT NULL, -- For comment reports
    reason VARCHAR(255) NOT NULL,
    description TEXT NULL,
    status ENUM('PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED') NOT NULL DEFAULT 'PENDING',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    FOREIGN KEY (reporter_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    -- Ensure at least one of the reported items is specified
    CONSTRAINT chk_report_target CHECK (
        (reported_user_id IS NOT NULL AND post_id IS NULL AND comment_id IS NULL) OR
        (reported_user_id IS NULL AND post_id IS NOT NULL AND comment_id IS NULL) OR  
        (reported_user_id IS NULL AND post_id IS NULL AND comment_id IS NOT NULL)
    )
);

-- Add indexes for performance
CREATE INDEX idx_friend_user1 ON friends(user1_id);
CREATE INDEX idx_friend_user2 ON friends(user2_id);
CREATE INDEX idx_follow_follower ON follows(follower_id);
CREATE INDEX idx_follow_following ON follows(following_id);
CREATE INDEX idx_block_user ON block(user_id);
CREATE INDEX idx_block_blocked ON block(blocked_user_id);
CREATE INDEX idx_post_user ON posts(user_id);
CREATE INDEX idx_comment_user ON comments(user_id);
CREATE INDEX idx_comment_post ON comments(post_id);
CREATE INDEX idx_room_user_user ON room_user(user_id);
CREATE INDEX idx_room_user_room ON room_user(chat_room_id);
CREATE INDEX idx_message_sender ON messages(sender_id);
CREATE INDEX idx_message_room ON messages(chat_room_id);
CREATE INDEX idx_notification_recipient ON notifications(recipient_user_id);
CREATE INDEX idx_notification_actor ON notifications(actor_user_id);
CREATE INDEX idx_notification_post ON notifications(post_id);
CREATE INDEX idx_notification_read_status ON notifications(read_status);
CREATE INDEX idx_notification_created_at ON notifications(created_at);
CREATE INDEX idx_bookmark_user ON bookmarks(user_id);
CREATE INDEX idx_bookmark_post ON bookmarks(post_id);
CREATE INDEX idx_bookmark_created_at ON bookmarks(created_at);
CREATE INDEX idx_post_views_post ON post_views(post_id);
CREATE INDEX idx_post_views_user ON post_views(user_id);
CREATE INDEX idx_post_views_source ON post_views(view_source);
CREATE INDEX idx_post_views_date ON post_views(viewed_at);
CREATE INDEX idx_reports_reporter ON reports(reporter_id);
CREATE INDEX idx_reports_reported_user ON reports(reported_user_id);
CREATE INDEX idx_reports_post ON reports(post_id);
CREATE INDEX idx_reports_comment ON reports(comment_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at);

-- Insert some initial data for lookup tables (optional)
INSERT INTO role (id, role) VALUES
(1, 'user'),
(2, 'admin');

INSERT INTO reaction_type (name, description) VALUES
('like', 'Like reaction'),
('dislike', 'Dislike reaction');

INSERT INTO request_status (status_name) VALUES
('PENDING'),
('ACCEPTED'),
('REJECTED');

INSERT INTO post_type (type_name) VALUES
('info'),
('scenic'),
('discussion');

INSERT INTO location (id, location) VALUES
(1, 'Hà Nội'),
(2, 'Hồ Chí Minh'),
(3, 'Hải Phòng'),
(4, 'Đà Nẵng'),
(5, 'Cần Thơ'),
(6, 'An Giang'),
(7, 'Bà Rịa - Vũng Tàu'),
(8, 'Bắc Giang'),
(9, 'Bắc Kạn'),
(10, 'Bạc Liêu'),
(11, 'Bắc Ninh'),
(12, 'Bến Tre'),
(13, 'Bình Định'),
(14, 'Bình Dương'),
(15, 'Bình Phước'),
(16, 'Bình Thuận'),
(17, 'Cà Mau'),
(18, 'Cao Bằng'),
(19, 'Đắk Lắk'),
(20, 'Đắk Nông'),
(21, 'Điện Biên'),
(22, 'Đồng Nai'),
(23, 'Đồng Tháp'),
(24, 'Gia Lai'),
(25, 'Hà Giang'),
(26, 'Hà Nam'),
(27, 'Hà Tĩnh'),
(28, 'Hải Dương'),
(29, 'Hậu Giang'),
(30, 'Hòa Bình'),
(31, 'Hưng Yên'),
(32, 'Khánh Hòa'),
(33, 'Kiên Giang'),
(34, 'Kon Tum'),
(35, 'Lai Châu'),
(36, 'Lâm Đồng'),
(37, 'Lạng Sơn'),
(38, 'Lào Cai'),
(39, 'Long An'),
(40, 'Nam Định'),
(41, 'Nghệ An'),
(42, 'Ninh Bình'),
(43, 'Ninh Thuận'),
(44, 'Phú Thọ'),
(45, 'Phú Yên'),
(46, 'Quảng Bình'),
(47, 'Quảng Nam'),
(48, 'Quảng Ngãi'),
(49, 'Quảng Ninh'),
(50, 'Quảng Trị'),
(51, 'Sóc Trăng'),
(52, 'Sơn La'),
(53, 'Tây Ninh'),
(54, 'Thái Bình'),
(55, 'Thái Nguyên'),
(56, 'Thanh Hóa'),
(57, 'Thừa Thiên Huế'),
(58, 'Tiền Giang'),
(59, 'Trà Vinh'),
(60, 'Tuyên Quang'),
(61, 'Vĩnh Long'),
(62, 'Vĩnh Phúc'),
(63, 'Yên Bái');