"use client";
import React from "react";
import Post from "./Post";
import CreatePostForm from "./CreatePostForm";

// Mock data for posts
const POSTS = [
  {
    id: "1",
    authorName: "Jane Smith",
    authorUsername: "janesmith",
    authorAvatar: "https://i.pravatar.cc/150?u=janesmith",
    content: "Just finished a great book on modern web development with Next.js and React. Highly recommend it! 📚",
    likes: 42,
    comments: 7,
    shares: 3,
    createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    liked: true
  },
  {
    id: "2",
    authorName: "John Doe",
    authorUsername: "johndoe",
    authorAvatar: "https://i.pravatar.cc/150?u=johndoe",
    content: "Beautiful day for a hike! 🌲 Nature is the best therapy.",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1000",
    likes: 78,
    comments: 12,
    shares: 5,
    createdAt: new Date(Date.now() - 7200000), // 2 hours ago
    liked: false
  },
  {
    id: "3",
    authorName: "Alice Johnson",
    authorUsername: "alicej",
    authorAvatar: "https://i.pravatar.cc/150?u=alicej",
    content: "Just launched my new portfolio website! Check it out and let me know what you think. #webdevelopment #portfolio",
    likes: 56,
    comments: 8,
    shares: 2,
    createdAt: new Date(Date.now() - 10800000), // 3 hours ago
    liked: false
  },
  {
    id: "4",
    authorName: "Robert Wilson",
    authorUsername: "robertw",
    authorAvatar: "https://i.pravatar.cc/150?u=robertw",
    content: "Made some homemade pasta today. Italian cuisine at its finest! 🍝",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=1000",
    likes: 89,
    comments: 15,
    shares: 7,
    createdAt: new Date(Date.now() - 43200000), // 12 hours ago
    liked: true
  }
];

export default function Feed() {
  return (
    <div className="max-w-xl mx-auto pb-8">
      <CreatePostForm />
      
      <div className="space-y-4">
        {POSTS.map(post => (
          <Post key={post.id} {...post} />
        ))}
      </div>
    </div>
  );
}
