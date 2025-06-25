-- PostgreSQL Database Schema for WingIt Social Media Platform

SET client_encoding = 'UTF8';
SET timezone = 'UTC';

DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS bookmarks CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS room_user CASCADE;
DROP TABLE IF EXISTS chat_room CASCADE;
DROP TABLE IF EXISTS comment_replies CASCADE;
DROP TABLE IF EXISTS comment_reactions CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS post_media CASCADE;
DROP TABLE IF EXISTS post_reactions CASCADE;
DROP TABLE IF EXISTS post_views CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS post_type CASCADE;
DROP TABLE IF EXISTS reaction_type CASCADE;
DROP TABLE IF EXISTS location CASCADE;
DROP TABLE IF EXISTS block CASCADE;
DROP TABLE IF EXISTS follows CASCADE;
DROP TABLE IF EXISTS friends CASCADE;
DROP TABLE IF EXISTS friend_requests CASCADE;
DROP TABLE IF EXISTS request_status CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS user_data CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS role CASCADE;

CREATE TABLE role (
    id INTEGER PRIMARY KEY,
    role VARCHAR(50) NOT NULL
);

CREATE TABLE reaction_type (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE request_status (
    id BIGSERIAL PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL
);

CREATE TABLE post_type (
    id BIGSERIAL PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL
);

CREATE TABLE location (
    id INTEGER PRIMARY KEY,
    location VARCHAR(50) NOT NULL
);

CREATE TABLE chat_room (
    id BIGSERIAL PRIMARY KEY,
    room_name VARCHAR(50) NULL,
    is_group_chat BOOLEAN NOT NULL DEFAULT FALSE,
    is_auto_created BOOLEAN NOT NULL DEFAULT FALSE,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255), 
    email VARCHAR(100) UNIQUE, 
    provider VARCHAR(20),
    provider_id VARCHAR(100),
    role_id INTEGER NOT NULL,
    FOREIGN KEY (role_id) REFERENCES role(id),
    UNIQUE (username)
);

CREATE TABLE user_data (
    user_id INTEGER PRIMARY KEY,
    display_name VARCHAR(50) NOT NULL,
    bio TEXT,
    profile_picture VARCHAR(255),
    cover_photo VARCHAR(255),
    date_of_birth DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE user_settings (
    user_id INTEGER PRIMARY KEY,
    privacy_level VARCHAR(20) NOT NULL DEFAULT 'public',
    show_online_status BOOLEAN NOT NULL DEFAULT TRUE,
    enable_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_privacy_level CHECK (privacy_level IN ('public', 'friends', 'private'))
);

CREATE TABLE password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE friends (
    id BIGSERIAL PRIMARY KEY,
    user1_id INTEGER NOT NULL,
    user2_id INTEGER NOT NULL,
    friendship_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user1_id) REFERENCES users(id),
    FOREIGN KEY (user2_id) REFERENCES users(id),
    CONSTRAINT unique_friendship UNIQUE (user1_id, user2_id),
    CONSTRAINT no_self_friendship CHECK (user1_id != user2_id)
);

CREATE TABLE friend_requests (
    id BIGSERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    request_status BIGINT NOT NULL,
    request_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    response_date TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id),
    FOREIGN KEY (request_status) REFERENCES request_status(id),
    CONSTRAINT unique_request UNIQUE (sender_id, receiver_id),
    CONSTRAINT no_self_request CHECK (sender_id != receiver_id)
);

CREATE TABLE follows (
    id BIGSERIAL PRIMARY KEY,
    follower_id INTEGER NOT NULL,
    following_id INTEGER NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (follower_id) REFERENCES users(id),
    FOREIGN KEY (following_id) REFERENCES users(id),
    CONSTRAINT unique_follow UNIQUE (follower_id, following_id),
    CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

CREATE TABLE block (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    blocked_user_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (blocked_user_id) REFERENCES users(id),
    CONSTRAINT unique_block UNIQUE (user_id, blocked_user_id),
    CONSTRAINT no_self_block CHECK (user_id != blocked_user_id)
);

CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    content TEXT,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    type BIGINT NOT NULL,
    location_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (type) REFERENCES post_type(id),
    FOREIGN KEY (location_id) REFERENCES location(id)
);

CREATE TABLE post_reactions (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id INTEGER NOT NULL,
    react_type BIGINT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (react_type) REFERENCES reaction_type(id),
    CONSTRAINT unique_reaction UNIQUE (post_id, user_id)
);

CREATE TABLE post_media (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL,
    media_url VARCHAR(255) NOT NULL,
    media_type VARCHAR(50) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id)
);

CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    post_id BIGINT NOT NULL,
    is_reply BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id)
);

CREATE TABLE comment_replies (
    id BIGSERIAL PRIMARY KEY,
    root_comment_id BIGINT NOT NULL,
    reply_id BIGINT NOT NULL,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (root_comment_id) REFERENCES comments(id),
    FOREIGN KEY (reply_id) REFERENCES comments(id),
    CONSTRAINT unique_reply_relationship UNIQUE (root_comment_id, reply_id)
);

CREATE TABLE comment_reactions (
    id BIGSERIAL PRIMARY KEY,
    comment_id BIGINT NOT NULL,
    user_id INTEGER NOT NULL,
    react_type BIGINT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comment_id) REFERENCES comments(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (react_type) REFERENCES reaction_type(id),
    CONSTRAINT unique_comment_reaction UNIQUE (comment_id, user_id)
);

CREATE TABLE room_user (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    chat_room_id BIGINT NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (chat_room_id) REFERENCES chat_room(id),
    CONSTRAINT unique_room_user UNIQUE (user_id, chat_room_id)
);

CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL,
    chat_room_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (chat_room_id) REFERENCES chat_room(id)
);

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    recipient_user_id INTEGER NOT NULL,
    actor_user_id INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    post_id BIGINT NULL,
    comment_id BIGINT NULL,
    content TEXT NULL,
    read_status BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipient_user_id) REFERENCES users(id),
    FOREIGN KEY (actor_user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (comment_id) REFERENCES comments(id)
);

CREATE TABLE bookmarks (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    post_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id),
    CONSTRAINT unique_bookmark UNIQUE (user_id, post_id)
);

CREATE TABLE post_views (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id INTEGER NULL,
    view_source VARCHAR(50) NOT NULL CHECK (view_source IN ('feed', 'modal', 'profile', 'search', 'bookmark', 'notification')),
    duration_ms BIGINT NULL,
    viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(255) NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE reports (
    id BIGSERIAL PRIMARY KEY,
    reporter_id INTEGER NOT NULL,
    reported_user_id INTEGER NULL,
    post_id BIGINT NULL,
    comment_id BIGINT NULL,
    reason VARCHAR(255) NOT NULL,
    description TEXT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NULL,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    CONSTRAINT chk_report_target CHECK (
        (reported_user_id IS NOT NULL AND post_id IS NULL AND comment_id IS NULL) OR
        (reported_user_id IS NULL AND post_id IS NOT NULL AND comment_id IS NULL) OR
        (reported_user_id IS NULL AND post_id IS NULL AND comment_id IS NOT NULL)
    )
);

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
