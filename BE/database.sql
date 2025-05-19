-- Create the schema (database) named 'db'
CREATE SCHEMA IF NOT EXISTS db;
USE db;

-- Drop tables if they exist
DROP TABLE IF EXISTS message;
DROP TABLE IF EXISTS room_user;
DROP TABLE IF EXISTS chat_room;
DROP TABLE IF EXISTS comment_reply;
DROP TABLE IF EXISTS comment;
DROP TABLE IF EXISTS post_media;
DROP TABLE IF EXISTS post_reaction;
DROP TABLE IF EXISTS post;
DROP TABLE IF EXISTS post_type;
DROP TABLE IF EXISTS reaction_type;
DROP TABLE IF EXISTS location;
DROP TABLE IF EXISTS block;
DROP TABLE IF EXISTS follow;
DROP TABLE IF EXISTS friend;
DROP TABLE IF EXISTS friend_request;
DROP TABLE IF EXISTS request_status;
DROP TABLE IF EXISTS user_data;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS role;

-- Create lookup tables first (role, reaction_type, request_status, post_type, location, chat_room)
CREATE TABLE role (
    id INT PRIMARY KEY,
    role VARCHAR(50) NOT NULL
);

CREATE TABLE reaction_type (
    id INT PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL
);

CREATE TABLE request_status (
    id INT PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL
);

CREATE TABLE post_type (
    id INT PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL
);

CREATE TABLE location (
    id INT PRIMARY KEY,
    location VARCHAR(50) NOT NULL
);

CREATE TABLE chat_room (
    id INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    type BOOLEAN NOT NULL
);

-- Create user table (for login)
CREATE TABLE user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL,
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
    date_of_birth DATE,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
);

-- Create friend table
CREATE TABLE friend (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user1 INT NOT NULL,
    user2 INT NOT NULL,
    added_date DATE NOT NULL,
    FOREIGN KEY (user1) REFERENCES user(id),
    FOREIGN KEY (user2) REFERENCES user(id),
    CONSTRAINT unique_friendship UNIQUE (user1, user2),
    CONSTRAINT no_self_friendship CHECK (user1 != user2)
);

-- Create friend_request table
CREATE TABLE friend_request (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    request_status INT NOT NULL,
    FOREIGN KEY (sender_id) REFERENCES user(id),
    FOREIGN KEY (receiver_id) REFERENCES user(id),
    FOREIGN KEY (request_status) REFERENCES request_status(id),
    CONSTRAINT unique_request UNIQUE (sender_id, receiver_id),
    CONSTRAINT no_self_request CHECK (sender_id != receiver_id)
);

-- Create follow table
CREATE TABLE follow (
    id INT PRIMARY KEY AUTO_INCREMENT,
    followed_id INT NOT NULL,
    follower_id INT NOT NULL,
    follow_date DATE NOT NULL,
    FOREIGN KEY (followed_id) REFERENCES user(id),
    FOREIGN KEY (follower_id) REFERENCES user(id),
    CONSTRAINT unique_follow UNIQUE (followed_id, follower_id),
    CONSTRAINT no_self_follow CHECK (followed_id != follower_id)
);

-- Create block table
CREATE TABLE block (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    blocked_user_id INT NOT NULL, -- Renamed from blocked_id
    timestamp DATETIME NOT NULL, -- Added timestamp column
    follow_date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (blocked_user_id) REFERENCES user(id), -- Renamed from blocked_id
    CONSTRAINT unique_block UNIQUE (user_id, blocked_user_id), -- Renamed from blocked_id
    CONSTRAINT no_self_block CHECK (user_id != blocked_user_id) -- Renamed from blocked_id
);

-- Create post table
CREATE TABLE post (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    content TEXT,
    created_at DATETIME NOT NULL,
    update_at DATETIME NOT NULL,
    location_id INT,
    type INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (location_id) REFERENCES location(id),
    FOREIGN KEY (type) REFERENCES post_type(id)
);

-- Create post_reaction table
CREATE TABLE post_reaction (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id BIGINT NOT NULL,
    user_id INT NOT NULL,
    react_type INT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES post(id),
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (react_type) REFERENCES reaction_type(id),
    CONSTRAINT unique_reaction UNIQUE (post_id, user_id)
);

-- Create post_media table
CREATE TABLE post_media (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id BIGINT NOT NULL,
    media_url VARCHAR(255) NOT NULL,
    FOREIGN KEY (post_id) REFERENCES post(id)
);

-- Create comment table
CREATE TABLE comment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    time DATETIME NOT NULL,
    post_id BIGINT NOT NULL,
    is_reply BOOLEAN NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (post_id) REFERENCES post(id)
);

-- Create report table
CREATE TABLE report (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    post_id BIGINT NOT NULL,
    reason TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (post_id) REFERENCES post(id)
);

-- Create notification table
CREATE TABLE notification (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    post_id BIGINT NOT NULL,
    read_status BOOLEAN NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (post_id) REFERENCES post(id)
);

-- Create comment_reply table (updated to allow multiple replies from the same user)
CREATE TABLE comment_reply (
    id INT PRIMARY KEY AUTO_INCREMENT,
    author_cmt_id INT NOT NULL,
    comment_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (author_cmt_id) REFERENCES user(id),
    FOREIGN KEY (comment_id) REFERENCES comment(id)
);

-- Create room_user table
CREATE TABLE room_user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    room_id INT NOT NULL,
    join_date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (room_id) REFERENCES chat_room(id),
    CONSTRAINT unique_room_user UNIQUE (user_id, room_id)
);

-- Create message table
CREATE TABLE message (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    room_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (sender_id) REFERENCES user(id),
    FOREIGN KEY (room_id) REFERENCES chat_room(id)
);

-- Add indexes for performance
CREATE INDEX idx_friend_user1 ON friend(user1);
CREATE INDEX idx_friend_user2 ON friend(user2);
CREATE INDEX idx_follow_followed ON follow(followed_id);
CREATE INDEX idx_follow_follower ON follow(follower_id);
CREATE INDEX idx_block_user ON block(user_id);
CREATE INDEX idx_block_blocked ON block(blocked_user_id);
CREATE INDEX idx_post_user ON post(user_id);
CREATE INDEX idx_comment_user ON comment(user_id);
CREATE INDEX idx_comment_post ON comment(post_id);
CREATE INDEX idx_room_user_user ON room_user(user_id);
CREATE INDEX idx_room_user_room ON room_user(room_id);
CREATE INDEX idx_message_sender ON message(sender_id);
CREATE INDEX idx_message_room ON message(room_id);

-- Insert some initial data for lookup tables (optional)
INSERT INTO role (id, role) VALUES
(1, 'USER'),
(2, 'ADMIN');

INSERT INTO reaction_type (id, type_name) VALUES
(1, 'like'),
(2, 'dislike');

INSERT INTO request_status (id, status_name) VALUES
(1, 'pending'),
(2, 'accepted'),
(3, 'rejected');

INSERT INTO post_type (id, type_name) VALUES
(1, 'info'),
(2, 'scenic'),
(3, 'discussion');