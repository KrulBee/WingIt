"use client";
import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import LocationFilter from "@/components/LocationFilter";
import { Card, CardBody, Input, Avatar, Button, Chip, Tabs, Tab, Spinner, Select, SelectItem } from "@nextui-org/react";
import { Search as SearchIcon, User, Users, Hash, Calendar, Image } from "react-feather";
import { SearchService, UserSearchResult, PostSearchResult, TagSearchResult, SearchResults } from "@/services/SearchService";
import FollowService from "@/services/FollowService";
import PostTypeService, { PostType } from "@/services/PostTypeService";
import { useProfileNavigation } from "@/utils/profileNavigation";
import { AuthService } from "@/services";
import { avatarBase64 } from "@/static/images/avatarDefault";

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchResults, setSearchResults] = useState<SearchResults>({
    users: [],
    posts: [],
    tags: [],
    totalResults: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState<UserSearchResult[]>([]);
  const [trendingTags, setTrendingTags] = useState<TagSearchResult[]>([]);  const [currentUser, setCurrentUser] = useState<any>(null);
  const [followingUsers, setFollowingUsers] = useState<Set<number>>(new Set());
  const [followLoading, setFollowLoading] = useState<Set<number>>(new Set());
    // Post filtering states (for post tab only)
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [selectedPostTypeId, setSelectedPostTypeId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'latest' | 'most_viewed' | 'most_loved' | 'most_commented'>('latest');
  const [postTypes, setPostTypes] = useState<PostType[]>([]);
    // Posts you might want to see for "all" tab
  const [randomPosts, setRandomPosts] = useState<PostSearchResult[]>([]);
  
  const { navigateToProfile } = useProfileNavigation();

  // Generate a consistent avatar src with fallback
  const getAvatarSrc = (avatar?: string, username?: string) => {
    if (avatar && avatar.trim() !== '') {
      return avatar;
    }
    // Use the default avatar as fallback
    return avatarBase64;
  };

  // Load search query from URL parameters on mount
  useEffect(() => {
    const queryParam = searchParams.get('q');
    if (queryParam) {
      setSearchQuery(queryParam);
      setHasSearched(true);
    }
  }, [searchParams]);  // Load initial data when component mounts
  useEffect(() => {
    loadInitialData();
    getCurrentUser();
    loadPostTypes();
  }, []);

  // Reload suggested users when current user changes
  useEffect(() => {
    if (currentUser) {
      loadInitialData();
    }
  }, [currentUser?.id]);
  const getCurrentUser = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
      
      // Load following status for suggested users
      await loadFollowingStatus();
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };
  const loadFollowingStatus = async () => {
    try {
      const following = await FollowService.getFollowing();
      const followingIds = new Set(following.map(f => f.following.id));
      setFollowingUsers(followingIds);
    } catch (error) {
      console.error('Error loading following status:', error);
    }
  };

  const loadPostTypes = async () => {
    try {
      const types = await PostTypeService.getAllPostTypes();
      setPostTypes(types);
    } catch (error) {
      console.error('Error loading post types:', error);
    }
  };

  const handleFollowToggle = async (userId: number) => {
    if (!currentUser || currentUser.id === userId) return;

    try {
      setFollowLoading(prev => new Set([...prev, userId]));
      
      const isCurrentlyFollowing = followingUsers.has(userId);
      
      if (isCurrentlyFollowing) {
        await FollowService.unfollowUser(userId);
        setFollowingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      } else {
        await FollowService.followUser(userId);
        setFollowingUsers(prev => new Set([...prev, userId]));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setFollowLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [suggested, trending, randomPostsData] = await Promise.all([        SearchService.getSuggestedUsers(5, currentUser?.id), // Get 5 friend-of-friend suggestions
        SearchService.getTrendingTags(8),
        SearchService.getRandomPosts(5) // Get 5 posts you might want to see for "all" tab
      ]);
      setSuggestedUsers(suggested);
      setTrendingTags(trending);
      setRandomPosts(randomPostsData);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Không thể tải dữ liệu ban đầu');
    } finally {
      setLoading(false);
    }
  };
  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults({ users: [], posts: [], tags: [], totalResults: 0 });
        setHasSearched(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        let results: SearchResults;
        switch (activeTab) {
          case 'people':
            const users = await SearchService.searchUsers(query, currentUser?.id);
            results = { users, posts: [], tags: [], totalResults: users.length };
            break;          case 'post':
            let posts = await SearchService.searchPosts(query);
            
            // Apply location filter if selected
            if (selectedLocationId !== null) {
              posts = posts.filter(post => post.location?.id === selectedLocationId);
            }
            
            // Apply post type filter if selected
            if (selectedPostTypeId !== null) {
              posts = posts.filter(post => post.postType?.id === selectedPostTypeId);
            }
            
            // Apply sorting
            posts = [...posts].sort((a, b) => {
              switch (sortBy) {
                case 'most_viewed':
                  return (b.viewCount ?? 0) - (a.viewCount ?? 0);
                case 'most_loved':
                  return (b.likesCount ?? 0) - (a.likesCount ?? 0);
                case 'most_commented':
                  return (b.commentsCount ?? 0) - (a.commentsCount ?? 0);
                case 'latest':
                default:
                  return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
              }
            });
            
            results = { users: [], posts, tags: [], totalResults: posts.length };
            break;
          case 'all':
          default:
            // Search across all content types
            results = await SearchService.searchAll(query, currentUser?.id);
        }
        
        setSearchResults(results);
        setHasSearched(true);
      } catch (err) {
        console.error('Search error:', err);
        setError('Không thể thực hiện tìm kiếm. Vui lòng thử lại.');
        setSearchResults({ users: [], posts: [], tags: [], totalResults: 0 });
      } finally {
        setLoading(false);
      }    }, 300),
    [activeTab, selectedLocationId, selectedPostTypeId, sortBy, currentUser?.id]
  );
  // Effect to trigger search when query or tab changes
  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);  // Effect to trigger search when location, post type, or sort filters change (for post tab only)
  useEffect(() => {
    if (activeTab === "post" && searchQuery.trim()) {
      debouncedSearch(searchQuery);
    }
  }, [selectedLocationId, selectedPostTypeId, sortBy, activeTab, searchQuery, debouncedSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    debouncedSearch(searchQuery);
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    // Re-trigger search with new tab
    if (searchQuery.trim()) {
      debouncedSearch(searchQuery);
    }
  };

  const handleTagClick = (tagName: string) => {
    setSearchQuery(`#${tagName}`);
    setActiveTab('posts');
  };
  // Get display data based on current state
  const getDisplayData = () => {
    if (hasSearched) {
      return searchResults;
    }
    
    // Show initial data when no search has been performed
    if (activeTab === "all") {      return {
        users: suggestedUsers,
        posts: randomPosts, // Show posts you might want to see in "all" tab
        tags: trendingTags,
        totalResults: suggestedUsers.length + randomPosts.length + trendingTags.length
      };
    } else if (activeTab === "people") {      return {
        users: suggestedUsers,
        posts: randomPosts, // Show some posts you might want to see in "people" tab too
        tags: [],
        totalResults: suggestedUsers.length + randomPosts.length
      };
    } else {
      // Post tab - no initial data, only show results when searching
      return {
        users: [],
        posts: [],
        tags: [],
        totalResults: 0
      };
    }
  };

  const displayData = getDisplayData();  return (
    <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Left sidebar */}
      <Sidebar />
      {/* Main content */}
      <main className="flex-1 ml-0 md:ml-64 p-6 lg:pr-80">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Tìm kiếm</h1>
          
          {/* Search form */}
          <form onSubmit={handleSearch} className="mb-6">            <Input
              type="text"
              placeholder="Tìm kiếm người dùng, bài viết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<SearchIcon size={20} />}
              size="lg"
              variant="bordered"
              className="max-w-3xl"
            />
          </form>
        
          {/* Error message */}
          {error && (
            <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
              <CardBody>
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </CardBody>
            </Card>
          )}
          {/* Tabs */}          <Tabs 
            aria-label="Danh mục tìm kiếm" 
            selectedKey={activeTab}
            onSelectionChange={(key) => handleTabChange(key as string)}
            className="mb-6"
          >
            <Tab key="all" title={<div className="flex items-center gap-1"><SearchIcon size={16} /> Tất Cả</div>} />
            <Tab key="people" title={<div className="flex items-center gap-1"><User size={16} /> Người</div>} />
            <Tab key="post" title={<div className="flex items-center gap-1"><Users size={16} /> Bài Viết</div>} />
          </Tabs>          {/* Post filtering controls - only show when post tab is active */}
          {activeTab === "post" && (
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <LocationFilter 
                selectedLocationId={selectedLocationId}
                onLocationChange={setSelectedLocationId}
                className="flex-1"
              />              <Select
                label="Loại bài viết"
                placeholder="Tất cả loại bài viết"
                selectedKeys={selectedPostTypeId !== null ? new Set([selectedPostTypeId.toString()]) : new Set()}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0];
                  setSelectedPostTypeId(selectedKey && selectedKey !== "" ? parseInt(selectedKey as string) : null);
                }}
                className="flex-1 max-w-xs"
                size="sm"                items={[
                  { key: "", label: "Tất cả loại bài viết" },
                  ...postTypes.map(type => ({
                    key: type.id.toString(),
                    label: type.typeName === 'info' ? 'Thông tin' :
                           type.typeName === 'scenic' ? 'Cảnh đẹp' :
                           type.typeName === 'discussion' ? 'Thảo luận' : type.typeName
                  }))
                ]}
              >
                {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
              </Select>
              
              <Select
                label="Sắp xếp theo"
                placeholder="Chọn cách sắp xếp..."
                selectedKeys={new Set([sortBy])}
                onSelectionChange={(keys) => setSortBy(Array.from(keys)[0] as any)}
                className="flex-1 max-w-xs"
                size="sm"
              >
                <SelectItem key="latest">Mới nhất</SelectItem>
                <SelectItem key="most_viewed">Xem nhiều nhất</SelectItem>
                <SelectItem key="most_loved">Yêu thích nhất</SelectItem>
                <SelectItem key="most_commented">Bình luận nhiều nhất</SelectItem>
              </Select>
            </div>
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" color="primary" />
            </div>
          )}

          {/* Search results or initial content */}
          {!loading && (
            <>
              {/* Results summary */}              {hasSearched && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {displayData.totalResults > 0 
                      ? `Tìm thấy ${displayData.totalResults} kết quả${displayData.totalResults !== 1 ? '' : ''} cho "${searchQuery}"`
                      : `Không tìm thấy kết quả cho "${searchQuery}"`
                    }
                  </p>
                </div>
              )}              {/* People/Users section */}
              {(activeTab === "all" || activeTab === "people") && displayData.users.length > 0 && (
                <div className="mb-8">                  <div className="flex items-center gap-2 mb-4">
                    <User size={20} className="text-blue-600 dark:text-blue-400" />
                    <h2 className="text-xl font-semibold">
                      {hasSearched ? 'Mọi người' : 'Những người bạn có thể biết'}
                    </h2>
                  </div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">                    {displayData.users.map(user => (                      <Card key={user.id} className="w-full hover:shadow-lg transition-shadow">
                        <CardBody className="flex flex-col items-center text-center gap-4 p-6">
                          <Avatar 
                            src={getAvatarSrc(user.profilePicture, user.username)}
                            showFallback
                            name={user.displayName || user.username}
                            size="lg" 
                            className="cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => {
                              // Don't navigate if clicking on own avatar
                              if (currentUser && currentUser.username === user.username) {
                                return;
                              }
                              navigateToProfile(user.username);
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">
                              {user.displayName || user.username}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              @{user.username}
                            </p>                            {user.bio && (
                              <p className="text-sm mt-1 line-clamp-2">{user.bio}</p>
                            )}
                            {user.followersCount !== undefined && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                {user.followersCount.toLocaleString()} người theo dõi
                              </p>)}
                          </div>
                          {currentUser && currentUser.id !== user.id && (
                            <Button 
                              size="sm" 
                              color={followingUsers.has(user.id) ? "default" : "primary"}
                              variant={followingUsers.has(user.id) ? "flat" : "solid"}
                              onClick={() => handleFollowToggle(user.id)}
                              isLoading={followLoading.has(user.id)}
                            >
                              {followingUsers.has(user.id) ? "Đang theo dõi" : "Theo dõi"}
                            </Button>
                          )}
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                  {activeTab === "people" && displayData.users.length >= 6 && (
                    <div className="mt-4 text-center">
                      <Button variant="flat" onClick={() => setSearchQuery(searchQuery + " ")}>
                        Tải thêm
                      </Button>
                    </div>
                  )}
                </div>
              )}              {/* Posts section */}
              {(activeTab === "all" || activeTab === "post") && displayData.posts.length > 0 && (                <div className="mb-8">                  <div className="flex items-center gap-2 mb-4">
                    <Hash size={20} className="text-green-600 dark:text-green-400" />
                    <h2 className="text-xl font-semibold">
                      {hasSearched ? 'Bài viết' : (activeTab === "all" ? 'Bài viết bạn có thể muốn xem' : 'Bài viết')}
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {displayData.posts.map(post => (
                      <Card key={post.id} className="w-full hover:shadow-lg transition-shadow">
                        <CardBody>                          <div className="flex items-start gap-3 mb-3">                            <Avatar 
                              src={getAvatarSrc(post.author.profilePicture, post.author.username)}
                              showFallback
                              name={post.author.displayName || post.author.username}
                              size="sm"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">
                                  {post.author.displayName || post.author.username}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  @{post.author.username}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(post.createdDate).toLocaleDateString('vi-VN', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-sm mb-3 whitespace-pre-wrap">{post.content}</p>
                            {/* Media preview */}
                          {post.media && post.media.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              {post.media.slice(0, 4).map((media, index) => (
                                <div key={media.id} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden relative">
                                  {media.mediaType === 'IMAGE' ? (
                                    <img 
                                      src={media.mediaUrl} 
                                      alt="Post media"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <video 
                                      src={media.mediaUrl}
                                      className="w-full h-full object-cover"
                                      controls={false}
                                    />
                                  )}
                                  {index === 3 && post.media && post.media.length > 4 && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-semibold">
                                      +{post.media.length - 4}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-4">                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {post.likesCount || 0} lượt thích
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {post.commentsCount || 0} bình luận
                              </span>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>                  {activeTab === "post" && displayData.posts.length >= 10 && (
                    <div className="mt-4 text-center">
                      <Button variant="flat" onClick={() => setSearchQuery(searchQuery + " ")}>
                        Tải Thêm
                      </Button>
                    </div>
                  )}
                </div>
              )}              {/* No results message */}
              {hasSearched && displayData.totalResults === 0 && !loading && (
                <div className="text-center py-12">
                  <SearchIcon size={48} className="mx-auto text-gray-400 mb-4" />                  <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Không tìm thấy kết quả
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500">
                    Hãy thử tìm kiếm với từ khóa khác hoặc kiểm tra lại chính tả.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      {/* Right sidebar */}
      <RightSidebar />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="flex-1 ml-0 md:ml-64 p-6 lg:pr-80">
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded mb-6"></div>
              <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded mb-6"></div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
