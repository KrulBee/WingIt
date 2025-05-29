"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import Post from "@/components/Post";
import { Tabs, Tab, Input, Button, Card, CardBody, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Textarea } from "@nextui-org/react";
import { Search, Filter, MoreHorizontal, Plus } from "react-feather";
import BookmarkService, { BookmarkData, BookmarkCollectionData } from "@/services/BookmarkService";
import AuthGuard from "@/components/AuthGuard";

// Interface for UI compatibility
interface BookmarkPost {
  id: string;
  authorName: string;
  authorUsername: string;
  authorAvatar?: string;
  content: string;
  image?: string;
  likes: number;
  dislikes?: number;
  comments: number;
  shares: number;
  createdAt: Date;
  liked?: boolean;
  disliked?: boolean;
  category?: string;
}

// Mock data for fallback
const mockBookmarkedPosts: BookmarkPost[] = [
  {
    id: "post1",
    authorName: "Jane Smith",
    authorUsername: "janesmith",
    authorAvatar: "https://i.pravatar.cc/150?u=janesmith",
    content: "Just released a new design system for our product. Check it out and let me know what you think! #design #ux",
    image: "https://picsum.photos/800/500?random=1",
    likes: 245,
    dislikes: 8,
    comments: 37,
    shares: 12,
    createdAt: new Date(2025, 4, 10),
    liked: false,
    disliked: false,
    category: "Design"
  },
  {
    id: "post2",
    authorName: "Robert Wilson",
    authorUsername: "robertw",
    authorAvatar: "https://i.pravatar.cc/150?u=robertw",
    content: "10 tips for improving your productivity as a developer. I've been using these techniques for years and they've really helped me stay focused and efficient.",
    likes: 182,
    dislikes: 5,
    comments: 29,
    shares: 24,
    createdAt: new Date(2025, 4, 12),
    liked: true,
    disliked: false,
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
    dislikes: 12,
    comments: 52,
    shares: 31,
    createdAt: new Date(2025, 4, 14),
    liked: false,
    disliked: false,
    category: "Work"
  }
];

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkPost[]>([]);
  const [collections, setCollections] = useState<BookmarkCollectionData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCollection, setActiveCollection] = useState<number | "all">(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Collection modal
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");
  const [creatingCollection, setCreatingCollection] = useState(false);

  // Fetch bookmarks and collections on component mount
  useEffect(() => {
    fetchBookmarksData();
  }, []);

  const fetchBookmarksData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch bookmarks and collections in parallel
      const [bookmarksData, collectionsData] = await Promise.all([
        BookmarkService.getUserBookmarks().catch(() => []),
        BookmarkService.getUserCollections().catch(() => [])
      ]);

      // Transform bookmark data to UI format
      const transformedBookmarks: BookmarkPost[] = bookmarksData.map(bookmark => ({
        id: bookmark.postId.toString(),
        authorName: bookmark.post?.user?.displayName || bookmark.post?.user?.username || 'Unknown User',
        authorUsername: bookmark.post?.user?.username || 'unknown',
        authorAvatar: bookmark.post?.user?.profilePicture || `https://i.pravatar.cc/150?u=${bookmark.post?.user?.username}`,
        content: bookmark.post?.content || '',
        image: bookmark.post?.mediaUrls?.[0],
        likes: bookmark.post?.likesCount || 0,
        dislikes: bookmark.post?.dislikesCount || 0,
        comments: bookmark.post?.commentsCount || 0,
        shares: bookmark.post?.sharesCount || 0,
        createdAt: new Date(bookmark.createdDate),
        liked: false, // Would need to check user reactions
        disliked: false, // Would need to check user reactions
        category: extractCategory(bookmark.post?.content || '')
      }));

      setBookmarks(transformedBookmarks);

      // Add default "All Bookmarks" collection
      const allCollectionsWithDefault = [
        { id: 0, name: "All Bookmarks", userId: 0, createdDate: new Date().toISOString(), bookmarkCount: transformedBookmarks.length },
        ...collectionsData
      ];
      setCollections(allCollectionsWithDefault);

    } catch (err) {
      console.error('Error fetching bookmarks data:', err);
      setError('Failed to load bookmarks. Using offline data.');
      
      // Fallback to mock data
      setBookmarks(mockBookmarkedPosts);
      setCollections([
        { id: 0, name: "All Bookmarks", userId: 0, createdDate: new Date().toISOString(), bookmarkCount: mockBookmarkedPosts.length }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const extractCategory = (content: string): string => {
    // Simple category extraction based on hashtags or keywords
    if (content.toLowerCase().includes('design') || content.includes('#design') || content.includes('#ux')) return 'Design';
    if (content.toLowerCase().includes('development') || content.includes('#dev') || content.includes('javascript') || content.includes('react')) return 'Development';
    if (content.toLowerCase().includes('work') || content.includes('#work') || content.includes('team')) return 'Work';
    if (content.toLowerCase().includes('nature') || content.includes('#outdoors') || content.includes('weekend')) return 'Personal';
    return 'General';
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;

    try {
      setCreatingCollection(true);
      const newCollection = await BookmarkService.createCollection(
        newCollectionName.trim(),
        newCollectionDescription.trim() || undefined
      );

      setCollections(prev => [...prev, newCollection]);
      setNewCollectionName("");
      setNewCollectionDescription("");
      onOpenChange();
    } catch (err) {
      console.error('Error creating collection:', err);
      setError('Failed to create collection. Please try again.');
    } finally {
      setCreatingCollection(false);
    }
  };

  const handleDeleteCollection = async (collectionId: number) => {
    if (collectionId === 0) return; // Can't delete "All Bookmarks"

    try {
      await BookmarkService.deleteCollection(collectionId);
      setCollections(prev => prev.filter(c => c.id !== collectionId));
        // Reset to "All Bookmarks" if current collection was deleted
      if (activeCollection === collectionId) {
        setActiveCollection(0);
      }
    } catch (err) {
      console.error('Error deleting collection:', err);
      setError('Failed to delete collection. Please try again.');
    }
  };
  // Filter bookmarks based on search term and active collection
  const filteredBookmarks = bookmarks.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.authorUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.category && post.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCollection = activeCollection === 0; // For now, only show "All Bookmarks"
    
    return matchesSearch && matchesCollection;
  });  return (
    <AuthGuard>
      <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-64 p-6 lg:pr-80">
        <div className="flex justify-between items-center mb-6">          <h1 className="text-2xl font-bold">Dấu Trang</h1>          <div className="flex gap-2">
            <Button color="primary" size="sm" onPress={onOpen}>
              <Plus size={16} />
              Bộ Sưu Tập Mới
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Collections sidebar */}
          <div className="lg:col-span-1">
            <Card className="w-full">
              <CardBody className="p-0">
                <div className="p-4">                  <Input
                    placeholder="Tìm kiếm dấu trang..."
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
                      <div className="font-medium">{collection.name}</div>                      <div className="text-xs bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-1">
                        {collection.bookmarkCount || 0}
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
                {error && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                
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
                {loading ? (
                  <div className="py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading bookmarks...</p>
                  </div>
                ) : filteredBookmarks.length > 0 ? (
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
                ) : (                  <div className="py-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400">Không tìm thấy dấu trang nào cho tìm kiếm này.</p>
                    <Button variant="flat" size="sm" className="mt-2" onClick={() => setSearchTerm("")}>
                      Xóa tìm kiếm
                    </Button>
                  </div>
                )}
              </CardBody>            </Card>
          </div>
        </div>
      </main>      
      {/* Right sidebar */}
      <RightSidebar />

      {/* New Collection Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
        <ModalContent>
          {(onClose) => (
            <>              <ModalHeader className="flex flex-col gap-1">Tạo Bộ Sưu Tập Mới</ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  label="Tên Bộ Sưu Tập"
                  placeholder="Nhập tên bộ sưu tập"
                  variant="bordered"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                />
                <Textarea
                  label="Mô Tả (Tùy Chọn)"
                  placeholder="Nhập mô tả bộ sưu tập"
                  variant="bordered"
                  value={newCollectionDescription}
                  onChange={(e) => setNewCollectionDescription(e.target.value)}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Hủy
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleCreateCollection}
                  isLoading={creatingCollection}
                  isDisabled={!newCollectionName.trim()}
                >
                  Tạo Bộ Sưu Tập
                </Button></ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      </div>
    </AuthGuard>
  );
}
