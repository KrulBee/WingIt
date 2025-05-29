"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import { Card, CardHeader, CardBody, Avatar, Tabs, Tab, Button, Spinner } from "@nextui-org/react";
import { avatarBase64 } from "@/static/images/avatarDefault";
import Post from "@/components/Post";
import { UserPlus, MessageCircle, MoreHorizontal } from "react-feather";
import UserService from "@/services/UserService";
import PostService from "@/services/PostService";
import FriendService from "@/services/FriendService";
import AuthService from "@/services/AuthService";
import AuthGuard from "@/components/AuthGuard";

// Types matching the backend API
interface UserData {
  id: number;
  username: string;
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  dateOfBirth?: string;
}

interface PostData {
  id: number;
  content: string;
  userId: number;
  user?: {
    id: number;
    username: string;
    displayName?: string;
    profilePicture?: string;
  };
  createdDate: string;
  updatedDate?: string;
  mediaUrls?: string[];
  location?: {
    id: number;
    name: string;
  };
  postType?: {
    id: number;
    name: string;
  };
  reactionCount?: number;
  commentCount?: number;
}

interface PostProps {
  id: string;
  authorName: string;
  authorUsername: string;
  authorAvatar?: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: Date;
  liked: boolean;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params?.username as string;
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFriend, setIsFriend] = useState(false);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [addingFriend, setAddingFriend] = useState(false);

  // Fetch user profile and posts on component mount
  useEffect(() => {
    if (username) {
      fetchUserData();
      fetchCurrentUser();
    }
  }, [username]);

  const fetchCurrentUser = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if this is the current user's profile
      const currentUserData = await AuthService.getCurrentUser();
      if (currentUserData.username === username) {
        // Redirect to own profile page
        router.push('/profile');
        return;
      }
      
      // Fetch target user profile
      const user = await UserService.getUserByUsername(username);
      setUserData(user);
      
      // Check friendship status
      await checkFriendshipStatus(user.id);
      
      // Fetch user posts
      const userPosts = await PostService.getPostsByUserId(user.id);
      
      // Transform backend post data to component format
      const transformedPosts: PostProps[] = userPosts.map(post => ({
        id: post.id.toString(),
        authorName: user.displayName || user.username,
        authorUsername: user.username,
        authorAvatar: user.profilePicture,
        content: post.content,
        image: post.mediaUrls?.[0],
        likes: post.reactionCount || 0,
        comments: post.commentCount || 0,
        shares: 0, // Not available in backend yet
        createdAt: new Date(post.createdDate),
        liked: false // Will need to check user reactions
      }));
      
      setPosts(transformedPosts);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };  const checkFriendshipStatus = async (userId: number) => {
    try {
      // Check if already friends
      const friends = await FriendService.getFriends();
      const isAlreadyFriend = friends.some(friend => friend.friend.id === userId);
      setIsFriend(isAlreadyFriend);

      if (!isAlreadyFriend) {
        // Check if friend request already sent
        const sentRequests = await FriendService.getSentFriendRequests();
        const requestSent = sentRequests.some(request => request.receiver.id === userId);
        setFriendRequestSent(requestSent);
      }
    } catch (err) {
      console.error('Error checking friendship status:', err);
    }
  };  const handleAddFriend = async () => {
    if (!userData || !currentUser) {
      setError('Unable to send friend request. Please try again.');
      return;
    }

    // Extra safety check to prevent self-friend requests
    if (currentUser.id === userData.id) {
      console.warn('Attempted to send friend request to self');
      setError('Cannot send friend request to yourself.');
      return;
    }

    // Check if already friends or request already sent
    if (isFriend) {
      setError('You are already friends with this user.');
      return;
    }

    if (friendRequestSent) {
      setError('Friend request already sent to this user.');
      return;
    }

    try {
      setAddingFriend(true);
      setError(''); // Clear any previous errors
      
      console.log('Sending friend request to:', {
        userId: userData.id,
        username: userData.username,
        currentUser: currentUser.id
      });

      await FriendService.sendFriendRequest(userData.id);
      setFriendRequestSent(true);
      setError(''); // Clear any errors on success
      
      // Show success message briefly
      const successMessage = `Friend request sent to ${userData.displayName || userData.username}!`;
      console.log(successMessage);
      
    } catch (err: any) {
      console.error('Error sending friend request:', err);
      
      // Extract meaningful error message
      let errorMessage = 'Failed to send friend request. Please try again.';
      
      if (err.message) {
        if (err.message.includes('already exists') || err.message.includes('duplicate')) {
          errorMessage = 'Friend request already exists or you are already friends.';
        } else if (err.message.includes('Authentication failed') || err.message.includes('not authenticated')) {
          errorMessage = 'Please log in again to send friend requests.';
        } else if (err.message.includes('not found')) {
          errorMessage = 'User not found.';
        } else if (err.message.includes('permission')) {
          errorMessage = 'You do not have permission to send friend requests.';
        } else if (err.message.includes('too many requests')) {
          errorMessage = 'Too many requests. Please wait before trying again.';
        } else if (err.message.includes('blocked')) {
          errorMessage = 'Unable to send friend request to this user.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setAddingFriend(false);
    }
  };

  const handleMessage = () => {
    // Navigate to messages page with this user
    router.push(`/messages?user=${username}`);
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-0 md:ml-64 p-4 lg:pr-80">
            <div className="max-w-2xl mx-auto">
              <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
              </div>
            </div>
          </main>
          <RightSidebar />
        </div>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard>
        <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-0 md:ml-64 p-4 lg:pr-80">
            <div className="max-w-2xl mx-auto">
              <div className="text-center text-red-500 p-4">
                <p>{error}</p>
                <Button 
                  onClick={() => fetchUserData()}
                  className="mt-2"
                  color="primary"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </main>
          <RightSidebar />
        </div>
      </AuthGuard>
    );
  }

  if (!userData) {
    return (
      <AuthGuard>
        <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-0 md:ml-64 p-4 lg:pr-80">
            <div className="max-w-2xl mx-auto">
              <div className="text-center p-4">
                <p className="text-gray-500 dark:text-gray-400">User not found</p>
                <Button 
                  onClick={() => router.push('/search')}
                  className="mt-2"
                  color="primary"
                >
                  Search Users
                </Button>
              </div>
            </div>
          </main>
          <RightSidebar />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
        <Sidebar />
        
        <main className="flex-1 ml-0 md:ml-64 p-4 lg:pr-80">
          <div className="max-w-2xl mx-auto">
            {/* Profile Header */}
            <Card className="mb-6">
              <CardHeader className="flex gap-3">
                <Avatar
                  src={userData.profilePicture || avatarBase64}
                  alt={userData.displayName || userData.username}
                  className="w-20 h-20"
                  isBordered
                />
                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl font-bold">
                        {userData.displayName || userData.username}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        @{userData.username}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!isFriend && !friendRequestSent && (
                        <Button
                          color="primary"
                          startContent={<UserPlus size={16} />}
                          onClick={handleAddFriend}
                          isLoading={addingFriend}
                          size="sm"
                        >
                          Add Friend
                        </Button>
                      )}
                      {friendRequestSent && (
                        <Button
                          color="default"
                          variant="flat"
                          size="sm"
                          disabled
                        >
                          Request Sent
                        </Button>
                      )}
                      {isFriend && (
                        <Button
                          color="success"
                          variant="flat"
                          size="sm"
                          disabled
                        >
                          Friends
                        </Button>
                      )}
                      <Button
                        color="primary"
                        variant="flat"
                        startContent={<MessageCircle size={16} />}
                        onClick={handleMessage}
                        size="sm"
                      >
                        Message
                      </Button>
                      <Button
                        isIconOnly
                        variant="flat"
                        size="sm"
                      >
                        <MoreHorizontal size={16} />
                      </Button>
                    </div>
                  </div>
                  {userData.bio && (
                    <p className="text-sm mt-2 text-gray-600 dark:text-gray-300">
                      {userData.bio}
                    </p>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Profile Tabs */}
            <Card>
              <CardBody>
                <Tabs aria-label="Profile options" fullWidth>
                  <Tab key="posts" title={`Posts (${posts.length})`}>
                    <div className="space-y-4 mt-4">
                      {posts.length > 0 ? (
                        posts.map((post) => (
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
                            liked={post.liked}
                          />
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500 dark:text-gray-400">
                            No posts yet
                          </p>
                        </div>
                      )}
                    </div>
                  </Tab>
                  <Tab key="about" title="About">
                    <div className="mt-4 space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Profile Information</h3>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Username:</span> @{userData.username}
                          </div>
                          {userData.displayName && (
                            <div>
                              <span className="font-medium">Display Name:</span> {userData.displayName}
                            </div>
                          )}
                          {userData.bio && (
                            <div>
                              <span className="font-medium">Bio:</span> {userData.bio}
                            </div>
                          )}
                          {userData.dateOfBirth && (
                            <div>
                              <span className="font-medium">Date of Birth:</span> {userData.dateOfBirth}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Tab>
                </Tabs>
              </CardBody>
            </Card>
          </div>
        </main>
        
        <RightSidebar />
      </div>
    </AuthGuard>
  );
}
