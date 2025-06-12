"use client";
import React, { useState } from 'react';
import { Avatar, Button, Textarea, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { MoreHorizontal, MessageCircle, Trash2, Flag, Edit3 } from 'react-feather';
import { UpvoteArrow, DownvoteArrow } from './VoteArrows';
import { Comment } from '@/types/Comment';
import { avatarBase64 } from '@/static/images/avatarDefault';
import { useProfileNavigation } from '@/utils/profileNavigation';

interface CommentItemProps {
  comment: Comment;
  onReply?: (commentId: string, content: string) => void;
  onLike?: (commentId: string) => void;
  onDislike?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  onReport?: (commentId: string) => void;
  onEdit?: (commentId: string, newContent: string) => void;
  currentUser?: any;
  level?: number; // For nested comments
}

export default function CommentItem({
  comment,
  onReply,
  onLike,
  onDislike,
  onDelete,
  onReport,
  onEdit,
  currentUser,
  level = 0
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { navigateToProfile } = useProfileNavigation();

  const getAvatarSrc = () => {
    if (comment.authorAvatar && comment.authorAvatar.trim() !== '') {
      return comment.authorAvatar;
    }
    return avatarBase64;
  };

  const handleAvatarClick = () => {
    if (currentUser && currentUser.username === comment.authorUsername) {
      return;
    }
    navigateToProfile(comment.authorUsername);
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim() || loading) return;
    
    setLoading(true);
    try {
      await onReply?.(comment.id, replyContent);
      setReplyContent('');
      setShowReplyForm(false);
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = () => {
    onLike?.(comment.id);
  };

  const handleDislike = () => {
    onDislike?.(comment.id);
  };

  return (
    <div className={`border-l-2 border-gray-100 ${level > 0 ? 'ml-6 pl-4' : 'pl-4'} py-3`}>
      <div className="flex gap-3">
        <Avatar 
          radius="full" 
          size="sm" 
          src={getAvatarSrc()}
          className="cursor-pointer hover:scale-105 transition-transform flex-shrink-0"
          onClick={handleAvatarClick}
        />
        <div className="flex-1 min-w-0">
          {/* Comment Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-default-700">{comment.authorName}</span>
            <span className="text-xs text-default-400">@{comment.authorUsername}</span>
            <span className="text-xs text-default-400">•</span>
            <span className="text-xs text-default-400">
              {formatDistanceToNow(comment.createdAt, { addSuffix: true, locale: vi })}
            </span>
          </div>

          {/* Comment Content */}
          <div className="text-sm text-default-800 mb-2">
            {comment.content}
          </div>

          {/* Comment Actions */}          <div className="flex items-center gap-4">            <div className="flex items-center gap-1">
              <Button 
                isIconOnly 
                size="sm" 
                variant="light" 
                onClick={handleLike}
                className="text-default-400 hover:bg-gray-50 dark:hover:bg-gray-800/20"
              >
                <UpvoteArrow 
                  size={12} 
                  filled={comment.liked}
                  className={comment.liked ? 'text-green-600' : ''} 
                />
              </Button>
              <span className="text-xs text-default-400">{comment.likes}</span>
            </div>

            <div className="flex items-center gap-1">
              <Button 
                isIconOnly 
                size="sm" 
                variant="light" 
                onClick={handleDislike}
                className="text-default-400 hover:bg-gray-50 dark:hover:bg-gray-800/20"
              >
                <DownvoteArrow 
                  size={12} 
                  filled={comment.disliked}
                  className={comment.disliked ? 'text-red-600' : ''} 
                />
              </Button>
              <span className="text-xs text-default-400">{comment.dislikes}</span>
            </div>

            <Button 
              size="sm" 
              variant="light" 
              onClick={() => setShowReplyForm(!showReplyForm)}
              startContent={<MessageCircle size={14} />}
              className="text-default-400 text-xs"
            >
              Trả lời
            </Button>

            {/* More Options Dropdown */}
            <Dropdown>
              <DropdownTrigger>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  className="text-default-400"
                >
                  <MoreHorizontal size={14} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Comment actions">
                {/* Show edit and delete options only for comment owner */}
                {currentUser && currentUser.username === comment.authorUsername && (
                  <>
                    <DropdownItem
                      key="edit"
                      startContent={<Edit3 size={14} />}
                      onClick={() => onEdit?.(comment.id, comment.content)}
                    >
                      Chỉnh sửa
                    </DropdownItem>
                    <DropdownItem
                      key="delete"
                      className="text-danger"
                      color="danger"
                      startContent={<Trash2 size={14} />}
                      onClick={() => onDelete?.(comment.id)}
                    >
                      Xóa bình luận
                    </DropdownItem>
                  </>
                )}

                {/* Show report option for others */}
                {currentUser && currentUser.username !== comment.authorUsername && (
                  <DropdownItem
                    key="report"
                    startContent={<Flag size={14} />}
                    onClick={() => onReport?.(comment.id)}
                  >
                    Báo cáo bình luận
                  </DropdownItem>
                )}
              </DropdownMenu>
            </Dropdown>
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-3 space-y-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Viết phản hồi..."
                minRows={2}
                maxRows={4}
                className="w-full"
              />
              <div className="flex gap-2 justify-end">
                <Button 
                  size="sm" 
                  variant="light" 
                  onClick={() => setShowReplyForm(false)}
                >
                  Hủy
                </Button>
                <Button 
                  size="sm" 
                  color="primary"
                  onClick={handleReplySubmit}
                  isLoading={loading}
                  isDisabled={!replyContent.trim()}
                >
                  Trả lời
                </Button>
              </div>
            </div>
          )}

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  onLike={onLike}
                  onDislike={onDislike}
                  onDelete={onDelete}
                  onReport={onReport}
                  onEdit={onEdit}
                  currentUser={currentUser}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}