package com.example.wingit.model.Enum;

public enum FriendRequestStatus {
    PENDING,
    ACCEPTED,
    DECLINED,
    BLOCKED // If a user blocks another, any pending friend request could be marked as blocked.
}
