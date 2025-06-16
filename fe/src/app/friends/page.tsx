"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import { Avatar, Tabs, Tab, Button } from "@nextui-org/react";
import { User, UserCheck, UserPlus, UserX } from "react-feather";
import FriendService from "@/services/FriendService";
import { useProfileNavigation } from "@/utils/profileNavigation";
import { AuthService } from "@/services";
import { avatarBase64 } from "@/static/images/avatarDefault";

// Types matching the backend API
interface UserDTO {
  id: number;
  username: string;
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  dateOfBirth?: string;
}

interface FriendDTO {
  id: number;
  friend: UserDTO;
  friendshipDate: string;
}

interface FriendRequestDTO {
  id: number;
  sender: UserDTO;
  receiver: UserDTO;
  status: string;
  requestDate: string;
  responseDate?: string;
}

// UI interface for compatibility
interface FriendProps {
  id: string;
  name: string;
  username: string;
  avatar: string;
  mutualFriends?: number;
  originalId?: number; // Store the backend ID
}

// Generate a consistent avatar src with fallback
const getAvatarSrc = (avatar?: string, username?: string) => {
  if (avatar && avatar.trim() !== '') {
    return avatar;
  }
  // Use the default avatar as fallback
  return avatarBase64;
};

const FriendCard = ({ friend, onUnfriend, currentUser, router }: { friend: FriendProps; onUnfriend: (friendId: string) => void; currentUser: any; router: any }) => {
  const { navigateToProfile } = useProfileNavigation();

  const handleAvatarClick = () => {
    // Don't navigate if clicking on own avatar
    if (currentUser && currentUser.username === friend.username) {
      return;
    }
    navigateToProfile(friend.username);
  };

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">      <div className="flex items-center mb-3">
        <Avatar 
          src={getAvatarSrc(friend.avatar, friend.username)} 
          className="mr-3 cursor-pointer hover:scale-105 transition-transform" 
          size="lg" 
          onClick={handleAvatarClick}
        />
        <div>
          <h3 className="font-medium">{friend.name}</h3>          <p className="text-sm text-gray-500 dark:text-gray-400">@{friend.username}</p>          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            0 bạn chung
          </p>
        </div>
      </div>
      <div className="flex justify-end gap-2">        <Button 
          size="sm" 
          color="primary"
          variant="flat"
          startContent={<User size={16} />}
          onPress={() => router.push(`/profile/${friend.username}`)}
        >
          Hồ Sơ
        </Button>
        <Button 
          size="sm" 
          color="danger"
          variant="flat"
          startContent={<UserX size={16} />}
          onPress={() => onUnfriend(friend.id)}
        >
          Hủy Kết Bạn
        </Button>
      </div>
    </div>
  );
};

const RequestCard = ({ request, onAccept, onReject, currentUser }: { request: FriendProps; onAccept: (requestId: string) => void; onReject: (requestId: string) => void; currentUser: any }) => {
  const { navigateToProfile } = useProfileNavigation();

  const handleAvatarClick = () => {
    // Don't navigate if clicking on own avatar
    if (currentUser && currentUser.username === request.username) {
      return;
    }
    navigateToProfile(request.username);
  };

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">      <div className="flex items-center mb-3">
        <Avatar 
          src={getAvatarSrc(request.avatar, request.username)} 
          className="mr-3 cursor-pointer hover:scale-105 transition-transform" 
          size="lg" 
          onClick={handleAvatarClick}
        />
        <div>
          <h3 className="font-medium">{request.name}</h3>          <p className="text-sm text-gray-500 dark:text-gray-400">@{request.username}</p>          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            0 bạn chung
          </p>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button 
          size="sm" 
          color="success"
          variant="flat"
          startContent={<UserCheck size={16} />}
          onPress={() => onAccept(request.id)}        >
          Chấp Nhận
        </Button>
        <Button 
          size="sm" 
          color="danger"
          variant="flat"
          startContent={<UserX size={16} />}
          onPress={() => onReject(request.id)}
        >
          Từ Chối
        </Button>
      </div>
    </div>
  );
};

