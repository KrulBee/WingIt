"use client";
import React from "react";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import { Card, CardBody, Avatar, Tabs, Tab, Button } from "@nextui-org/react";

interface NotificationProps {
  id: string;
  type: "like" | "comment" | "follow" | "mention";
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  time: string;
  read: boolean;
}

const notifications: NotificationProps[] = [
  {
    id: "n1",
    type: "like",
    user: {
      name: "Jane Smith",
      username: "janesmith",
      avatar: "https://i.pravatar.cc/150?u=janesmith",
    },
    content: "liked your post",
    time: "2 minutes ago",
    read: false,
  },
  {
    id: "n2",
    type: "comment",
    user: {
      name: "Alice Johnson",
      username: "alicej",
      avatar: "https://i.pravatar.cc/150?u=alicej",
    },
    content: "commented on your post: \"Great article, thanks for sharing!\"",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "n3",
    type: "follow",
    user: {
      name: "Robert Wilson",
      username: "robertw",
      avatar: "https://i.pravatar.cc/150?u=robertw",
    },
    content: "started following you",
    time: "3 hours ago",
    read: true,
  },
  {
    id: "n4",
    type: "mention",
    user: {
      name: "Emily Davis",
      username: "emilyd",
      avatar: "https://i.pravatar.cc/150?u=emilyd",
    },
    content: "mentioned you in a comment: \"@johndoe what do you think about this?\"",
    time: "1 day ago",
    read: true,
  },
  {
    id: "n5",
    type: "like",
    user: {
      name: "Michael Brown",
      username: "michaelb",
      avatar: "https://i.pravatar.cc/150?u=michaelb",
    },
    content: "liked your photo",
    time: "2 days ago",
    read: true,
  },
];

const NotificationItem = ({ notification }: { notification: NotificationProps }) => {
  return (
    <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
      <div className="flex items-start gap-3">
        <Avatar src={notification.user.avatar} className="flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm">
            <span className="font-medium">{notification.user.name}</span> {notification.content}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</p>
        </div>
        {!notification.read && (
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
        )}
      </div>
    </div>
  );
};

export default function NotificationsPage() {
  return (
    <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Left sidebar */}
      <Sidebar />
        {/* Main content */}
      <main className="flex-1 ml-0 md:ml-64 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Notifications</h1>
            <Button size="sm" variant="light">Mark all as read</Button>
          </div>
          
          <Tabs aria-label="Notification options">
            <Tab key="all" title="All">
              <Card>
                <CardBody className="p-0">
                  {notifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </CardBody>
              </Card>
            </Tab>
            <Tab key="unread" title="Unread">
              <Card>
                <CardBody className="p-0">
                  {notifications.filter(n => !n.read).map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </CardBody>
              </Card>
            </Tab>
          </Tabs>
        </div>
      </main>
      
      {/* Right sidebar */}
      <RightSidebar />
    </div>
  );
}
