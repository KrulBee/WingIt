"use client";
import React from "react";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import { Card, CardHeader, CardBody, Avatar, Tabs, Tab } from "@nextui-org/react";
import { avatarBase64 } from "@/static/images/avatarDefault";
import Post from "@/components/Post";

// Mock posts data
const POSTS = [
  {
    id: "p1",
    authorName: "John Doe",
    authorUsername: "johndoe",
    authorAvatar: "https://i.pravatar.cc/150?u=johndoe",
    content: "Just updated my portfolio site with some new projects. Check it out!",
    likes: 24,
    comments: 3,
    shares: 2,
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    liked: false
  },
  {
    id: "p2",
    authorName: "John Doe",
    authorUsername: "johndoe",
    authorAvatar: "https://i.pravatar.cc/150?u=johndoe",
    content: "Beautiful sunset from yesterday's hike! 🏔️",
    image: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?q=80&w=1000",
    likes: 56,
    comments: 8,
    shares: 4,
    createdAt: new Date(Date.now() - 172800000), // 2 days ago
    liked: true
  },
];

export default function ProfilePage() {
  return (
    <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Left sidebar */}
      <Sidebar />
        {/* Main content */}
      <main className="flex-1 ml-0 md:ml-64 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader className="relative h-40 bg-gradient-to-r from-blue-600 to-blue-400">
              <div className="absolute -bottom-16 left-4">
                <Avatar 
                  src={avatarBase64}
                  className="w-32 h-32 border-4 border-white"
                  radius="full"
                />
              </div>
            </CardHeader>
            <CardBody className="pt-20 px-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold">John Doe</h1>
                  <p className="text-gray-500 dark:text-gray-400">@johndoe</p>
                </div>
                <button className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                  Edit Profile
                </button>
              </div>
              
              <p className="mt-4 text-gray-700 dark:text-gray-300">
                Web Developer | JavaScript Enthusiast | React & Next.js | Creating beautiful user experiences
              </p>
              
              <div className="flex gap-4 mt-4">
                <div>
                  <span className="font-bold">248</span> <span className="text-gray-500 dark:text-gray-400">Posts</span>
                </div>
                <div>
                  <span className="font-bold">532</span> <span className="text-gray-500 dark:text-gray-400">Followers</span>
                </div>
                <div>
                  <span className="font-bold">319</span> <span className="text-gray-500 dark:text-gray-400">Following</span>
                </div>
              </div>
            </CardBody>
          </Card>
          
          <Tabs aria-label="Profile tabs" className="mb-6">
            <Tab key="posts" title="Posts">
              <div className="space-y-4 mt-4">
                {POSTS.map(post => (
                  <Post key={post.id} {...post} />
                ))}
              </div>
            </Tab>
            <Tab key="photos" title="Photos">
              <div className="grid grid-cols-3 gap-2 mt-4">
                <img src="https://images.unsplash.com/photo-1503614472-8c93d56e92ce?q=80&w=1000" alt="Photo" className="aspect-square object-cover rounded" />
                <img src="https://images.unsplash.com/photo-1566041510639-8d95a2490bfb?q=80&w=1000" alt="Photo" className="aspect-square object-cover rounded" />
                <img src="https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1000" alt="Photo" className="aspect-square object-cover rounded" />
                <img src="https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=1000" alt="Photo" className="aspect-square object-cover rounded" />
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000" alt="Photo" className="aspect-square object-cover rounded" />
                <img src="https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?q=80&w=1000" alt="Photo" className="aspect-square object-cover rounded" />
              </div>
            </Tab>
            <Tab key="likes" title="Likes">
              <div className="space-y-4 mt-4">
                <Post
                  id="l1"
                  authorName="Jane Smith"
                  authorUsername="janesmith"
                  authorAvatar="https://i.pravatar.cc/150?u=janesmith"
                  content="Just finished a great book on modern web development with Next.js and React. Highly recommend it! 📚"
                  likes={42}
                  comments={7}
                  shares={3}
                  createdAt={new Date(Date.now() - 3600000)}
                  liked={true}
                />
              </div>
            </Tab>
          </Tabs>
        </div>
      </main>
      
      {/* Right sidebar */}
      <RightSidebar />
    </div>
  );
}