const SuggestionCard = ({ suggestion, onAddFriend, currentUser }: { suggestion: FriendProps; onAddFriend: (userId: string) => void; currentUser: any }) => {
  const { navigateToProfile } = useProfileNavigation();

  const handleAvatarClick = () => {
    // Don't navigate if clicking on own avatar
    if (currentUser && currentUser.username === suggestion.username) {
      return;
    }
    navigateToProfile(suggestion.username);
  };

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">      <div className="flex items-center mb-3">
        <Avatar 
          src={getAvatarSrc(suggestion.avatar, suggestion.username)} 
          className="mr-3 cursor-pointer hover:scale-105 transition-transform" 
          size="lg" 
          onClick={handleAvatarClick}
        />
        <div>
          <h3 className="font-medium">{suggestion.name}</h3>          <p className="text-sm text-gray-500 dark:text-gray-400">@{suggestion.username}</p>          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            0 bạn chung
          </p>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button 
          size="sm" 
          color="primary"
          startContent={<UserPlus size={16} />}          onPress={() => onAddFriend(suggestion.id)}
        >
          Kết Bạn
        </Button>
      </div>
    </div>
  );
};

export default function FriendsPage() {
  const router = useRouter();
  const [friends, setFriends] = useState<FriendProps[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendProps[]>([]);
  const [suggestions, setSuggestions] = useState<FriendProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserFriends, setCurrentUserFriends] = useState<FriendDTO[]>([]);// Fetch data on component mount
  useEffect(() => {
    fetchFriendsData();
    getCurrentUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCurrentUser = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error getting current user:', error);    }
  };

  // Transform backend data to UI format
  const transformUserToFriendProps = (user: UserDTO, type: 'friend' | 'suggestion', originalId?: number): FriendProps => ({
    id: user.id.toString(),
    name: user.displayName || user.username,
    username: user.username,
    avatar: getAvatarSrc(user.profilePicture, user.username),
    originalId: originalId || user.id
  });
  const transformFriendDTOToFriendProps = (friendDTO: FriendDTO): FriendProps => ({
    id: friendDTO.id.toString(),
    name: friendDTO.friend.displayName || friendDTO.friend.username,
    username: friendDTO.friend.username,
    avatar: getAvatarSrc(friendDTO.friend.profilePicture, friendDTO.friend.username),
    originalId: friendDTO.friend.id
  });
  const transformFriendRequestDTOToFriendProps = (requestDTO: FriendRequestDTO): FriendProps => ({
    id: requestDTO.id.toString(),
    name: requestDTO.sender.displayName || requestDTO.sender.username,
    username: requestDTO.sender.username,
    avatar: getAvatarSrc(requestDTO.sender.profilePicture, requestDTO.sender.username),
    originalId: requestDTO.sender.id
  });
  const fetchFriendsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch friends, friend requests, and smart suggestions in parallel
      const [friendsData, requestsData, suggestionsData] = await Promise.all([
        FriendService.getFriends().catch(() => []),
        FriendService.getReceivedFriendRequests().catch(() => []),
        FriendService.getFriendSuggestions().catch(() => [])
      ]);

      // Store current user's friends for mutual friends calculation
      setCurrentUserFriends(friendsData);

      // Transform friends data (no mutual friends needed for current user's friends)
      const transformedFriends = friendsData.map(transformFriendDTOToFriendProps);
      setFriends(transformedFriends);      // Transform friend requests data
      const transformedRequests = requestsData.map((requestDTO) => {
        return transformFriendRequestDTOToFriendProps(requestDTO);
      });
      setFriendRequests(transformedRequests);// Transform smart suggestions from backend (already filtered and scored)
      const transformedSuggestions = suggestionsData.slice(0, 6).map((user) => {
        return transformUserToFriendProps(user, 'suggestion');
      });
      setSuggestions(transformedSuggestions);} catch (err) {
      console.error('Error fetching friends data:', err);
      
      // Check if it's an authentication error
      if (err instanceof Error && (err.message.includes('401') || err.message.includes('403'))) {
        // Clear local storage and redirect to auth
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user');
        window.location.href = '/auth';
        return;
      }
      
      setError('Không thể tải dữ liệu bạn bè. Vui lòng thử lại.');    } finally {
      setLoading(false);
    }
  }, [currentUser, currentUserFriends]);
  
  const handleUnfriend = async (friendId: string) => {
    try {
      const friend = friends.find(f => f.id === friendId);
      if (!friend?.originalId) return;

      await FriendService.removeFriend(friend.originalId);
      
      // Update local state immediately for better UX
      setFriends(prev => prev.filter(f => f.id !== friendId));
      
      // Show success message
      console.log('Friend removed successfully');
    } catch (err) {
      console.error('Error removing friend:', err);
      
      // Check if it's an authentication error
      if (err instanceof Error && (err.message.includes('401') || err.message.includes('403'))) {
        // Token might be expired, try to refresh the page
        window.location.reload();
        return;
      }
      
      setError('Không thể xóa bạn bè. Vui lòng thử lại.');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const request = friendRequests.find(r => r.id === requestId);
      if (!request) return;

      await FriendService.acceptFriendRequest(parseInt(requestId));
      
      // Move from requests to friends
      setFriendRequests(prev => prev.filter(r => r.id !== requestId));
      setFriends(prev => [...prev, request]);
    } catch (err) {
      console.error('Error accepting friend request:', err);
      setError('Không thể chấp nhận lời mời kết bạn. Vui lòng thử lại.');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await FriendService.rejectFriendRequest(parseInt(requestId));
      
      // Remove from requests
      setFriendRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      console.error('Error rejecting friend request:', err);
      setError('Không thể từ chối lời mời kết bạn. Vui lòng thử lại.');
    }
  };

  const handleAddFriend = async (userId: string) => {
    try {
      const suggestion = suggestions.find(s => s.id === userId);
      if (!suggestion?.originalId) return;

      await FriendService.sendFriendRequest(suggestion.originalId);
      
      // Remove from suggestions (friend request sent)
      setSuggestions(prev => prev.filter(s => s.id !== userId));
    } catch (err) {
      console.error('Error sending friend request:', err);
      setError('Không thể gửi lời mời kết bạn. Vui lòng thử lại.');
    }
  };

  if (loading) {
    return (
      <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-64 p-4 lg:pr-80">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-center items-center h-64">              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải bạn bè...</p>
              </div>
            </div>
          </div>
        </main>
        <RightSidebar />
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Left sidebar */}
      <Sidebar />
        {/* Main content */}
      <main className="flex-1 ml-0 md:ml-64 p-4 lg:pr-80">        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Bạn Bè</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">{error}</p>
            </div>
          )}
            <Tabs aria-label="Tùy chọn bạn bè" className="mb-6">            <Tab key="all-friends" title={`Tất Cả Bạn Bè (${friends.length})`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {friends.map((friend) => (                  <FriendCard 
                    key={friend.id} 
                    friend={friend} 
                    onUnfriend={handleUnfriend}
                    currentUser={currentUser}
                    router={router}
                  />
                ))}{friends.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-gray-500 dark:text-gray-400">
                    Chưa có bạn bè nào. Hãy bắt đầu kết nối với mọi người!
                  </div>
                )}
              </div>
            </Tab>            <Tab key="requests" title={`Lời Mời (${friendRequests.length})`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {friendRequests.map((request) => (
                  <RequestCard 
                    key={request.id} 
                    request={request} 
                    onAccept={handleAcceptRequest}
                    onReject={handleRejectRequest}
                    currentUser={currentUser}
                  />
                ))}{friendRequests.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-gray-500 dark:text-gray-400">
                    Không có lời mời kết bạn nào.
                  </div>
                )}
              </div>
            </Tab>            <Tab key="suggestions" title="Gợi Ý">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {suggestions.map((suggestion) => (
                  <SuggestionCard 
                    key={suggestion.id} 
                    suggestion={suggestion} 
                    onAddFriend={handleAddFriend}
                    currentUser={currentUser}
                  />
                ))}{suggestions.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-gray-500 dark:text-gray-400">
                    Không có gợi ý kết bạn nào.
                  </div>
                )}
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
