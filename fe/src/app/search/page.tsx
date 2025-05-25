"use client";
import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import { Card, CardBody, Input, Avatar, Button, Chip, Tabs, Tab, Spinner } from "@nextui-org/react";
import { Search as SearchIcon, User, Users, Hash, Calendar, Image } from "react-feather";
import { SearchService, UserSearchResult, PostSearchResult, TagSearchResult, SearchResults } from "@/services/SearchService";

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export default function SearchPage() {
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
  const [trendingTags, setTrendingTags] = useState<TagSearchResult[]>([]);

  // Load initial data when component mounts
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [suggested, trending] = await Promise.all([
        SearchService.getSuggestedUsers(6),
        SearchService.getTrendingTags(8)
      ]);
      setSuggestedUsers(suggested);
      setTrendingTags(trending);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load initial data');
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
            const users = await SearchService.searchUsers(query);
            results = { users, posts: [], tags: [], totalResults: users.length };
            break;
          case 'posts':
            const posts = await SearchService.searchPosts(query);
            results = { users: [], posts, tags: [], totalResults: posts.length };
            break;
          case 'tags':
            const tags = await SearchService.searchTags(query);
            results = { users: [], posts: [], tags, totalResults: tags.length };
            break;
          case 'photos':
            const media = await SearchService.searchMedia(query);
            results = { users: [], posts: media, tags: [], totalResults: media.length };
            break;
          default:
            results = await SearchService.searchAll(query);
        }
        
        setSearchResults(results);
        setHasSearched(true);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to perform search. Please try again.');
        setSearchResults({ users: [], posts: [], tags: [], totalResults: 0 });
      } finally {
        setLoading(false);
      }
    }, 300),
    [activeTab]
  );

  // Effect to trigger search when query or tab changes
  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

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
    return {
      users: suggestedUsers,
      posts: [],
      tags: trendingTags,
      totalResults: suggestedUsers.length + trendingTags.length
    };
  };

  const displayData = getDisplayData();  return (
    <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Left sidebar */}
      <Sidebar />
      {/* Main content */}
      <main className="flex-1 ml-0 md:ml-64 p-6 lg:pr-80">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Search</h1>
          
          {/* Search form */}
          <form onSubmit={handleSearch} className="mb-6">
            <Input
              type="text"
              placeholder="Search for users, posts, tags, or events..."
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
        
          {/* Tabs */}
          <Tabs 
            aria-label="Search categories" 
            selectedKey={activeTab}
            onSelectionChange={(key) => handleTabChange(key as string)}
            className="mb-6"
          >
            <Tab key="all" title={<div className="flex items-center gap-1"><SearchIcon size={16} /> All</div>} />
            <Tab key="people" title={<div className="flex items-center gap-1"><User size={16} /> People</div>} />
            <Tab key="posts" title={<div className="flex items-center gap-1"><Users size={16} /> Posts</div>} />
            <Tab key="tags" title={<div className="flex items-center gap-1"><Hash size={16} /> Tags</div>} />
            <Tab key="photos" title={<div className="flex items-center gap-1"><Image size={16} /> Photos</div>} />
          </Tabs>

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" color="primary" />
            </div>
          )}

          {/* Search results or initial content */}
          {!loading && (
            <>
              {/* Results summary */}
              {hasSearched && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {displayData.totalResults > 0 
                      ? `Found ${displayData.totalResults} result${displayData.totalResults !== 1 ? 's' : ''} for "${searchQuery}"`
                      : `No results found for "${searchQuery}"`
                    }
                  </p>
                </div>
              )}

              {/* People/Users section */}
              {(activeTab === "all" || activeTab === "people") && displayData.users.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">
                    {hasSearched ? 'People' : 'Suggested Users'}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayData.users.map(user => (
                      <Card key={user.id} className="w-full hover:shadow-lg transition-shadow">
                        <CardBody className="flex flex-row items-center gap-4">
                          <Avatar 
                            src={user.profilePicture || `https://i.pravatar.cc/150?u=${user.username}`} 
                            size="lg" 
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">
                              {user.displayName || user.username}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              @{user.username}
                            </p>
                            {user.bio && (
                              <p className="text-sm mt-1 line-clamp-2">{user.bio}</p>
                            )}
                            {user.followersCount !== undefined && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {user.followersCount.toLocaleString()} followers
                              </p>
                            )}
                          </div>
                          <Button size="sm" color="primary">Follow</Button>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                  {activeTab === "people" && displayData.users.length >= 6 && (
                    <div className="mt-4 text-center">
                      <Button variant="flat" onClick={() => setSearchQuery(searchQuery + " ")}>
                        Load More
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Posts section */}
              {(activeTab === "all" || activeTab === "posts" || activeTab === "photos") && displayData.posts.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">
                    {activeTab === "photos" ? "Photos & Videos" : "Posts"}
                  </h2>
                  <div className="space-y-4">
                    {displayData.posts.map(post => (
                      <Card key={post.id} className="w-full hover:shadow-lg transition-shadow">
                        <CardBody>
                          <div className="flex items-start gap-3 mb-3">
                            <Avatar 
                              src={post.author.profilePicture || `https://i.pravatar.cc/150?u=${post.author.username}`}
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
                                  {new Date(post.createdDate).toLocaleDateString()}
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
                            <div className="flex items-center gap-4">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {post.likesCount || 0} likes
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {post.commentsCount || 0} comments
                              </span>
                              {post.sharesCount !== undefined && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {post.sharesCount} shares
                                </span>
                              )}
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                  {(activeTab === "posts" || activeTab === "photos") && displayData.posts.length >= 10 && (
                    <div className="mt-4 text-center">
                      <Button variant="flat" onClick={() => setSearchQuery(searchQuery + " ")}>
                        Load More
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Tags section */}
              {(activeTab === "all" || activeTab === "tags") && displayData.tags.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">
                    {hasSearched ? 'Tags' : 'Trending Tags'}
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {displayData.tags.map(tag => (
                      <Chip 
                        key={tag.name} 
                        variant="flat" 
                        color="primary"
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleTagClick(tag.name)}
                      >
                        #{tag.name} ({tag.postsCount})
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

              {/* No results message */}
              {hasSearched && displayData.totalResults === 0 && !loading && (
                <div className="text-center py-12">
                  <SearchIcon size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500">
                    Try searching with different keywords or check your spelling.
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
