package com.example.server.dto;

public class FollowDTO {
    private Long id;
    private UserDTO follower;
    private UserDTO following;
    private String followDate;

    // Constructors
    public FollowDTO() {}

    public FollowDTO(Long id, UserDTO follower, UserDTO following, String followDate) {
        this.id = id;
        this.follower = follower;
        this.following = following;
        this.followDate = followDate;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UserDTO getFollower() { return follower; }
    public void setFollower(UserDTO follower) { this.follower = follower; }

    public UserDTO getFollowing() { return following; }
    public void setFollowing(UserDTO following) { this.following = following; }

    public String getFollowDate() { return followDate; }
    public void setFollowDate(String followDate) { this.followDate = followDate; }
}
