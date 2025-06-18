// filepath: c:\Study\2024-2025\DATN\Project\WingIt\fe\src\components\ChatManagementModal.tsx
"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Avatar,
  Tabs,
  Tab,
  Card,
  CardBody,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Spinner,
  Switch,
  Textarea
} from "@nextui-org/react";
import { 
  Settings, 
  Users, 
  UserPlus, 
  UserMinus, 
  Shield, 
  Volume2, 
  VolumeX, 
  MoreVertical,
  Edit3,
  Trash2,
  LogOut
} from "react-feather";
import { FriendService } from "@/services";
import ChatService from "@/services/ChatService";
import { RoomUserService } from "@/services";
import avatarBase64 from "@/static/images/avatarDefault";

interface ChatRoom {
  id: number;
  roomName: string;
  isGroupChat: boolean;
  createdDate: string;
  participants?: User[];
}

interface User {
  id: number;
  username: string;
  displayName?: string;
  profilePicture?: string;
}

interface ChatManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatRoom: ChatRoom | null;
  currentUserId: number;
  onChatUpdated: (updatedChat: ChatRoom) => void;
  onChatDeleted: (chatId: number) => void;
}

interface RoomUser {
  id: number;
  user: User;
  role: string;
  joinedAt: string;
  isMuted: boolean;
  mutedUntil?: string;
}

