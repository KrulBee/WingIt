"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import { Card, CardHeader, CardBody, Avatar, Tabs, Tab, Button, Input, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import { avatarBase64 } from "@/static/images/avatarDefault";
import Post from "@/components/Post";
import MediaUpload from "@/components/MediaUpload";
import { Camera, Edit3, Calendar } from "react-feather";
import UserService from "@/services/UserService";
import PostService from "@/services/PostService";

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

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [profilePicture, setProfilePicture] = useState(avatarBase64);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Edit profile modal
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: '',
    dateOfBirth: ''
  });
  const [updating, setUpdating] = useState(false);

  // Fetch user profile and posts on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch current user profile
      const user = await UserService.getCurrentUserProfile();
      setUserData(user);
      
      // Set profile picture
      setProfilePicture(user.profilePicture || avatarBase64);
      
      // Set edit form initial values
      setEditForm({
        displayName: user.displayName || '',
        bio: user.bio || '',
        dateOfBirth: user.dateOfBirth || ''
      });
      
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
      setError('Failed to load profile data. Please try again.');
      
      // Fallback to mock data if API fails
      setUserData({
        id: 1,
        username: 'johndoe',
        displayName: 'John Doe',
        bio: 'Web Developer | JavaScript Enthusiast | React & Next.js | Creating beautiful user experiences'
      });
      
      // Mock posts as fallback
      const mockPosts: PostProps[] = [
        {
          id: "p1",
          authorName: "John Doe",
          authorUsername: "johndoe",
          authorAvatar: profilePicture,
          content: "Just updated my portfolio site with some new projects. Check it out!",
          likes: 24,
          comments: 3,
          shares: 2,
          createdAt: new Date(Date.now() - 86400000),
          liked: false
        }
      ];
      setPosts(mockPosts);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureUpload = async (urls: string[]) => {
    if (urls.length === 0) return;
    
    try {
      setUploading(true);
      const newProfilePicture = urls[0];
      
      // Update profile picture via API
      await UserService.updateUserProfile({ profilePicture: newProfilePicture });
      
      setProfilePicture(newProfilePicture);
      setShowUpload(false);
      
      // Update userData state
      if (userData) {
        setUserData({ ...userData, profilePicture: newProfilePicture });
      }
      
      console.log("Profile picture updated:", newProfilePicture);
    } catch (err) {
      console.error('Error updating profile picture:', err);
      setError('Failed to update profile picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleEditProfile = () => {
    if (userData) {
      setEditForm({
        displayName: userData.displayName || '',
        bio: userData.bio || '',
        dateOfBirth: userData.dateOfBirth || ''
      });
    }
    onOpen();
  };

  const handleSaveProfile = async () => {
    try {
      setUpdating(true);
      
      await UserService.updateUserProfile(editForm);
      
      // Update local state
      if (userData) {
        setUserData({
          ...userData,
          displayName: editForm.displayName,
          bio: editForm.bio,
          dateOfBirth: editForm.dateOfBirth
        });
      }
      
      onOpenChange();
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-64 p-4 lg:pr-80">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
              </div>
            </div>
          </div>
        </main>        <RightSidebar />
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Left sidebar */}
      <Sidebar />
        {/* Main content */}
      <main className="flex-1 ml-0 md:ml-64 p-4 lg:pr-80">
        <div className="max-w-2xl mx-auto">
          {error && (
            <Card className="mb-4 border-red-200 bg-red-50 dark:bg-red-900/20">
              <CardBody>
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </CardBody>
            </Card>
          )}
          
          <Card className="mb-6">
            <CardHeader className="relative h-40 bg-gradient-to-r from-blue-600 to-blue-400">
              <div className="absolute -bottom-16 left-4">
                <div className="relative">
                  <Avatar 
                    src={profilePicture}
                    className="w-32 h-32 border-4 border-white"
                    radius="full"
                  />
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    color="default"
                    className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full"
                    onClick={() => setShowUpload(!showUpload)}
                    isDisabled={uploading}
                  >
                    <Camera size={16} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardBody className="pt-20 px-6">
              {showUpload && (
                <div className="mb-6">
                  <MediaUpload 
                    type="profile" 
                    onUploadComplete={handleProfilePictureUpload} 
                  />
                  {uploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
                </div>
              )}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold">
                    {userData?.displayName || userData?.username || 'Loading...'}
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400">
                    @{userData?.username || 'loading'}
                  </p>
                  {userData?.dateOfBirth && (
                    <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar size={14} className="mr-1" />
                      Joined {new Date(userData.dateOfBirth).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <Button 
                  className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                  startContent={<Edit3 size={16} />}
                  onClick={handleEditProfile}
                >
                  Edit Profile
                </Button>
              </div>
                <p className="mt-4 text-gray-700 dark:text-gray-300">
                {userData?.bio || 'No bio available'}
              </p>
              
              <div className="flex gap-4 mt-4">
                <div>
                  <span className="font-bold">{posts.length}</span> <span className="text-gray-500 dark:text-gray-400">Posts</span>
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
                {posts.length > 0 ? (
                  posts.map(post => (
                    <Post key={post.id} {...post} />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No posts yet</p>
                  </div>
                )}
              </div>
            </Tab>
            <Tab key="photos" title="Photos">
              <div className="grid grid-cols-3 gap-2 mt-4">
                {posts
                  .filter(post => post.image)
                  .slice(0, 6)
                  .map(post => (
                    <img 
                      key={post.id} 
                      src={post.image} 
                      alt="Post media" 
                      className="aspect-square object-cover rounded" 
                    />
                  ))
                }
                {posts.filter(post => post.image).length === 0 && (
                  <div className="col-span-3 text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No photos yet</p>
                  </div>
                )}
              </div>
            </Tab>
            <Tab key="likes" title="Likes">
              <div className="space-y-4 mt-4">
                {posts
                  .filter(post => post.liked)
                  .map(post => (
                    <Post key={post.id} {...post} />
                  ))
                }
                {posts.filter(post => post.liked).length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No liked posts yet</p>
                  </div>
                )}
              </div>
            </Tab>
          </Tabs>
        </div>

        {/* Edit Profile Modal */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Edit Profile
                </ModalHeader>
                <ModalBody>
                  <div className="space-y-4">
                    <Input
                      label="Display Name"
                      placeholder="Enter your display name"
                      value={editForm.displayName}
                      onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
                    />
                    <Textarea
                      label="Bio"
                      placeholder="Tell us about yourself"
                      value={editForm.bio}
                      onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                      minRows={3}
                    />
                    <Input
                      label="Date of Birth"
                      type="date"
                      value={editForm.dateOfBirth}
                      onChange={(e) => setEditForm({...editForm, dateOfBirth: e.target.value})}
                    />
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    color="primary" 
                    onPress={handleSaveProfile}
                    isLoading={updating}
                  >
                    Save Changes
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </main>
      
      {/* Right sidebar */}
      <RightSidebar />
    </div>
  );
}
