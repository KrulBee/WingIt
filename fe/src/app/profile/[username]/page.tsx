"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import { Card, CardHeader, CardBody, Avatar, Tabs, Tab, Button, Spinner, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { avatarBase64 } from "@/static/images/avatarDefault";
import Post from "@/components/Post";
import { UserPlus, MessageCircle, MoreHorizontal, UserCheck, UserX, Flag } from "react-feather";
import UserService from "@/services/UserService";
import PostService from "@/services/PostService";
import FriendService from "@/services/FriendService";
import AuthService from "@/services/AuthService";
import BlockService from "@/services/BlockService";
import AuthGuard from "@/components/AuthGuard";

// Types matching the backend API
interface UserData {
  id: number;
  username: string;
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  coverPhoto?: string;
  dateOfBirth?: string;
  createdDate?: string; // Join date
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
  authorUsername: string;  authorAvatar?: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
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
  const [blocking, setBlocking] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

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

      // Check if user is blocked
      await checkBlockStatus(user.id);      // Fetch user posts (only if we can access the profile)
      try {
        const userPosts = await PostService.getPostsByUserId(user.id);
        
        // Transform backend post data to component format
        const transformedPosts: PostProps[] = userPosts.map(post => ({
          id: post.id.toString(),
          authorName: user.displayName || user.username,
          authorUsername: user.username,
          authorAvatar: user.profilePicture,
          content: post.content,
          image: post.mediaUrls?.[0],        likes: post.reactionCount || 0,
          comments: post.commentCount || 0,
          createdAt: new Date(post.createdDate),
          liked: false // Will need to check user reactions
        }));
        
        setPosts(transformedPosts);
      } catch (postError: any) {
        console.warn('Could not fetch user posts:', postError);
        // Posts might be restricted due to privacy, but profile is accessible
        // This is fine - just show empty posts
        setPosts([]);
      }} catch (err: any) {
      console.error('Error fetching user data:', err);
      
      // Check if it's a privacy/permission error
      if (err.response?.status === 403) {
        setError('Hồ sơ này được đặt ở chế độ riêng tư. Chỉ bạn bè mới có thể xem.');
      } else if (err.response?.status === 404) {
        setError('Không tìm thấy người dùng này.');
      } else {
        setError('Không thể tải hồ sơ người dùng. Vui lòng thử lại.');
      }
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
  };

  const checkBlockStatus = async (userId: number) => {
    try {
      const blocked = await BlockService.isUserBlocked(userId);
      setIsBlocked(blocked);
    } catch (err) {
      console.error('Error checking block status:', err);
      setIsBlocked(false);
    }
  };  const handleAddFriend = async () => {
    if (!userData || !currentUser) {
      setError('Không thể gửi lời mời kết bạn. Vui lòng thử lại.');
      return;
    }

    // Extra safety check to prevent self-friend requests
    if (currentUser.id === userData.id) {
      console.warn('Attempted to send friend request to self');
      setError('Không thể gửi lời mời kết bạn cho chính mình.');
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
      const successMessage = `Đã gửi lời mời kết bạn đến ${userData.displayName || userData.username}!`;
      console.log(successMessage);
      
    } catch (err: any) {
      console.error('Error sending friend request:', err);
      
      // Extract meaningful error message
      let errorMessage = 'Không thể gửi lời mời kết bạn. Vui lòng thử lại.';
        if (err.message) {
        if (err.message.includes('already exists') || err.message.includes('duplicate')) {
          errorMessage = 'Lời mời kết bạn đã tồn tại hoặc bạn đã là bạn bè.';
        } else if (err.message.includes('Authentication failed') || err.message.includes('not authenticated')) {
          errorMessage = 'Vui lòng đăng nhập lại để gửi lời mời kết bạn.';
        } else if (err.message.includes('not found')) {
          errorMessage = 'Không tìm thấy người dùng.';
        } else if (err.message.includes('permission')) {
          errorMessage = 'Bạn không có quyền gửi lời mời kết bạn.';
        } else if (err.message.includes('too many requests')) {
          errorMessage = 'Quá nhiều yêu cầu. Vui lòng đợi trước khi thử lại.';
        } else if (err.message.includes('blocked')) {
          errorMessage = 'Không thể gửi lời mời kết bạn đến người dùng này.';
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

  const handleBlockUser = async () => {
    if (!userData || !currentUser || blocking) return;

    const confirmBlock = window.confirm(
      `Bạn có chắc chắn muốn chặn @${userData.username}?\n\n` +
      `Khi chặn người này:\n` +
      `• Họ sẽ không thể xem hồ sơ của bạn\n` +
      `• Họ sẽ không thể gửi tin nhắn cho bạn\n` +
      `• Bạn sẽ không thấy bài viết của họ\n` +
      `• Tình bạn hiện tại (nếu có) sẽ bị hủy`
    );

    if (!confirmBlock) return;

    try {
      setBlocking(true);
      await BlockService.blockUser(userData.id);

      setIsBlocked(true);
      alert(`Đã chặn @${userData.username} thành công.`);

    } catch (error: any) {
      console.error('Error blocking user:', error);
      alert(error.message || 'Không thể chặn người dùng. Vui lòng thử lại.');
    } finally {
      setBlocking(false);
    }
  };

  const handleUnblockUser = async () => {
    if (!userData || !currentUser || blocking) return;

    const confirmUnblock = window.confirm(
      `Bạn có chắc chắn muốn bỏ chặn @${userData.username}?`
    );

    if (!confirmUnblock) return;

    try {
      setBlocking(true);
      await BlockService.unblockUserById(userData.id);

      setIsBlocked(false);
      alert(`Đã bỏ chặn @${userData.username} thành công.`);

    } catch (error: any) {
      console.error('Error unblocking user:', error);
      alert(error.message || 'Không thể bỏ chặn người dùng. Vui lòng thử lại.');
    } finally {
      setBlocking(false);
    }
  };

  const handleReportUser = () => {
    // TODO: Implement user reporting
    alert('Tính năng báo cáo người dùng sẽ được triển khai sớm.');
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
    const isPrivacyError = error.includes('riêng tư');
    
    return (
      <AuthGuard>
        <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-0 md:ml-64 p-4 lg:pr-80">
            <div className="max-w-2xl mx-auto">
              <Card className="p-8 text-center">
                <CardBody className="space-y-4">
                  {isPrivacyError ? (
                    <>
                      <div className="text-6xl mb-4">🔒</div>
                      <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                        Hồ sơ riêng tư
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        Hồ sơ này được đặt ở chế độ riêng tư. Chỉ bạn bè mới có thể xem thông tin và bài viết.
                      </p>
                      <Button 
                        color="primary"
                        onClick={() => router.push('/home')}
                        className="mt-4"
                      >
                        Quay về trang chủ
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="text-6xl mb-4">❌</div>
                      <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                        Không thể tải hồ sơ
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400">
                        {error}
                      </p>
                      <Button 
                        onClick={() => fetchUserData()}
                        color="primary"
                        className="mt-4"
                      >
                        Thử lại
                      </Button>
                    </>
                  )}
                </CardBody>
              </Card>
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
                <p className="text-gray-500 dark:text-gray-400">Không tìm thấy người dùng</p>                <Button 
                  onClick={() => router.push('/search')}
                  className="mt-2"
                  color="primary"
                >
                  Tìm kiếm người dùng
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
          <div className="max-w-2xl mx-auto">            {/* Profile Header */}
            <Card className="mb-6">
              <div className="relative">
                <CardHeader className="relative h-40 bg-gradient-to-r from-blue-600 to-blue-400 overflow-hidden p-0">
                  {userData.coverPhoto && (
                    <img 
                      src={userData.coverPhoto}
                      alt="Cover photo" 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}                
                </CardHeader>
                
                {/* Avatar positioned relative to the card container, not the header */}
                <div className="absolute -bottom-16 left-4 z-10">
                  <Avatar
                    src={userData.profilePicture || avatarBase64}
                    alt={userData.displayName || userData.username}
                    className="w-32 h-32 border-4 border-white shadow-lg"
                    radius="full"
                  />
                </div>
              </div>
              
              <CardBody className="pt-20 px-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">
                      {userData.displayName || userData.username}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                      @{userData.username}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 mt-4 md:mt-0">
                    {!isFriend && !friendRequestSent && (
                      <Button
                        color="primary"
                        startContent={<UserPlus size={16} />}
                        onClick={handleAddFriend}
                        isLoading={addingFriend}
                        size="sm"                      >
                        Kết bạn
                      </Button>
                    )}
                    {friendRequestSent && (
                      <Button
                        color="default"
                        variant="flat"
                        size="sm"                        disabled
                      >
                        Đã gửi yêu cầu
                      </Button>
                    )}
                    {isFriend && (
                      <Button
                        color="success"
                        variant="flat"
                        size="sm"                        disabled
                      >
                        Bạn bè
                      </Button>
                    )}
                    <Button
                      color="primary"
                      variant="flat"
                      startContent={<MessageCircle size={16} />}
                      onClick={handleMessage}                      size="sm"
                    >
                      Nhắn tin
                    </Button>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          isIconOnly
                          variant="flat"
                          size="sm"
                        >
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label="Hành động người dùng"
                        onAction={(key) => {
                          switch (key) {
                            case 'block':
                              handleBlockUser();
                              break;
                            case 'unblock':
                              handleUnblockUser();
                              break;
                            case 'report':
                              handleReportUser();
                              break;
                            default:
                              break;
                          }
                        }}
                      >
                        {isBlocked ? (
                          <DropdownItem
                            key="unblock"
                            className="text-success"
                            color="success"
                            startContent={<UserX size={16} />}
                          >
                            Bỏ chặn người dùng
                          </DropdownItem>
                        ) : (
                          <DropdownItem
                            key="block"
                            className="text-danger"
                            color="danger"
                            startContent={<UserX size={16} />}
                          >
                            Chặn người dùng
                          </DropdownItem>
                        )}
                        <DropdownItem
                          key="report"
                          startContent={<Flag size={16} />}
                        >
                          Báo cáo người dùng
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </div>
                
                {userData.bio && (
                  <p className="mt-4 text-gray-700 dark:text-gray-300">
                    {userData.bio}
                  </p>
                )}
              </CardBody>
            </Card>

            {/* Profile Tabs */}
            <Card>
              <CardBody>                <Tabs aria-label="Tùy chọn hồ sơ" fullWidth>
                  <Tab key="posts" title={`Bài viết (${posts.length})`}>
                    <div className="space-y-4 mt-4">
                      {posts.length > 0 ? (
                        posts.map((post) => (
                          <Post
                            key={post.id}
                            id={post.id}
                            authorName={post.authorName}
                            authorUsername={post.authorUsername}
                            authorAvatar={post.authorAvatar}
                            content={post.content}                            image={post.image}
                            likes={post.likes}
                            comments={post.comments}
                            createdAt={post.createdAt}
                            liked={post.liked}
                          />
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500 dark:text-gray-400">
                            Chưa có bài viết nào
                          </p>
                        </div>
                      )}
                    </div>
                  </Tab>
                  <Tab key="about" title="Giới thiệu">
                    <div className="mt-4 space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Thông tin hồ sơ</h3>
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
                          )}                          {userData.dateOfBirth && (
                            <div>
                              <span className="font-medium">Ngày sinh:</span> {new Date(userData.dateOfBirth).toLocaleDateString('vi-VN')}
                            </div>
                          )}
                          {userData.createdDate && (
                            <div>
                              <span className="font-medium">Tham gia:</span> {new Date(userData.createdDate).toLocaleDateString('vi-VN')}
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
