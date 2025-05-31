"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { MessageCircle, Share, MoreHorizontal, Bookmark } from "react-feather";
import { UpvoteArrow, DownvoteArrow } from './VoteArrows';
import CommentSection from './CommentSection';
import PostDetailModal from './PostDetailModal';
import { Card, CardHeader, CardBody, CardFooter, Avatar, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { formatDistanceToNow } from "date-fns";
import { PostReactionService, BookmarkService, ReactionTypeService, viewService } from "@/services";
import { avatarBase64 } from "@/static/images/avatarDefault";
import { useProfileNavigation } from "@/utils/profileNavigation";
import { AuthService } from "@/services";

interface PostProps {
  id: string;
  authorName: string;
  authorUsername: string;
  authorAvatar?: string;
  content: string;
  image?: string;
  images?: string[]; // Add support for multiple images
  likes: number;
  dislikes?: number;
  comments: number;
  shares: number;
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
  shares,
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
  const [currentUser, setCurrentUser] = useState<any>(null);
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
  const handleReport = async () => {
    if (loading) return;

    try {
      setLoading(true);
      const postId = parseInt(id);
      
      // For now, just show a success alert since admin functionality is for future work
      // TODO: Implement actual report API endpoint and admin system
      alert("Báo cáo đã được gửi thành công. Chúng tôi sẽ xem xét trong thời gian sớm nhất.");
      
      // You can add actual API call here when backend report system is implemented
      // await ReportService.reportPost(postId, reportReason);
      
    } catch (error) {
      console.error('Error reporting post:', error);
      alert("Có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  const handleCommentsCountChange = (newCount: number) => {
    setCommentCount(newCount);
  };  return (
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
            <DropdownMenu aria-label="Post actions">
              <DropdownItem
                key="bookmark"
                onClick={handleBookmark}
                startContent={<Bookmark size={16} />}
              >
                {isBookmarked ? 'Bỏ Lưu' : 'Lưu Bài Viết'}
              </DropdownItem>
              <DropdownItem
                key="report"
                onClick={handleReport}
              >
                Báo Cáo
              </DropdownItem>
              <DropdownItem key="hide">Ẩn</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </CardHeader>        <CardBody 
          className="px-3 py-0 text-sm cursor-pointer" 
          onClick={handleOpenModal}
        >
          <p>{content}</p>
          {/* Single image display */}
          {image && (
            <div className="mt-3 relative w-full max-w-lg mx-auto rounded-lg overflow-hidden">
              <Image
                src={image}
                alt="Post image"
                width={500}
                height={300}
                className="w-full h-auto object-cover"
                style={{ maxHeight: '400px' }}
              />
            </div>
          )}

          {/* Multiple images display */}
          {images && images.length > 0 && (
            <div className="mt-3 grid gap-2"
              style={{
                gridTemplateColumns: images.length === 1 ? '1fr' :
                  images.length === 2 ? '1fr 1fr' :
                    images.length === 3 ? '1fr 1fr 1fr' :
                      '1fr 1fr'
              }}>
              {images.slice(0, 4).map((img, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden">
                  <Image
                    src={img}
                    alt={`Post image ${index + 1}`}
                    width={250}
                    height={250}
                    className="w-full h-full object-cover"
                    style={{ aspectRatio: '1/1' }}
                  />
                  {images.length > 4 && index === 3 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white text-lg font-semibold">
                        +{images.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-3 text-xs text-default-400">
            <span>{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
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
            </div>

            {/* Comment and Share Section */}
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

              <div className="flex items-center gap-1">
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  className="hover:bg-purple-50 dark:hover:bg-purple-900/20 text-default-400 hover:text-purple-600"
                >
                  <Share size={18} />
                </Button>
                <span className="text-sm text-default-600">{shares}</span>
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>      {/* Comment Section */}
      {showComments && (
        <CommentSection
          postId={id}
          commentsCount={commentCount}
          onCommentsCountChange={handleCommentsCountChange}
        />
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
          shares,
          createdAt,
          liked: isLiked,
          disliked: isDisliked
        }}
      />
    </div>
  );
}
