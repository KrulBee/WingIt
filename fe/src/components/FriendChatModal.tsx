// filepath: c:\Study\2024-2025\DATN\Project\WingIt\fe\src\components\FriendChatModal.tsx
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
  Checkbox,
  Divider,
  Spinner,
  Card,
  CardBody,
  Chip
} from "@nextui-org/react";
import { Search, Users, MessageCircle, X } from "react-feather";
import { FriendService } from "@/services";
import ChatService from "@/services/ChatService";
import avatarBase64 from "@/static/images/avatarDefault";

interface Friend {
  id: number;
  friend: {
    id: number;
    username: string;
    displayName?: string;
    profilePicture?: string;
  };
  friendshipDate: string;
}

interface FriendChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChatCreated: (chatRoom: any) => void;
}

export default function FriendChatModal({ isOpen, onClose, onChatCreated }: FriendChatModalProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchFriends();
    }
  }, [isOpen]);

  useEffect(() => {
    // Filter friends based on search term
    const filtered = friends.filter(friendship => {
      const friend = friendship.friend;
      const searchLower = searchTerm.toLowerCase();
      return (
        friend.displayName?.toLowerCase().includes(searchLower) ||
        friend.username.toLowerCase().includes(searchLower)
      );
    });
    setFilteredFriends(filtered);
  }, [friends, searchTerm]);

  useEffect(() => {
    // Auto-enable group chat if more than one friend is selected
    setIsGroupChat(selectedFriends.size > 1);
  }, [selectedFriends]);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      setError(null);
      const friendsData = await FriendService.getFriends();
      setFriends(friendsData);
    } catch (err) {
      console.error('Error fetching friends:', err);
      setError('Failed to load friends');
      // Fallback to mock data for development
      const mockFriends: Friend[] = [
        {
          id: 1,
          friend: {
            id: 2,
            username: "janesmith",
            displayName: "Jane Smith",
            profilePicture: ""
          },
          friendshipDate: new Date().toISOString()
        },
        {
          id: 2,
          friend: {
            id: 3,
            username: "mikejohnson",
            displayName: "Mike Johnson",
            profilePicture: ""
          },
          friendshipDate: new Date().toISOString()
        },
        {
          id: 3,
          friend: {
            id: 4,
            username: "sarahwilson",
            displayName: "Sarah Wilson",
            profilePicture: ""
          },
          friendshipDate: new Date().toISOString()
        }
      ];
      setFriends(mockFriends);
    } finally {
      setLoading(false);
    }
  };

  const handleFriendSelect = (friendId: number) => {
    const newSelected = new Set(selectedFriends);
    if (newSelected.has(friendId)) {
      newSelected.delete(friendId);
    } else {
      newSelected.add(friendId);
    }
    setSelectedFriends(newSelected);
  };

  const handleCreateChat = async () => {
    if (selectedFriends.size === 0) return;

    try {
      setCreating(true);
      setError(null);

      const participantIds = Array.from(selectedFriends);
      
      let chatRoomData;
      if (isGroupChat) {
        // Create group chat
        chatRoomData = {
          roomName: groupName || `Group Chat`,
          isGroupChat: true,
          participantIds
        };
      } else {
        // Create direct chat
        const friend = friends.find(f => f.friend.id === participantIds[0]);
        chatRoomData = {
          roomName: friend?.friend.displayName || friend?.friend.username || "Direct Chat",
          isGroupChat: false,
          participantIds
        };
      }

      const newChatRoom = await ChatService.createChatRoom(chatRoomData);
      onChatCreated(newChatRoom);
      
      // Reset form
      setSelectedFriends(new Set());
      setGroupName("");
      setSearchTerm("");
      onClose();
    } catch (err) {
      console.error('Error creating chat:', err);
      setError('Failed to create chat. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const selectedFriendsData = friends.filter(f => selectedFriends.has(f.friend.id));

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Start New Chat</h2>
          <p className="text-sm text-gray-500">Select friends to start chatting with</p>
        </ModalHeader>
        
        <ModalBody>
          {error && (
            <Card className="bg-red-50 border border-red-200">
              <CardBody className="py-2">
                <p className="text-red-600 text-sm">{error}</p>
              </CardBody>
            </Card>
          )}

          {/* Search */}
          <Input
            placeholder="Search friends..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startContent={<Search size={18} />}
            size="sm"
            variant="bordered"
          />

          {/* Selected friends */}
          {selectedFriends.size > 0 && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {selectedFriendsData.map(friendship => (
                  <Chip
                    key={friendship.friend.id}
                    onClose={() => handleFriendSelect(friendship.friend.id)}
                    variant="flat"
                    color="primary"
                  >
                    {friendship.friend.displayName || friendship.friend.username}
                  </Chip>
                ))}
              </div>
              
              {isGroupChat && (
                <Input
                  placeholder="Group chat name (optional)"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  size="sm"
                  variant="bordered"
                  startContent={<Users size={18} />}
                />
              )}
            </div>
          )}

          <Divider />

          {/* Friends list */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filteredFriends.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {friends.length === 0 ? (
                    <div className="space-y-2">
                      <Users className="mx-auto w-12 h-12 text-gray-400" />
                      <p>No friends yet</p>
                      <p className="text-sm">Add some friends to start chatting!</p>
                    </div>
                  ) : (
                    <p>No friends found matching "{searchTerm}"</p>
                  )}
                </div>
              ) : (
                filteredFriends.map(friendship => (
                  <div
                    key={friendship.friend.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    onClick={() => handleFriendSelect(friendship.friend.id)}
                  >
                    <Checkbox
                      isSelected={selectedFriends.has(friendship.friend.id)}
                      onChange={() => handleFriendSelect(friendship.friend.id)}
                    />
                    <Avatar
                      src={friendship.friend.profilePicture || avatarBase64}
                      size="sm"
                    />
                    <div className="flex-1">
                      <p className="font-medium">
                        {friendship.friend.displayName || friendship.friend.username}
                      </p>
                      <p className="text-sm text-gray-500">@{friendship.friend.username}</p>
                    </div>
                    <MessageCircle size={16} className="text-gray-400" />
                  </div>
                ))
              )}
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleCreateChat}
            isLoading={creating}
            isDisabled={selectedFriends.size === 0 || creating}
            startContent={!creating && <MessageCircle size={16} />}
          >
            {creating ? 'Creating...' : `Start Chat${isGroupChat ? ' Group' : ''}`}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
