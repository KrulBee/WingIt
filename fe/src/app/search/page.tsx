"use client";
import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Card, CardBody, Input, Avatar, Button, Chip, Tabs, Tab } from "@nextui-org/react";
import { Search as SearchIcon, User, Users, Hash, Calendar, Image } from "react-feather";

// Mock data for search results
const usersData = [
  { id: "u1", name: "Jane Smith", username: "janesmith", avatar: "https://i.pravatar.cc/150?u=janesmith", bio: "Digital artist & photographer", followers: 5432 },
  { id: "u2", name: "Robert Wilson", username: "robertw", avatar: "https://i.pravatar.cc/150?u=robertw", bio: "Software developer | Coffee enthusiast", followers: 2103 },
  { id: "u3", name: "Alice Johnson", username: "alicej", avatar: "https://i.pravatar.cc/150?u=alicej", bio: "Travel blogger | Explorer", followers: 8762 },
  { id: "u4", name: "Michael Brown", username: "michaelb", avatar: "https://i.pravatar.cc/150?u=michaelb", bio: "Fitness coach | Healthy lifestyle", followers: 3298 },
];

const postsData = [
  { id: "p1", content: "Just finished my latest project! #design #creativity", author: "Jane Smith", authorUsername: "janesmith", likes: 124, comments: 32 },
  { id: "p2", content: "Beautiful sunset at the beach today. #nature #photography", author: "Robert Wilson", authorUsername: "robertw", likes: 256, comments: 45 },
  { id: "p3", content: "New tutorial on advanced React patterns coming soon!", author: "Michael Brown", authorUsername: "michaelb", likes: 189, comments: 56 },
  { id: "p4", content: "Exploring the mountains this weekend! Who wants to join? #adventure #hiking", author: "Alice Johnson", authorUsername: "alicej", likes: 312, comments: 78 },
];

const tagsData = [
  { id: "t1", name: "photography", postsCount: 1023 },
  { id: "t2", name: "technology", postsCount: 5467 },
  { id: "t3", name: "travel", postsCount: 3215 },
  { id: "t4", name: "design", postsCount: 2876 },
  { id: "t5", name: "coding", postsCount: 1845 },
];

const eventsData = [
  { id: "e1", title: "Web Development Conference", date: "May 25, 2025", location: "San Francisco, CA", attendees: 532 },
  { id: "e2", title: "Art Exhibition: Modern Perspectives", date: "June 10, 2025", location: "New York, NY", attendees: 245 },
  { id: "e3", title: "Tech Startup Meetup", date: "May 30, 2025", location: "Austin, TX", attendees: 178 },
];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Searching for: ${searchQuery}`);
    // In a real app, this would trigger an API call
  };
  
  return (
    <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Left sidebar */}
      <Sidebar />
        {/* Main content */}
      <main className="flex-1 ml-0 md:ml-64 p-6">
        <h1 className="text-2xl font-bold mb-6">Search</h1>
        
        {/* Search form */}
        <form onSubmit={handleSearch} className="mb-6">
          <Input
            type="text"
            placeholder="Search for users, posts, tags, or events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<SearchIcon size={20} />}
            size="lg"
            variant="bordered"
            className="max-w-3xl"
          />
        </form>
        
        {/* Tabs */}
        <Tabs 
          aria-label="Search categories" 
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          className="mb-6"
        >
          <Tab key="all" title={<div className="flex items-center gap-1"><SearchIcon size={16} /> All</div>} />
          <Tab key="people" title={<div className="flex items-center gap-1"><User size={16} /> People</div>} />
          <Tab key="posts" title={<div className="flex items-center gap-1"><Users size={16} /> Posts</div>} />
          <Tab key="tags" title={<div className="flex items-center gap-1"><Hash size={16} /> Tags</div>} />
          <Tab key="events" title={<div className="flex items-center gap-1"><Calendar size={16} /> Events</div>} />
          <Tab key="photos" title={<div className="flex items-center gap-1"><Image size={16} /> Photos</div>} />
        </Tabs>
        
        {/* Search results */}
        {(activeTab === "all" || activeTab === "people") && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">People</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {usersData.map(user => (
                <Card key={user.id} className="w-full">
                  <CardBody className="flex flex-row items-center gap-4">
                    <Avatar src={user.avatar} size="lg" />
                    <div className="flex-1">
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
                      <p className="text-sm mt-1">{user.bio}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{user.followers.toLocaleString()} followers</p>
                    </div>
                    <Button size="sm" color="primary">Follow</Button>
                  </CardBody>
                </Card>
              ))}
            </div>
            {activeTab === "people" && usersData.length > 3 && (
              <div className="mt-4 text-center">
                <Button variant="flat">View More</Button>
              </div>
            )}
          </div>
        )}
        
        {(activeTab === "all" || activeTab === "posts") && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Posts</h2>
            <div className="space-y-4">
              {postsData.map(post => (
                <Card key={post.id} className="w-full">
                  <CardBody>
                    <p className="text-sm mb-2">{post.content}</p>
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">By {post.author}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">@{post.authorUsername}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{post.likes} likes</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{post.comments} comments</span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
            {activeTab === "posts" && postsData.length > 3 && (
              <div className="mt-4 text-center">
                <Button variant="flat">View More</Button>
              </div>
            )}
          </div>
        )}
        
        {(activeTab === "all" || activeTab === "tags") && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Tags</h2>
            <div className="flex flex-wrap gap-3">
              {tagsData.map(tag => (
                <Chip 
                  key={tag.id} 
                  variant="flat" 
                  color="primary"
                  className="cursor-pointer"
                >
                  #{tag.name} ({tag.postsCount})
                </Chip>
              ))}
            </div>
          </div>
        )}
        
        {(activeTab === "all" || activeTab === "events") && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eventsData.map(event => (
                <Card key={event.id} className="w-full">
                  <CardBody>
                    <h3 className="font-medium text-lg">{event.title}</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <Calendar size={16} className="text-gray-500 dark:text-gray-400" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">{event.date}</p>
                    </div>
                    <p className="text-sm mt-1">{event.location}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{event.attendees} attending</p>
                    <div className="mt-4">
                      <Button size="sm" color="primary">Interested</Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === "photos" && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Photos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <div key={num} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <img 
                    src={`https://picsum.photos/300/300?random=${num}`} 
                    alt={`Photo ${num}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
