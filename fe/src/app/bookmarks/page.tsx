"use client";
import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Post from "@/components/Post";
import { Tabs, Tab, Input, Button, Card, CardBody, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { Search, Filter, MoreHorizontal } from "react-feather";

// Mock data for bookmarked posts
const bookmarkedPosts = [
  {
    id: "post1",
    authorName: "Jane Smith",
    authorUsername: "janesmith",
    authorAvatar: "https://i.pravatar.cc/150?u=janesmith",
    content: "Just released a new design system for our product. Check it out and let me know what you think! #design #ux",
    image: "https://picsum.photos/800/500?random=1",
    likes: 245,
    comments: 37,
    shares: 12,
    createdAt: new Date(2025, 4, 10),
    category: "Design"
  },
  {
    id: "post2",
    authorName: "Robert Wilson",
    authorUsername: "robertw",
    authorAvatar: "https://i.pravatar.cc/150?u=robertw",
    content: "10 tips for improving your productivity as a developer. I've been using these techniques for years and they've really helped me stay focused and efficient.",
    likes: 182,
    comments: 29,
    shares: 24,
    createdAt: new Date(2025, 4, 12),
    category: "Development"
  },
  {
    id: "post3",
    authorName: "Alice Johnson",
    authorUsername: "alicej",
    authorAvatar: "https://i.pravatar.cc/150?u=alicej",
    content: "Our team just shipped a major feature that's been months in the making. So proud of everyone's hard work! #teamwork #milestone",
    image: "https://picsum.photos/800/500?random=3",
    likes: 348,
    comments: 52,
    shares: 31,
    createdAt: new Date(2025, 4, 14),
    category: "Work"
  },
  {
    id: "post4",
    authorName: "Michael Brown",
    authorUsername: "michaelb",
    authorAvatar: "https://i.pravatar.cc/150?u=michaelb",
    content: "Here's my take on the latest React updates and how they'll change our development workflow. Thread 🧵👇",
    likes: 275,
    comments: 64,
    shares: 42,
    createdAt: new Date(2025, 4, 15),
    category: "Development"
  },
  {
    id: "post5",
    authorName: "Emily Davis",
    authorUsername: "emilyd",
    authorAvatar: "https://i.pravatar.cc/150?u=emilyd",
    content: "Beautiful hike in the mountains this weekend. Nature always helps me reset and come back to work refreshed. #outdoors #nature #weekend",
    image: "https://picsum.photos/800/500?random=5",
    likes: 412,
    comments: 28,
    shares: 15,
    createdAt: new Date(2025, 4, 16),
    category: "Personal"
  }
];

// Mock data for custom collections
const collections = [
  { id: "all", name: "All Bookmarks", count: bookmarkedPosts.length },
  { id: "dev", name: "Development", count: 2 },
  { id: "design", name: "Design", count: 1 },
  { id: "inspo", name: "Inspiration", count: 3 },
  { id: "readlater", name: "Read Later", count: 7 },
];

export default function BookmarksPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCollection, setActiveCollection] = useState("all");
  
  // Filter bookmarks based on search term
  const filteredBookmarks = bookmarkedPosts.filter(post => 
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.authorUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.category && post.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-64 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Bookmarks</h1>
          <div className="flex gap-2">
            <Button color="primary" size="sm">New Collection</Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Collections sidebar */}
          <div className="lg:col-span-1">
            <Card className="w-full">
              <CardBody className="p-0">
                <div className="p-4">
                  <Input
                    placeholder="Search bookmarks..."
                    startContent={<Search size={18} />}
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    size="sm"
                    radius="sm"
                    variant="bordered"
                  />
                </div>
                <div className="space-y-1">
                  {collections.map(collection => (
                    <div 
                      key={collection.id}
                      className={`flex justify-between items-center px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${activeCollection === collection.id ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                      onClick={() => setActiveCollection(collection.id)}
                    >
                      <div className="font-medium">{collection.name}</div>
                      <div className="text-xs bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-1">
                        {collection.count}
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
          
          {/* Bookmarks content */}
          <div className="lg:col-span-3">
            <Card className="w-full">
              <CardBody>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {collections.find(c => c.id === activeCollection)?.name || "All Bookmarks"}
                  </h2>
                  <div className="flex gap-2">
                    <Button 
                      isIconOnly 
                      variant="light" 
                      aria-label="Filter"
                    >
                      <Filter size={20} />
                    </Button>
                    <Dropdown placement="bottom-end">
                      <DropdownTrigger>
                        <Button 
                          isIconOnly 
                          variant="light" 
                          aria-label="More options"
                        >
                          <MoreHorizontal size={20} />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Collection options">
                        <DropdownItem key="edit">Edit collection</DropdownItem>
                        <DropdownItem key="sort">Sort by date</DropdownItem>
                        <DropdownItem key="export">Export bookmarks</DropdownItem>
                        <DropdownItem key="delete" className="text-danger" color="danger">
                          Delete collection
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </div>
                
                {filteredBookmarks.length > 0 ? (
                  <div className="space-y-4">
                    {filteredBookmarks.map(post => (
                      <Post
                        key={post.id}
                        id={post.id}
                        authorName={post.authorName}
                        authorUsername={post.authorUsername}
                        authorAvatar={post.authorAvatar}
                        content={post.content}
                        image={post.image}
                        likes={post.likes}
                        comments={post.comments}
                        shares={post.shares}
                        createdAt={post.createdAt}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400">No bookmarks found for this search.</p>
                    <Button variant="flat" size="sm" className="mt-2" onClick={() => setSearchTerm("")}>
                      Clear search
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