export default function ChatManagementModal({ 
  isOpen, 
  onClose, 
  chatRoom, 
  currentUserId,
  onChatUpdated,
  onChatDeleted 
}: ChatManagementModalProps) {  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState<RoomUser[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [roomName, setRoomName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && chatRoom) {
      setRoomName(chatRoom.roomName);
      fetchParticipants();
      if (chatRoom.isGroupChat) {
        fetchFriends();
      }
    }
  }, [isOpen, chatRoom]);  const fetchParticipants = async () => {
    if (!chatRoom) return;
    
    try {
      setLoading(true);
      console.log('🔍 Fetching participants for room:', chatRoom.id);
      // Fetch actual participants from the API
      const roomUserService = (await import('../services/RoomUserService')).default;
      const response = await roomUserService.getRoomUsers(chatRoom.id);      console.log('📥 Participants response:', response);
      console.log('📥 Response is array:', Array.isArray(response));
      
      if (!response) {
        console.warn('No response from getRoomUsers');
        setParticipants([]);
        return;
      }
      
      // Backend returns array directly
      const roomUsersData = Array.isArray(response) ? response : [];
      console.log('📥 Actual roomUsers data:', roomUsersData);
      
      if (!Array.isArray(roomUsersData) || roomUsersData.length === 0) {
        console.warn('No roomUsers array found in response or empty array');
        setParticipants([]);
        return;
      }      
      const participants: RoomUser[] = roomUsersData.map((roomUser: any) => {
        console.log('Processing roomUser:', roomUser);
        return {
          id: roomUser.id,
          user: {
            id: roomUser.userId || 0,
            username: roomUser.username || 'unknown',
            displayName: roomUser.displayName || roomUser.username,
            profilePicture: roomUser.profileImageUrl
          },
          role: 'MEMBER', // Default role since it's not in the DTO
          joinedAt: roomUser.joinedAt,
          isMuted: false // Default value since it's not in the DTO
        };
      });
      
      console.log('✅ Processed participants:', participants);
      setParticipants(participants);
    } catch (err) {
      console.error('Error fetching participants:', err);
      setError('Không thể tải danh sách thành viên');
      setParticipants([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    try {
      const friendsData = await FriendService.getFriends();
      setFriends(friendsData);
    } catch (err) {
      console.error('Error fetching friends:', err);
    }
  };

  const handleUpdateChatInfo = async () => {
    if (!chatRoom) return;

    try {
      setLoading(true);
      setError(null);
        const updateData = {
        roomName: roomName.trim()
      };

      const updatedChat = await ChatService.updateChatRoom(chatRoom.id, updateData);
      onChatUpdated(updatedChat);      setSuccess('Thông tin cuộc trò chuyện đã được cập nhật thành công');
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating chat:', err);
      setError('Không thể cập nhật thông tin cuộc trò chuyện');
    } finally {
      setLoading(false);
    }
  };

  const handleAddParticipant = async (friendId: number) => {
    if (!chatRoom) return;

    try {
      await ChatService.addUserToChatRoom(chatRoom.id, friendId);
      fetchParticipants(); // Refresh participants      setSuccess('Người dùng đã được thêm vào cuộc trò chuyện');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error adding participant:', err);
      setError('Không thể thêm người dùng vào cuộc trò chuyện');
    }
  };

  const handleRemoveParticipant = async (userId: number) => {
    if (!chatRoom) return;

    try {
      await ChatService.removeUserFromChatRoom(chatRoom.id, userId);
      setParticipants(prev => prev.filter(p => p.user.id !== userId));      setSuccess('Người dùng đã được gỡ khỏi cuộc trò chuyện');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error removing participant:', err);
      setError('Không thể gỡ người dùng khỏi cuộc trò chuyện');
    }
  };

  const handleLeaveChat = async () => {
    if (!chatRoom) return;

    try {
      await ChatService.leaveChatRoom(chatRoom.id);
      onChatDeleted(chatRoom.id);
      onClose();    } catch (err) {
      console.error('Error leaving chat:', err);
      setError('Không thể rời khỏi cuộc trò chuyện');
    }
  };

  const handleDeleteChat = async () => {
    if (!chatRoom) return;

    try {
      await ChatService.deleteChatRoom(chatRoom.id);
      onChatDeleted(chatRoom.id);
      onClose();    } catch (err) {
      console.error('Error deleting chat:', err);
      setError('Không thể xóa cuộc trò chuyện');
    }
  };

  const canManageChat = () => {
    const currentUserParticipant = participants.find(p => p.user.id === currentUserId);
    return currentUserParticipant?.role === 'ADMIN' || currentUserParticipant?.role === 'MODERATOR';
  };

  const availableFriends = friends.filter(friendship => 
    !participants.some(p => p.user.id === friendship.friend.id)
  );

  if (!chatRoom) return null;

  // 🚫 Block access to private chat settings
  if (!chatRoom.isGroupChat) {
    return (
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="sm"
      >
        <ModalContent>
          <ModalHeader>
            <h2 className="text-xl font-semibold">Không khả dụng</h2>
          </ModalHeader>
          <ModalBody>
            <div className="text-center py-6">
              <Shield className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600 mb-2">
                Không thể thay đổi cài đặt cho tin nhắn riêng
              </p>
              <p className="text-sm text-gray-500">
                Chỉ nhóm trò chuyện mới có thể quản lý cài đặt
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button onPress={onClose} color="primary">
              Đóng
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-3">
            <Avatar
              src={chatRoom.isGroupChat ? undefined : chatRoom.participants?.[0]?.profilePicture || avatarBase64}
              name={chatRoom.roomName}
            />
            <div>
              <h2 className="text-xl font-semibold">{chatRoom.roomName}</h2>              <p className="text-sm text-gray-500">
                {chatRoom.isGroupChat ? `${participants.length} thành viên` : 'Tin nhắn riêng'}
              </p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody>
          {error && (
            <Card className="bg-red-50 border border-red-200">
              <CardBody className="py-2">
                <p className="text-red-600 text-sm">{error}</p>
              </CardBody>
            </Card>
          )}

          {success && (
            <Card className="bg-green-50 border border-green-200">
              <CardBody className="py-2">
                <p className="text-green-600 text-sm">{success}</p>
              </CardBody>
            </Card>
          )}

          <Tabs 
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
            variant="underlined"
          >            <Tab key="info" title={
              <div className="flex items-center gap-2">
                <Settings size={16} />
                Thông tin
              </div>
            }>
              <div className="space-y-4">                <div>
                  <label className="text-sm font-medium mb-2 block">Tên cuộc trò chuyện</label>
                  <Input
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Nhập tên cuộc trò chuyện"
                    variant="bordered"
                    isDisabled={!canManageChat()}                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Được tạo</p><p className="text-sm text-gray-500">
                    {new Date(chatRoom.createdDate).toLocaleDateString('vi-VN', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>

                {canManageChat() && (
                  <div className="flex gap-2">
                    <Button
                      color="primary"
                      onPress={handleUpdateChatInfo}
                      isLoading={loading}
                      startContent={<Edit3 size={16} />}
                    >
                      Cập nhật thông tin
                    </Button>
                  </div>
                )}
              </div>
            </Tab>            <Tab key="members" title={
              <div className="flex items-center gap-2">
                <Users size={16} />
                Thành viên ({participants.length})
              </div>
            }>
              <div className="space-y-4">
                {/* Add members section for group chats */}
                {chatRoom.isGroupChat && canManageChat() && availableFriends.length > 0 && (
                  <Card>
                    <CardBody>                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <UserPlus size={16} />
                        Thêm bạn bè
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {availableFriends.slice(0, 5).map(friendship => (
                          <div
                            key={friendship.friend.id}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={friendship.friend.profilePicture || avatarBase64}
                                size="sm"
                              />
                              <div>
                                <p className="font-medium text-sm">
                                  {friendship.friend.displayName || friendship.friend.username}
                                </p>
                                <p className="text-xs text-gray-500">@{friendship.friend.username}</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              color="primary"
                              variant="light"
                              onPress={() => handleAddParticipant(friendship.friend.id)}                              startContent={<UserPlus size={14} />}
                            >
                              Thêm
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                )}                {/* Members list */}
                <div className="space-y-2">
                  {participants && participants.length > 0 ? participants.map(participant => (
                    <div
                      key={participant.user.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={participant.user.profilePicture || avatarBase64}
                          size="sm"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {participant.user.displayName || participant.user.username}
                            </p>                            {participant.role === 'ADMIN' && (
                              <Shield size={14} className="text-yellow-500" />
                            )}
                            {participant.role === 'MODERATOR' && (
                              <Shield size={14} className="text-blue-500" />
                            )}
                            {participant.user.id === currentUserId && (
                              <Chip size="sm" variant="flat" color="primary">Bạn</Chip>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            @{participant.user.username} • {participant.role.toLowerCase()}
                          </p>
                        </div>
                      </div>

                      {canManageChat() && participant.user.id !== currentUserId && (
                        <Dropdown placement="bottom-end">
                          <DropdownTrigger>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                            >
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu>
                            <DropdownItem
                              key="mute"
                              startContent={participant.isMuted ? <Volume2 size={16} /> : <VolumeX size={16} />}
                            >                              {participant.isMuted ? 'Bỏ tắt tiếng' : 'Tắt tiếng'}
                            </DropdownItem>
                            <DropdownItem
                              key="remove"
                              color="danger"
                              startContent={<UserMinus size={16} />}
                              onPress={() => handleRemoveParticipant(participant.user.id)}
                            >
                              Gỡ khỏi nhóm
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>                      )}
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Không có thành viên nào</p>
                    </div>
                  )}
                </div>
              </div>
            </Tab>            <Tab key="danger" title={
              <div className="flex items-center gap-2 text-red-500">
                <Trash2 size={16} />
                Vùng nguy hiểm
              </div>
            }>
              <div className="space-y-4">
                <Card className="border-red-200 bg-red-50">
                  <CardBody>
                    <h4 className="font-medium text-red-700 mb-2">Rời khỏi cuộc trò chuyện</h4>
                    <p className="text-sm text-red-600 mb-4">
                      Bạn sẽ không còn nhận được tin nhắn từ cuộc trò chuyện này.
                    </p>
                    <Button
                      color="danger"
                      variant="bordered"
                      onPress={handleLeaveChat}
                      startContent={<LogOut size={16} />}
                    >
                      Rời khỏi cuộc trò chuyện
                    </Button>
                  </CardBody>
                </Card>

                {canManageChat() && (
                  <Card className="border-red-300 bg-red-100">
                    <CardBody>
                      <h4 className="font-medium text-red-800 mb-2">Xóa cuộc trò chuyện</h4>
                      <p className="text-sm text-red-700 mb-4">
                        Hành động này không thể hoàn tác. Tất cả tin nhắn sẽ bị xóa vĩnh viễn.
                      </p>
                      <Button
                        color="danger"
                        onPress={handleDeleteChat}
                        startContent={<Trash2 size={16} />}
                      >
                        Xóa cuộc trò chuyện
                      </Button>
                    </CardBody>
                  </Card>
                )}
              </div>
            </Tab>
          </Tabs>
        </ModalBody>        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Đóng
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
