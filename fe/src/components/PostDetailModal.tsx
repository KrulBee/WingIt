"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Modal, 
  ModalContent, 
  ModalBody, 
  Button, 
  Avatar, 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem 
} from "@nextui-org/react";
import { 
  MessageCircle, 
  MoreHorizontal, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight 
} from "react-feather";
import { UpvoteArrow, DownvoteArrow } from './VoteArrows';
import CommentSection from './CommentSection';
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { PostReactionService, BookmarkService, ReactionTypeService, viewService } from "@/services";
import { avatarBase64 } from "@/static/images/avatarDefault";
import { useProfileNavigation } from "@/utils/profileNavigation";
import { AuthService } from "@/services";
import MediaService from "@/services/MediaService";

interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    authorName: string;
    authorUsername: string;
    authorAvatar?: string;
    content: string;    image?: string;
    images?: string[];
    likes: number;
    dislikes?: number;
    comments: number;
    createdAt: Date;
    liked?: boolean;
    disliked?: boolean;
  };
}

export default function PostDetailModal({ isOpen, onClose, post }: PostDetailModalProps) {
  const [isLiked, setIsLiked] = useState(post.liked || false);
  const [isDisliked, setIsDisliked] = useState(post.disliked || false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [dislikeCount, setDislikeCount] = useState(post.dislikes || 0);
  const [commentCount, setCommentCount] = useState(post.comments);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  
  // Reaction type IDs
  const [likeReactionTypeId, setLikeReactionTypeId] = useState<number | null>(null);
  const [dislikeReactionTypeId, setDislikeReactionTypeId] = useState<number | null>(null);
  
  const { navigateToProfile } = useProfileNavigation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [modalCleanup, setModalCleanup] = useState<(() => void) | null>(null);

  // Get all media (single image/video or multiple media)
  const allMedia = post.images && post.images.length > 0 ? post.images : (post.image ? [post.image] : []);
  const hasMultipleMedia = allMedia.length > 1;
  const hasMedia = allMedia.length > 0;
  useEffect(() => {
    const initializeModal = async () => {
      try {
        // Get current user
        const user = await AuthService.getCurrentUser();
        setCurrentUser(user);

        // Get reaction type IDs
        const reactionTypes = await ReactionTypeService.getAllReactionTypes();
        const likeType = reactionTypes.find((type: any) => type.typeName === 'LIKE');
        const dislikeType = reactionTypes.find((type: any) => type.typeName === 'DISLIKE');
        
        if (likeType) setLikeReactionTypeId(likeType.id);
        if (dislikeType) setDislikeReactionTypeId(dislikeType.id);

        // Check bookmark status
        const postId = parseInt(post.id);
        const bookmarkStatus = await BookmarkService.isPostBookmarked(postId);
        setIsBookmarked(bookmarkStatus);        // Track modal view with duration tracking
        const cleanup = await viewService.trackModalView(post.id, 'modal');
        setModalCleanup(() => cleanup);

      } catch (error) {
        console.error('Error initializing modal:', error);
      }
    };

    if (isOpen) {
      initializeModal();
    }    // Cleanup on unmount or when modal closes
    return () => {
      if (modalCleanup) {
        modalCleanup();
      }
    };
  }, [isOpen, post.id, onClose]);

  const getAvatarSrc = () => {
    if (post.authorAvatar && post.authorAvatar.trim() !== '') {
      return post.authorAvatar;
    }
    return avatarBase64;
  };

  const handleAvatarClick = () => {
    if (currentUser && currentUser.username === post.authorUsername) {
      return;
    }
    navigateToProfile(post.authorUsername);
  };

  const handleLike = async () => {
    if (loading || !likeReactionTypeId) return;

    try {
      setLoading(true);
      const postId = parseInt(post.id);

      if (isLiked) {
        await PostReactionService.removeReaction(postId);
        setLikeCount(prev => prev - 1);
        setIsLiked(false);
      } else {
        if (isDisliked) {
          await PostReactionService.removeReaction(postId);
          setDislikeCount(prev => prev - 1);
          setIsDisliked(false);
        }
        await PostReactionService.addReaction(postId, likeReactionTypeId);
        setLikeCount(prev => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error handling like:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDislike = async () => {
    if (loading || !dislikeReactionTypeId) return;

    try {
      setLoading(true);
      const postId = parseInt(post.id);

      if (isDisliked) {
        await PostReactionService.removeReaction(postId);
        setDislikeCount(prev => prev - 1);
        setIsDisliked(false);
      } else {
        if (isLiked) {
          await PostReactionService.removeReaction(postId);
          setLikeCount(prev => prev - 1);
          setIsLiked(false);
        }
        await PostReactionService.addReaction(postId, dislikeReactionTypeId);
        setDislikeCount(prev => prev + 1);
        setIsDisliked(true);
      }
    } catch (error) {
      console.error('Error handling dislike:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (loading) return;

    try {
      setLoading(true);
      const postId = parseInt(post.id);

      if (isBookmarked) {
        await BookmarkService.removeBookmark(postId);
        setIsBookmarked(false);
      } else {
        await BookmarkService.addBookmark(postId);
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Error handling bookmark:', error);
      setIsBookmarked(!isBookmarked);
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async () => {
    if (loading) return;

    try {
      setLoading(true);
      alert("Báo cáo đã được gửi thành công. Chúng tôi sẽ xem xét trong thời gian sớm nhất.");
    } catch (error) {
      console.error('Error reporting post:', error);
      alert("Có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleCommentsCountChange = (newCount: number) => {
    setCommentCount(newCount);
  };

  const nextMedia = () => {
    if (hasMultipleMedia) {
      setCurrentMediaIndex((prev) => (prev + 1) % allMedia.length);
    }
  };

  const prevMedia = () => {
    if (hasMultipleMedia) {
      setCurrentMediaIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
    }
  };
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size={hasMedia ? "5xl" : "2xl"}
      classNames={{
        base: "max-h-[90vh]",
        body: "p-0"
      }}
      hideCloseButton
      isDismissable={true}
      isKeyboardDismissDisabled={false}
    >
      <ModalContent>
        <ModalBody>
          <div className={`flex h-[85vh] ${!hasMedia ? 'justify-center' : ''}`}>            {hasMedia && (
              <div className="flex-1 relative bg-black flex items-center justify-center">
                <div className="relative w-full h-full flex items-center justify-center">
                  {MediaService.isVideoUrl(allMedia[currentMediaIndex]) ? (
                    <video
                      src={allMedia[currentMediaIndex]}
                      controls
                      className="max-w-full max-h-full object-contain"
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <Image
                      src={allMedia[currentMediaIndex]}
                      alt="Post media"
                      fill
                      className="object-contain"
                      priority
                    />
                  )}
                  
                  {hasMultipleMedia && (
                    <>
                      <Button
                        isIconOnly
                        variant="light"
                        className="absolute left-4 text-white bg-black/50 hover:bg-black/70"
                        onClick={prevMedia}
                      >
                        <ChevronLeft size={24} />
                      </Button>
                      <Button
                        isIconOnly
                        variant="light"
                        className="absolute right-4 text-white bg-black/50 hover:bg-black/70"
                        onClick={nextMedia}
                      >
                        <ChevronRight size={24} />
                      </Button>
                      
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {allMedia.map((_, index) => (
                          <button
                            key={index}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentMediaIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                            onClick={() => setCurrentMediaIndex(index)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}            <div className={`flex flex-col border-gray-200 dark:border-gray-700 ${
              hasMedia ? 'w-96 border-l' : 'w-full max-w-2xl'
            }`}>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar
                      radius="full"
                      size="md"
                      src={getAvatarSrc()}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={handleAvatarClick}
                    />
                    <div className="flex flex-col">
                      <h4 className="text-sm font-semibold">{post.authorName}</h4>
                      <p className="text-xs text-gray-500">@{post.authorUsername}</p>                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: vi })}
                      </p>
                    </div>
                  </div>
                  
                  <Dropdown>
                    <DropdownTrigger>
                      <Button isIconOnly variant="light" size="sm">
                        <MoreHorizontal size={20} />
                      </Button>
                    </DropdownTrigger>                    <DropdownMenu aria-label="Hành động bài viết">
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
                    </DropdownMenu>
                  </Dropdown>
                </div>
                
                <div className="mt-3">
                  <p className="text-sm">{post.content}</p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-1">
                      <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        onClick={handleLike}
                        className={isLiked ? "text-blue-500" : ""}
                        disabled={loading}
                      >
                        <UpvoteArrow filled={isLiked} />
                      </Button>
                      <span className="text-sm">{likeCount}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        onClick={handleDislike}
                        className={isDisliked ? "text-red-500" : ""}
                        disabled={loading}
                      >
                        <DownvoteArrow filled={isDisliked} />
                      </Button>
                      <span className="text-sm">{dislikeCount}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <MessageCircle size={16} />
                      <span className="text-sm">{commentCount}</span>
                    </div>
                  </div>
                </div>              </div>

              {/* Comments section - Fixed height with scroll */}
              <div className="h-96 overflow-y-auto border-t border-gray-200 dark:border-gray-700">
                <CommentSection
                  postId={post.id}
                  commentsCount={commentCount}
                  onCommentsCountChange={handleCommentsCountChange}
                />
              </div>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
