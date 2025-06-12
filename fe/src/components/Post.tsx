"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { MessageCircle, MoreHorizontal, Bookmark, Edit3, Trash2 } from "react-feather";
import { UpvoteArrow, DownvoteArrow } from './VoteArrows';
import CommentSection from './CommentSection';
import PostDetailModal from './PostDetailModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ReportModal from './ReportModal';
import EditModal from './EditModal';
import { Card, CardHeader, CardBody, CardFooter, Avatar, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { PostReactionService, BookmarkService, ReactionTypeService, viewService, PostService, AuthService } from "@/services";
import { avatarBase64 } from "@/static/images/avatarDefault";
import { useProfileNavigation } from "@/utils/profileNavigation";
import ReportService from "@/services/ReportService";
import ProfanityService from "@/services/ProfanityService";
import MediaService from "@/services/MediaService";

interface PostProps {
  id: string;
  authorName: string;
  authorUsername: string;
  authorAvatar?: string;
  content: string;
  image?: string;
  images?: string[]; // Add support for multiple images
  likes: number;
  dislikes?: number;  comments: number;
  createdAt: Date;
  liked?: boolean;
  disliked?: boolean;
  highlighted?: boolean; // Add highlighted prop
  viewSource?: 'feed' | 'profile' | 'search' | 'bookmark' | 'notification'; // Add view source tracking
}

export default function Post({
  id,
  authorName,
  authorUsername,
  authorAvatar,
  content,
  image,
  images,
  likes,
  dislikes = 0,
  comments,
  createdAt,
  liked = false,
  disliked = false,
  highlighted = false,
  viewSource = 'feed'
}: PostProps) {
  const [isLiked, setIsLiked] = useState(liked);
  const [isDisliked, setIsDisliked] = useState(disliked);
  const [likeCount, setLikeCount] = useState(likes);
  const [dislikeCount, setDislikeCount] = useState(dislikes);
  const [commentCount, setCommentCount] = useState(comments);
  const [showComments, setShowComments] = useState(false);  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [postContent, setPostContent] = useState(content);
  const [likeReactionTypeId, setLikeReactionTypeId] = useState<number | null>(null);
  const [dislikeReactionTypeId, setDislikeReactionTypeId] = useState<number | null>(null);
  const { navigateToProfile } = useProfileNavigation();

  useEffect(() => {
    const initializePost = async () => {
      try {
        // Get current user
        const user = await AuthService.getCurrentUser();
        setCurrentUser(user);        // Get reaction type IDs
        const reactionTypes = await ReactionTypeService.getCachedReactionTypes();
        const likeType = reactionTypes.find(type => type.name.toLowerCase() === 'like');
        const dislikeType = reactionTypes.find(type => type.name.toLowerCase() === 'dislike');

        if (likeType) setLikeReactionTypeId(likeType.id);
        if (dislikeType) setDislikeReactionTypeId(dislikeType.id);

        // Get actual user reaction for this post
        const postId = parseInt(id);
        const userReaction = await PostReactionService.getUserReactionForPost(postId);

        if (userReaction) {
          if (userReaction.reactionTypeId === likeType?.id) {
            setIsLiked(true);
            setIsDisliked(false);
          } else if (userReaction.reactionTypeId === dislikeType?.id) {
            setIsLiked(false);
            setIsDisliked(true);
          }
        }

        // Get actual reaction counts
        if (likeType) {
          const actualLikeCount = await PostReactionService.getReactionCountByType(postId, likeType.id);
          setLikeCount(actualLikeCount);
        }

        if (dislikeType) {
          const actualDislikeCount = await PostReactionService.getReactionCountByType(postId, dislikeType.id);
          setDislikeCount(actualDislikeCount);
        }

        // Check bookmark status
        const bookmarkStatus = await BookmarkService.isPostBookmarked(postId);
        setIsBookmarked(bookmarkStatus);

      } catch (error) {
        console.error('Error initializing post:', error);
        // Fallback to prop values on error
        setIsLiked(liked);
        setIsDisliked(disliked);
        setLikeCount(likes);
        setDislikeCount(dislikes);
      }
    };    initializePost();
  }, [id, liked, disliked, likes, dislikes]);
  // Function to handle opening modal with view tracking
  const handleOpenModal = () => {
    console.log(`🔍 DEBUG: Modal opened for post ${id}, tracking view with source: ${viewSource}`);
    setShowDetailModal(true);
    // Track view when modal is opened (from clicking on post content)
    viewService.trackView(id, viewSource);
  };

  // Generate a consistent fallback avatar based on username
  const getAvatarSrc = () => {
    if (authorAvatar && authorAvatar.trim() !== '') {
      return authorAvatar;
    }
    // Use the same default avatar as other components
    return avatarBase64;
  };

  const handleAvatarClick = () => {
    // Don't navigate if clicking on own avatar
    if (currentUser && currentUser.username === authorUsername) {
      return;
    }
    navigateToProfile(authorUsername);
  }; const handleLike = async () => {
    if (loading || !likeReactionTypeId) return;

    try {
      setLoading(true);
      const postId = parseInt(id);

      if (isLiked) {
        // Remove like
        await PostReactionService.removeReaction(postId);
        setLikeCount(prev => prev - 1);
        setIsLiked(false);
      } else {
        // If user has disliked, remove dislike first
        if (isDisliked) {
          await PostReactionService.removeReaction(postId);
          setDislikeCount(prev => prev - 1);
          setIsDisliked(false);
        }
        // Add like using dynamic reaction type ID
        await PostReactionService.addReaction(postId, likeReactionTypeId);
        setLikeCount(prev => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error handling like:', error);
      // Revert optimistic update on error
      setIsLiked(liked);
      setLikeCount(likes);
      setIsDisliked(disliked);
      setDislikeCount(dislikes);
    } finally {
      setLoading(false);
    }
  };

  const handleDislike = async () => {
    if (loading || !dislikeReactionTypeId) return;

    try {
      setLoading(true);
      const postId = parseInt(id);

      if (isDisliked) {
        // Remove dislike
        await PostReactionService.removeReaction(postId);
        setDislikeCount(prev => prev - 1);
        setIsDisliked(false);
      } else {
        // If user has liked, remove like first
        if (isLiked) {
          await PostReactionService.removeReaction(postId);
          setLikeCount(prev => prev - 1);
          setIsLiked(false);
        }
        // Add dislike using dynamic reaction type ID
        await PostReactionService.addReaction(postId, dislikeReactionTypeId);
        setDislikeCount(prev => prev + 1);
        setIsDisliked(true);
      }
    } catch (error) {
      console.error('Error handling dislike:', error);
      // Revert optimistic update on error
      setIsLiked(liked);
      setLikeCount(likes);
      setIsDisliked(disliked);
      setDislikeCount(dislikes);
    } finally {
      setLoading(false);
    }
  };
  const handleBookmark = async () => {
    if (loading) return;

    try {
      setLoading(true);
      const postId = parseInt(id);

      if (isBookmarked) {
        await BookmarkService.removeBookmark(postId);
        setIsBookmarked(false);
      } else {
        await BookmarkService.addBookmark(postId);
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Error handling bookmark:', error);
      // Revert optimistic update on error
      setIsBookmarked(!isBookmarked);
    } finally {
      setLoading(false);
    }  };
  const handleReport = () => {
    setShowReportModal(true);
  };

  const handleReportSubmit = async (reason: string, description?: string) => {
    try {
      setLoading(true);
      const postId = parseInt(id);

      await ReportService.reportPost(postId, reason, description || '');

      // Show success message (you could use a toast notification instead)
      alert("Báo cáo đã được gửi thành công. Chúng tôi sẽ xem xét trong thời gian sớm nhất.");

    } catch (error) {
      console.error('Error reporting post:', error);
      alert("Có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      const postId = parseInt(id);

      await PostService.deletePost(postId);

      // Notify parent component or redirect
      alert('Bài viết đã được xóa thành công.');

      // Reload the page to refresh the feed
      window.location.reload();

    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Không thể xóa bài viết. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPost = () => {
    setShowEditModal(true);
  };

  const handleEditSave = async (newContent: string) => {
    try {
      setLoading(true);
      const postId = parseInt(id);

      // Check for profanity before updating
      const profanityResult = await ProfanityService.checkProfanity(newContent);

      if (profanityResult.is_profane) {
        // Show profanity warning
        alert(`Nội dung chứa từ ngữ không phù hợp (độ tin cậy: ${(profanityResult.confidence * 100).toFixed(1)}%). Vui lòng chỉnh sửa và thử lại.`);
        setLoading(false);
        return;
      }

      await PostService.updatePost(postId, { content: newContent });

      // Update local state
      setPostContent(newContent);

      alert('Bài viết đã được cập nhật thành công.');

    } catch (error: any) {
      console.error('Error updating post:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error';

      if (ProfanityService.isProfanityError(errorMessage)) {
        alert('Nội dung chứa từ ngữ không phù hợp. Vui lòng chỉnh sửa và thử lại.');
      } else {
        alert('Không thể cập nhật bài viết. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  const handleCommentsCountChange = (newCount: number) => {
    setCommentCount(newCount);
  };



  return (
    <div className="mb-4">
      <Card className={`border border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        highlighted 
          ? 'ring-2 ring-blue-500 ring-opacity-75 shadow-lg bg-blue-50 dark:bg-blue-900/10' 
          : ''
      }`}>
        <CardHeader className="justify-between">
          <div className="flex gap-3">
            <Avatar
              radius="full"
              size="md"
              src={getAvatarSrc()}
              className="cursor-pointer hover:scale-105 transition-transform"
              onClick={handleAvatarClick}
            />
            <div className="flex flex-col items-start justify-center">
              <h4 className="text-sm font-semibold leading-none text-default-600">{authorName}</h4>
              <p className="text-xs text-default-400">@{authorUsername}</p>
            </div>
          </div>          <Dropdown>
            <DropdownTrigger>
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal size={20} />
              </Button>
            </DropdownTrigger>

            <DropdownMenu
              aria-label="Hành động bài viết"
              onAction={(key) => {
                switch (key) {
                  case 'bookmark':
                    handleBookmark();
                    break;
                  case 'edit':
                    handleEditPost();
                    break;
                  case 'delete':
                    handleDeletePost();
                    break;
                  case 'report':
                    handleReport();
                    break;
                  default:
                    break;
                }
              }}
            >
              <DropdownItem
                key="bookmark"
                startContent={<Bookmark size={16} />}
              >
                {isBookmarked ? 'Bỏ Lưu' : 'Lưu Bài Viết'}
              </DropdownItem>



              {/* Show edit and delete options only for post owner */}
              {currentUser && currentUser.username === authorUsername && [
                <DropdownItem
                  key="edit"
                  startContent={<Edit3 size={16} />}
                >
                  Chỉnh sửa
                </DropdownItem>,
                <DropdownItem
                  key="delete"
                  className="text-danger"
                  color="danger"
                  startContent={<Trash2 size={16} />}
                >
                  Xóa Bài Viết
                </DropdownItem>
              ]}

              {/* Show report option for others */}
              {currentUser && currentUser.username !== authorUsername && (
                <DropdownItem key="report">
                  Báo Cáo
                </DropdownItem>
              )}

              {/* Fallback options if no user */}
              {!currentUser && (
                <DropdownItem key="login" isReadOnly>
                  Đăng nhập để xem thêm tùy chọn
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>
        </CardHeader>        <CardBody 
          className="px-3 py-0 text-sm cursor-pointer" 
          onClick={handleOpenModal}
        >
          <p>{postContent}</p>
          {/* Media display - Facebook style grid */}
          {(() => {
            // Combine all media sources and remove duplicates
            const allMedia = [];
            if (image) allMedia.push(image);
            if (images && images.length > 0) allMedia.push(...images);

            // Remove duplicates by converting to Set and back to array
            const uniqueMedia = [...new Set(allMedia)];

            if (uniqueMedia.length === 0) return null;

            // Single media - full width
            if (uniqueMedia.length === 1) {
              return (
                <div className="mt-3 relative w-full max-w-lg mx-auto rounded-lg overflow-hidden">
                  {MediaService.isVideoUrl(uniqueMedia[0]) ? (
                    <video
                      src={uniqueMedia[0]}
                      controls
                      className="w-full h-auto object-cover"
                      style={{ maxHeight: '400px' }}
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <Image
                      src={uniqueMedia[0]}
                      alt="Post media"
                      width={500}
                      height={300}
                      className="w-full h-auto object-cover"
                      style={{ maxHeight: '400px' }}
                    />
                  )}
                </div>
              );
            }

            // Multiple media - Facebook style grid
            return (
              <div className="mt-3 rounded-lg overflow-hidden max-w-lg mx-auto">
                {uniqueMedia.length === 2 && (
                  // 2 images: side by side
                  <div className="grid grid-cols-2 gap-1">
                    {uniqueMedia.slice(0, 2).map((media, index) => (
                      <div key={index} className="aspect-square">
                        {MediaService.isVideoUrl(media) ? (
                          <video
                            src={media}
                            controls
                            className="w-full h-full object-cover"
                            preload="metadata"
                          >
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <Image
                            src={media}
                            alt={`Post media ${index + 1}`}
                            width={250}
                            height={250}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {uniqueMedia.length === 3 && (
                  // 3 images: first large, two small on right
                  <div className="grid grid-cols-2 gap-1" style={{ height: '320px' }}>
                    <div className="relative">
                      {MediaService.isVideoUrl(uniqueMedia[0]) ? (
                        <video
                          src={uniqueMedia[0]}
                          controls
                          className="w-full h-full object-cover"
                          preload="metadata"
                        >
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <Image
                          src={uniqueMedia[0]}
                          alt="Post media 1"
                          width={250}
                          height={320}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="grid grid-rows-2 gap-1">
                      {uniqueMedia.slice(1, 3).map((media, index) => (
                        <div key={index + 1} className="relative">
                          {MediaService.isVideoUrl(media) ? (
                            <video
                              src={media}
                              controls
                              className="w-full h-full object-cover"
                              preload="metadata"
                            >
                              Your browser does not support the video tag.
                            </video>
                          ) : (
                            <Image
                              src={media}
                              alt={`Post media ${index + 2}`}
                              width={250}
                              height={155}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {uniqueMedia.length >= 4 && (
                  // 4+ images: 2x2 grid, with overlay on 4th if more than 4
                  <div className="grid grid-cols-2 gap-1" style={{ height: '320px' }}>
                    {uniqueMedia.slice(0, 4).map((media, index) => (
                      <div key={index} className="relative">
                        {MediaService.isVideoUrl(media) ? (
                          <video
                            src={media}
                            controls
                            className="w-full h-full object-cover"
                            preload="metadata"
                          >
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <Image
                            src={media}
                            alt={`Post media ${index + 1}`}
                            width={250}
                            height={155}
                            className="w-full h-full object-cover"
                          />
                        )}
                        {uniqueMedia.length > 4 && index === 3 && (
                          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                            <span className="text-white text-xl font-semibold">
                              +{uniqueMedia.length - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}          <div className="flex items-center justify-between mt-3 text-xs text-default-400">
            <span>{formatDistanceToNow(createdAt, { addSuffix: true, locale: vi })}</span>
          </div>
        </CardBody>        <CardFooter className="gap-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between w-full">
            {/* Like/Dislike Section */}
            <div className="flex items-center gap-4">              <div className="flex items-center gap-1">
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onClick={handleLike}
                disabled={loading}
                className={`transition-colors ${isLiked
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'text-default-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                  }`}
              >
                <UpvoteArrow size={18} filled={isLiked} className={isLiked ? 'text-white' : ''} />
              </Button>
              <span className="text-sm text-default-600 min-w-[20px]">{likeCount}</span>
            </div>
              <div className="flex items-center gap-1">
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onClick={handleDislike}
                  disabled={loading}
                  className={`transition-colors ${isDisliked
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'text-default-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                    }`}
                >
                  <DownvoteArrow size={18} filled={isDisliked} className={isDisliked ? 'text-white' : ''} />
                </Button>
                <span className="text-sm text-default-600 min-w-[20px]">{dislikeCount}</span>
              </div>
            </div>            {/* Comment Section */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onClick={handleToggleComments}
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20 text-default-400 hover:text-blue-600"
                >
                  <MessageCircle size={18} />
                </Button>
                <span className="text-sm text-default-600">{commentCount}</span>
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>      {/* Comment Section */}
      {showComments && (
        <CommentSection
          postId={id}
          commentsCount={commentCount}
          onCommentsCountChange={handleCommentsCountChange}        />
      )}

      {/* Post Detail Modal */}
      <PostDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        post={{
          id,
          authorName,
          authorUsername,
          authorAvatar,
          content,
          image,
          images,
          likes: likeCount,
          dislikes: dislikeCount,
          comments: commentCount,
          createdAt,
          liked: isLiked,
          disliked: isDisliked
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Xóa bài viết"
        message="Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác và tất cả bình luận cũng sẽ bị xóa."
        itemType="post"
        isLoading={loading}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReportSubmit}
        itemType="post"
        isLoading={loading}
      />

      {/* Edit Modal */}
      <EditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditSave}
        initialContent={content}
        itemType="post"
        isLoading={loading}
      />
    </div>
  );
}
