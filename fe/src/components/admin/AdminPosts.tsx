'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardBody,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
  Avatar,
  Tooltip
} from '@nextui-org/react';
import { 
  Search, 
  Eye, 
  Trash2, 
  Image, 
  Video,
  MapPin,  Calendar,
  Heart,
  MessageCircle,
  AlertTriangle
} from 'lucide-react';
import AdminService, { AdminPost } from '@/services/AdminService';

interface AdminPostsProps {
  userRole: 'admin' | 'moderator' | 'full_admin';
}

const AdminPosts: React.FC<AdminPostsProps> = ({ userRole }) => {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [selectedPost, setSelectedPost] = useState<AdminPost | null>(null);
  const [deletePostId, setDeletePostId] = useState<number | null>(null);
  
  const { isOpen: isPostDetailOpen, onOpen: onPostDetailOpen, onClose: onPostDetailClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();

  // Unique values for filters
  const postTypes = Array.from(new Set(posts.map(post => post.type.typeName)));
  const locations = Array.from(new Set(posts.map(post => post.location.location)));

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, searchTerm, typeFilter, locationFilter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const fetchedPosts = await AdminService.getAllPosts(0, 100);
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = posts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.location.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(post => post.type.typeName === typeFilter);
    }

    // Location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(post => post.location.location === locationFilter);
    }

    setFilteredPosts(filtered);
  };

  const handleDeletePost = async (postId: number) => {
    try {
      await AdminService.deletePost(postId);
      setPosts(posts.filter(post => post.id !== postId));
      onDeleteModalClose();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleViewPost = (post: AdminPost) => {
    setSelectedPost(post);
    onPostDetailOpen();
  };

  const handleDeleteClick = (postId: number) => {
    setDeletePostId(postId);
    onDeleteModalOpen();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const getMediaIcon = (post: AdminPost) => {
    if (!post.media || post.media.length === 0) return null;
    
    const mediaItem = post.media[0];
    if (mediaItem.mediaType === 'IMAGE') {
      return <Image className="h-4 w-4 text-blue-600" />;
    } else if (mediaItem.mediaType === 'VIDEO') {
      return <Video className="h-4 w-4 text-purple-600" />;
    }
    return null;
  };

  const renderCell = React.useCallback((post: AdminPost, columnKey: React.Key) => {
    switch (columnKey) {
      case "author":
        return (
          <div className="flex items-center gap-3">
            <Avatar 
              size="sm" 
              src={post.author.profilePicture}
              name={post.author.displayName?.charAt(0) || post.author.username.charAt(0)}
            />
            <div>
              <p className="text-sm font-medium">{post.author.displayName || post.author.username}</p>
              <p className="text-xs text-gray-500">@{post.author.username}</p>
            </div>
          </div>
        );
      case "content":
        return (
          <div className="max-w-xs">
            <p className="text-sm">{truncateContent(post.content)}</p>
          </div>
        );
      case "type":
        return (
          <Chip size="sm" variant="flat" color="primary">
            {post.type.typeName}
          </Chip>
        );
      case "location":
        return (
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-gray-400" />
            <span className="text-sm">{post.location.location}</span>
          </div>
        );
      case "media":
        return (
          <div className="flex items-center gap-2">
            {getMediaIcon(post)}
            {post.media && post.media.length > 0 && (
              <span className="text-xs text-gray-500">
                {post.media.length} file{post.media.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        );
      case "stats":
        return (
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {post.likesCount}
            </div>            <div className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {post.commentsCount}
            </div>
          </div>
        );
      case "created":
        return (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Calendar className="h-3 w-3" />
            {formatDate(post.createdDate)}
          </div>
        );
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <Tooltip content="Xem chi tiết">
              <Button
                variant="light"
                size="sm"
                isIconOnly
                onPress={() => handleViewPost(post)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </Tooltip>
            
            <Tooltip content="Xóa bài viết">
              <Button
                variant="light"
                size="sm"
                isIconOnly
                color="danger"
                onPress={() => handleDeleteClick(post.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>
        );
      default:
        return null;
    }
  }, []);

  const columns = [
    { name: "TÁC GIẢ", uid: "author" },
    { name: "NỘI DUNG", uid: "content" },
    { name: "LOẠI", uid: "type" },
    { name: "VỊ TRÍ", uid: "location" },
    { name: "MEDIA", uid: "media" },
    { name: "THỐNG KÊ", uid: "stats" },
    { name: "NGÀY TẠO", uid: "created" },
    { name: "HÀNH ĐỘNG", uid: "actions" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Quản lý bài viết</h3>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <Input
              placeholder="Tìm kiếm bài viết, tác giả hoặc vị trí..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startContent={<Search className="h-4 w-4 text-gray-400" />}
              className="flex-1"
            />            {/* Type Filter */}
            <Select
              placeholder="Lọc theo loại"
              selectedKeys={typeFilter !== 'all' ? [typeFilter] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setTypeFilter(selected || 'all');
              }}
              className="w-full sm:w-48"
              items={[{ key: 'all', label: 'Tất cả loại' }, ...postTypes.map(type => ({ key: type, label: type }))]}
            >
              {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
            </Select>            {/* Location Filter */}
            <Select
              placeholder="Lọc theo vị trí"
              selectedKeys={locationFilter !== 'all' ? [locationFilter] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setLocationFilter(selected || 'all');
              }}
              className="w-full sm:w-48"
              items={[{ key: 'all', label: 'Tất cả vị trí' }, ...locations.map(location => ({ key: location, label: location }))]}
            >
              {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
            </Select>
          </div>
        </CardHeader>

        <CardBody>
          <Table aria-label="Bảng quản lý bài viết">
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn key={column.uid}>
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody 
              items={filteredPosts}
              emptyContent="Không tìm thấy bài viết nào"
            >
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Post Detail Modal */}
      <Modal 
        isOpen={isPostDetailOpen} 
        onClose={onPostDetailClose}
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>Chi tiết bài viết</ModalHeader>
          <ModalBody>
            {selectedPost && (
              <div className="space-y-6">
                {/* Author Info */}
                <div className="flex items-center gap-4">
                  <Avatar 
                    size="lg" 
                    src={selectedPost.author.profilePicture}
                    name={selectedPost.author.displayName?.charAt(0) || selectedPost.author.username.charAt(0)}
                  />
                  <div>
                    <h3 className="font-semibold">{selectedPost.author.displayName || selectedPost.author.username}</h3>
                    <p className="text-sm text-gray-500">@{selectedPost.author.username}</p>
                  </div>
                </div>

                {/* Post Content */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Nội dung</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="whitespace-pre-wrap">{selectedPost.content}</p>
                    </div>
                  </div>

                  {/* Post Metadata */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Loại</h4>
                      <Chip variant="flat" color="primary">{selectedPost.type.typeName}</Chip>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Vị trí</h4>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{selectedPost.location.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Media */}
                  {selectedPost.media && selectedPost.media.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Media ({selectedPost.media.length} files)</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedPost.media.map((media, index) => (
                          <div key={media.id} className="border rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              {media.mediaType === 'IMAGE' ? (
                                <Image className="h-4 w-4 text-blue-600" />
                              ) : (
                                <Video className="h-4 w-4 text-purple-600" />
                              )}
                              <span className="text-sm font-medium">{media.mediaType}</span>
                            </div>
                            {media.mediaType === 'IMAGE' ? (
                              <img 
                                src={media.mediaUrl} 
                                alt={`Media ${index + 1}`}
                                className="w-full h-32 object-cover rounded"
                              />
                            ) : (
                              <video 
                                src={media.mediaUrl}
                                className="w-full h-32 object-cover rounded"
                                controls
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Statistics */}
                  <div>
                    <h4 className="font-medium mb-2">Thống kê</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-red-50 p-3 rounded-lg text-center">
                        <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
                          <Heart className="h-4 w-4" />
                          <span className="font-semibold">{selectedPost.likesCount}</span>
                        </div>
                        <p className="text-xs text-gray-600">Lượt thích</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                          <MessageCircle className="h-4 w-4" />
                          <span className="font-semibold">{selectedPost.commentsCount}</span>
                        </div>
                        <p className="text-xs text-gray-600">Bình luận</p>
                      </div>                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Ngày tạo</h4>
                      <p className="text-sm text-gray-600">{formatDate(selectedPost.createdDate)}</p>
                    </div>
                    {selectedPost.updatedAt && (
                      <div>
                        <h4 className="font-medium mb-2">Cập nhật lần cuối</h4>
                        <p className="text-sm text-gray-600">{formatDate(selectedPost.updatedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onPress={onPostDetailClose}>
              Đóng
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalContent>
          <ModalHeader>Xác nhận xóa</ModalHeader>
          <ModalBody>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <div>
                <p className="font-medium">Bạn có chắc chắn muốn xóa bài viết này?</p>
                <p className="text-sm text-gray-500">Hành động này không thể hoàn tác.</p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onDeleteModalClose}>
              Hủy
            </Button>
            <Button 
              color="danger" 
              onPress={() => deletePostId && handleDeletePost(deletePostId)}
            >
              Xóa
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AdminPosts;
