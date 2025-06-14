"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import { Card, CardHeader, CardBody, Avatar, Tabs, Tab, Button, Input, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import { avatarBase64 } from "@/static/images/avatarDefault";
import Post from "@/components/Post";
import DirectImageCrop from "@/components/DirectImageCrop";
import CropConfirmationModal from "@/components/CropConfirmationModal";
import { Camera, Edit3, Calendar } from "react-feather";
import UserService from "@/services/UserService";
import PostService from "@/services/PostService";
import FollowService from "@/services/FollowService";
import { useMediaUpload } from "@/hooks/useMediaUpload";

// Types matching the backend API
interface UserData {
  id: number;
  username: string;
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  coverPhoto?: string;
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
  dislikes?: number;  comments: number;
  createdAt: Date;
  liked: boolean;
  disliked?: boolean;
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [profilePicture, setProfilePicture] = useState(avatarBase64);
  const [coverPhoto, setCoverPhoto] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followStats, setFollowStats] = useState({ followersCount: 0, followingCount: 0 });

  // New crop workflow states
  const [showProfileCrop, setShowProfileCrop] = useState(false);
  const [showCoverCrop, setShowCoverCrop] = useState(false);
  const [showProfileConfirm, setShowProfileConfirm] = useState(false);
  const [showCoverConfirm, setShowCoverConfirm] = useState(false);
  const [croppedProfileImage, setCroppedProfileImage] = useState<string>('');
  const [croppedCoverImage, setCroppedCoverImage] = useState<string>('');
  const [croppedProfileFile, setCroppedProfileFile] = useState<File | null>(null);
  const [croppedCoverFile, setCroppedCoverFile] = useState<File | null>(null);
  
  const { uploadMedia } = useMediaUpload();

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

      // Set cover photo
      setCoverPhoto(user.coverPhoto || '');

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
        dislikes: 0, // Will need backend support for dislike count
        comments: post.commentCount || 0,        createdAt: new Date(post.createdDate),
        liked: false, // Will need to check user reactions
        disliked: false // Will need to check user reactions
      }));
      setPosts(transformedPosts);

      // Fetch follow statistics
      await fetchFollowStats();    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Không thể tải dữ liệu hồ sơ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  const fetchFollowStats = async () => {
    try {
      const stats = await FollowService.getFollowStats();
      setFollowStats(stats);
    } catch (err) {
      console.error('Error fetching follow stats:', err);
      // Keep default stats on error
    }
  };

  // New streamlined crop workflow handlers
  const handleProfileCropComplete = (croppedImageUrl: string, croppedFile: File) => {
    setCroppedProfileImage(croppedImageUrl);
    setCroppedProfileFile(croppedFile);
    setShowProfileCrop(false);
    setShowProfileConfirm(true);
  };

  const handleCoverCropComplete = (croppedImageUrl: string, croppedFile: File) => {
    setCroppedCoverImage(croppedImageUrl);
    setCroppedCoverFile(croppedFile);
    setShowCoverCrop(false);
    setShowCoverConfirm(true);
  };

  const handleProfileConfirm = async () => {
    if (!croppedProfileFile) return;

    try {
      setUploading(true);
      const urls = await uploadMedia([croppedProfileFile], 'profile');
      if (urls.length > 0) {
        const newProfilePicture = urls[0];
        await UserService.updateUserProfile({ profilePicture: newProfilePicture });
        
        setProfilePicture(newProfilePicture);
        if (userData) {
          setUserData({ ...userData, profilePicture: newProfilePicture });
        }
        
        // Notify other components
        window.dispatchEvent(new CustomEvent('profile-updated'));
        console.log("Profile picture updated:", newProfilePicture);
      }
    } catch (err) {
      console.error('Error updating profile picture:', err);
      setError('Không thể cập nhật ảnh đại diện. Vui lòng thử lại.');
    } finally {
      setUploading(false);
      setShowProfileConfirm(false);
      setCroppedProfileImage('');
      setCroppedProfileFile(null);
    }
  };

  const handleCoverConfirm = async () => {
    if (!croppedCoverFile) return;

    try {
      setUploading(true);
      const urls = await uploadMedia([croppedCoverFile], 'cover');
      if (urls.length > 0) {
        const newCoverPhoto = urls[0];
        await UserService.updateUserProfile({ coverPhoto: newCoverPhoto });
        
        setCoverPhoto(newCoverPhoto);
        if (userData) {
          setUserData({ ...userData, coverPhoto: newCoverPhoto });
        }
        
        console.log("Cover photo updated:", newCoverPhoto);
      }
    } catch (err) {
      console.error('Error updating cover photo:', err);
      setError('Không thể cập nhật ảnh bìa. Vui lòng thử lại.');
    } finally {
      setUploading(false);
      setShowCoverConfirm(false);
      setCroppedCoverImage('');
      setCroppedCoverFile(null);
    }
  };

  const handleProfileRetry = () => {
    setShowProfileConfirm(false);
    setShowProfileCrop(true);
  };
  const handleCoverRetry = () => {
    setShowCoverConfirm(false);
    setShowCoverCrop(true);
  };

  const handleRemoveCoverPhoto = async () => {
    if (!coverPhoto) return;

    try {
      setUploading(true);

      // Remove cover photo via API
      await UserService.deleteCoverPhoto(coverPhoto);

      setCoverPhoto('');

      // Update userData state
      if (userData) {
        setUserData({ ...userData, coverPhoto: undefined });
      }

      console.log("Cover photo removed");
    } catch (err) {
      console.error('Error removing cover photo:', err);
      setError('Không thể xóa ảnh bìa. Vui lòng thử lại.');
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

      // Notify other components (like Sidebar) that profile was updated
      window.dispatchEvent(new CustomEvent('profile-updated'));

      onOpenChange();
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Không thể cập nhật hồ sơ. Vui lòng thử lại.');
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
            <div className="flex items-center justify-center h-64">              <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Đang tải hồ sơ...</p>
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
          )}          <Card className="mb-6">
            <div className="relative">
              <CardHeader className="relative h-40 bg-gradient-to-r from-blue-600 to-blue-400 overflow-hidden">
                {coverPhoto && (
                  <img
                    src={coverPhoto}
                    alt="Cover photo"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}                {/* Cover photo upload button */}
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  color="default"
                  className="absolute top-2 right-2 bg-white/80 dark:bg-gray-800/80 rounded-full backdrop-blur-sm"
                  onClick={() => setShowCoverCrop(true)}
                  isDisabled={uploading}
                >
                  <Camera size={16} />
                </Button>

                {/* Remove cover photo button */}
                {coverPhoto && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    color="danger"
                    className="absolute top-2 right-12 bg-white/80 dark:bg-gray-800/80 rounded-full backdrop-blur-sm"
                    onClick={handleRemoveCoverPhoto}
                    isDisabled={uploading}
                  >
                    ✕
                  </Button>                )}
              </CardHeader>
              
              {/* Avatar positioned relative to the card container, not the header */}
              <div className="absolute -bottom-16 left-4 z-10">
                <div className="relative">
                  <Avatar
                    src={profilePicture}
                    className="w-32 h-32 border-4 border-white shadow-lg"
                    radius="full"
                  />
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    color="default"
                    className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full shadow-md"
                    onClick={() => setShowProfileCrop(true)}
                    isDisabled={uploading}
                  >
                    <Camera size={16} />
                  </Button>
                </div>
              </div>
            </div>
            
            <CardBody className="pt-20 px-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold">
                    {userData?.displayName || userData?.username || 'Đang tải...'}
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400">
                    @{userData?.username || 'loading'}
                  </p>
                  {userData?.dateOfBirth && (
                    <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar size={14} className="mr-1" />
                      Tham gia {new Date(userData.dateOfBirth).toLocaleDateString('vi-VN', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  )}
                </div>
                <Button
                  className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                  startContent={<Edit3 size={16} />} onClick={handleEditProfile}
                >
                  Chỉnh Sửa Hồ Sơ
                </Button>
              </div>                <p className="mt-4 text-gray-700 dark:text-gray-300">
                {userData?.bio || 'Chưa có mô tả'}
              </p>                <div className="flex gap-4 mt-4">
                <div>
                  <span className="font-bold">{posts.length}</span> <span className="text-gray-500 dark:text-gray-400">Bài Viết</span>
                </div>
                <div>
                  <span className="font-bold">{followStats.followersCount}</span> <span className="text-gray-500 dark:text-gray-400">Người Theo Dõi</span>
                </div>
                <div>
                  <span className="font-bold">{followStats.followingCount}</span> <span className="text-gray-500 dark:text-gray-400">Đang Theo Dõi</span>
                </div>
              </div>
            </CardBody>
          </Card>
          <Tabs aria-label="Tab hồ sơ" className="mb-6">
            <Tab key="posts" title="Bài Viết">
              <div className="space-y-4 mt-4">
                {posts.length > 0 ? (
                  posts.map(post => (
                    <Post key={post.id} {...post} />
                  ))) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">Chưa có bài viết nào</p>
                  </div>
                )}
              </div>
            </Tab>            <Tab key="photos" title="Ảnh">
              <div className="grid grid-cols-3 gap-2 mt-4">
                {posts
                  .filter(post => post.image)
                  .map(post => (
                    <div key={post.id} className="relative group cursor-pointer">
                      <img
                        src={post.image}
                        alt="Post media"
                        className="aspect-square object-cover rounded-lg hover:opacity-75 transition-opacity"
                        onClick={() => {
                          // Open image in modal or navigate to post
                          window.open(post.image, '_blank');
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                        <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-center">
                          <p className="text-xs">{post.likes} ❤️ {post.comments} 💬</p>
                        </div>
                      </div>
                    </div>
                  ))
                }
                {posts.filter(post => post.image).length === 0 && (
                  <div className="col-span-3 text-center py-8">
                    <Camera className="mx-auto mb-4 text-gray-400" size={48} />
                    <p className="text-gray-500 dark:text-gray-400">Chưa có ảnh nào</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Chia sẻ những khoảnh khắc đẹp của bạn!</p>
                  </div>                )}
              </div>
            </Tab>
          </Tabs>
        </div>

        {/* Edit Profile Modal */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>                <ModalHeader className="flex flex-col gap-1">
                Chỉnh Sửa Hồ Sơ
              </ModalHeader>
                <ModalBody>
                  <div className="space-y-4">                    <Input
                    label="Tên Hiển Thị"
                    placeholder="Nhập tên hiển thị của bạn"
                    value={editForm.displayName}
                    onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                  />
                    <Textarea
                      label="Mô Tả"
                      placeholder="Hãy kể về bản thân bạn"
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      minRows={3}
                    />
                    <Input
                      label="Ngày Sinh"
                      type="date"
                      value={editForm.dateOfBirth}
                      onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                    />
                  </div>
                </ModalBody>                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Hủy
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleSaveProfile}
                    isLoading={updating}
                  >
                    Lưu Thay Đổi
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>        </Modal>

        {/* New Crop Modals */}        <DirectImageCrop
          isOpen={showProfileCrop}
          onOpenChange={setShowProfileCrop}
          onCropComplete={handleProfileCropComplete}
          cropType="profile"
          title="Cắt ảnh đại diện"
        />        <DirectImageCrop
          isOpen={showCoverCrop}
          onOpenChange={setShowCoverCrop}
          onCropComplete={handleCoverCropComplete}
          cropType="cover"
          title="Cắt ảnh bìa"
        />

        <CropConfirmationModal
          isOpen={showProfileConfirm}
          onOpenChange={setShowProfileConfirm}
          croppedImageUrl={croppedProfileImage}
          onConfirm={handleProfileConfirm}
          onRetry={handleProfileRetry}
          cropType="profile"
          isUploading={uploading}
        />

        <CropConfirmationModal
          isOpen={showCoverConfirm}
          onOpenChange={setShowCoverConfirm}
          croppedImageUrl={croppedCoverImage}
          onConfirm={handleCoverConfirm}
          onRetry={handleCoverRetry}
          cropType="cover"
          isUploading={uploading}
        />
      </main>

      {/* Right sidebar */}
      <RightSidebar />
    </div>
  );
}
