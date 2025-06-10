"use client";
import React, { useState, useEffect } from 'react';
import { Button, Textarea, Avatar, Card, CardBody, Divider } from '@nextui-org/react';
import { Send } from 'react-feather';
import CommentItem from './CommentItem';
import { Comment } from '@/types/Comment';
import { avatarBase64 } from '@/static/images/avatarDefault';
import { CommentService } from '@/services';
import { AuthService } from '@/services';
import CommentReactionService from '@/services/CommentReactionService';

interface CommentSectionProps {
  postId: string;
  commentsCount: number;
  onCommentsCountChange?: (count: number) => void;
}

export default function CommentSection({ 
  postId, 
  commentsCount, 
  onCommentsCountChange 
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await AuthService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error getting current user:', error);
      }
    };
    getCurrentUser();
    loadComments();
  }, [postId]);  // Recursive function to transform replies at any nesting level
  const transformRepliesRecursively = async (replies: any[], parentId: string): Promise<Comment[]> => {
    if (!replies || replies.length === 0) return [];

    return await Promise.all(
      replies.map(async (reply: any) => {
        const replyId = parseInt(reply.id);
        const [replyLikeCount, replyDislikeCount, replyUserReaction] = await Promise.all([
          CommentReactionService.getReactionCountByType(replyId, 1),
          CommentReactionService.getReactionCountByType(replyId, 2),
          CommentReactionService.getUserReactionForComment(replyId).catch(() => null)
        ]);

        // Recursively transform nested replies
        const nestedReplies = await transformRepliesRecursively(reply.replies || [], reply.id.toString());        return {
          id: reply.id.toString(),
          content: reply.text,
          authorName: reply.author?.displayName || reply.author?.username || 'Người dùng không xác định',
          authorUsername: reply.author?.username || 'không xác định',
          authorAvatar: reply.author?.profilePicture || "",
          likes: replyLikeCount,
          dislikes: replyDislikeCount,
          liked: replyUserReaction?.reactionTypeId === 1,
          disliked: replyUserReaction?.reactionTypeId === 2,
          userReaction: replyUserReaction,
          createdAt: new Date(reply.createdDate),
          parentId: parentId,
          replies: nestedReplies
        };
      })
    );
  };

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const postIdNum = parseInt(postId);
      const fetchedComments = await CommentService.getCommentsByPostId(postIdNum);

      // Transform API response to match our Comment interface
      const transformedComments: Comment[] = await Promise.all(
        fetchedComments.map(async (apiComment: any) => {
          const commentId = parseInt(apiComment.id);
          
          // Load reaction counts and user reaction
          const [likeCount, dislikeCount, userReaction] = await Promise.all([
            CommentReactionService.getReactionCountByType(commentId, 1), // Like = 1
            CommentReactionService.getReactionCountByType(commentId, 2), // Dislike = 2
            CommentReactionService.getUserReactionForComment(commentId).catch(() => null)
          ]);

          // Use the recursive function to transform all nested replies
          const transformedReplies = await transformRepliesRecursively(apiComment.replies || [], apiComment.id.toString());

          return {
            id: apiComment.id.toString(),            content: apiComment.text, // API uses 'text' field
            authorName: apiComment.author?.displayName || apiComment.author?.username || 'Người dùng không xác định',
            authorUsername: apiComment.author?.username || 'không xác định',
            authorAvatar: apiComment.author?.profilePicture || "",
            likes: likeCount,
            dislikes: dislikeCount,
            liked: userReaction?.reactionTypeId === 1,
            disliked: userReaction?.reactionTypeId === 2,
            userReaction: userReaction,
            createdAt: new Date(apiComment.createdDate),
            replies: transformedReplies
          };
        })
      );
      
      setComments(transformedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      // Fallback to empty array on error
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };const handleSubmitComment = async () => {
    if (!newComment.trim() || loading || !currentUser) return;
    
    setLoading(true);
    try {
      const postIdNum = parseInt(postId);
      const commentData = {
        postId: postIdNum,
        content: newComment,
      };

      const createdComment = await CommentService.createComment(commentData);      // Transform API response to match our Comment interface
      const newCommentObj: Comment = {
        id: createdComment.id.toString(),
        content: (createdComment as any).text, // API uses 'text' field
        authorName: (createdComment as any).author?.displayName || (createdComment as any).author?.username || currentUser.username,
        authorUsername: (createdComment as any).author?.username || currentUser.username,
        authorAvatar: (createdComment as any).author?.profilePicture || currentUser.avatar || "",
        likes: 0,
        dislikes: 0,
        liked: false,
        disliked: false,
        createdAt: new Date((createdComment as any).createdDate),
        replies: []
      };

      setComments(prev => [newCommentObj, ...prev]);
      setNewComment('');
      onCommentsCountChange?.(commentsCount + 1);
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setLoading(false);
    }
  };  const handleReply = async (commentId: string, content: string) => {
    try {
      if (!currentUser) return;
      
      const commentIdNum = parseInt(commentId);
      const replyData = {
        commentId: commentIdNum,
        content: content,
      };

      const createdReply = await CommentService.createCommentReply(replyData);
      
      // Transform API response to match our Comment interface
      const newReply: Comment = {
        id: createdReply.id.toString(),
        content: (createdReply as any).text, // API uses 'text' field
        authorName: (createdReply as any).author?.displayName || (createdReply as any).author?.username || currentUser.username,
        authorUsername: (createdReply as any).author?.username || currentUser.username,
        authorAvatar: (createdReply as any).author?.profilePicture || currentUser.avatar || "",
        likes: 0,
        dislikes: 0,
        liked: false,
        disliked: false,
        createdAt: new Date((createdReply as any).createdDate),
        parentId: commentId
      };

      // Recursive function to find and update the comment (including nested replies)
      const addReplyToComment = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            // Found the target comment, add the reply
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply]
            };
          } else if (comment.replies && comment.replies.length > 0) {
            // Search in nested replies
            return {
              ...comment,
              replies: addReplyToComment(comment.replies)
            };
          }
          return comment;
        });
      };

      setComments(prev => addReplyToComment(prev));
      onCommentsCountChange?.(commentsCount + 1);
    } catch (error) {
      console.error('Error submitting reply:', error);
    }
  };const handleLikeComment = async (commentId: string) => {
    try {
      const commentIdNum = parseInt(commentId);
      
      // Recursive function to find comment or reply
      const findComment = (comments: Comment[]): Comment | null => {
        for (const comment of comments) {
          if (comment.id === commentId) {
            return comment;
          }
          if (comment.replies) {
            const found = findComment(comment.replies);
            if (found) return found;
          }
        }
        return null;
      };
      
      const currentComment = findComment(comments);
      const wasLiked = currentComment?.liked || false;
      const wasDisliked = currentComment?.disliked || false;
      
      // Recursive function to update comment or reply
      const updateComment = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              liked: !wasLiked,
              disliked: !wasLiked ? false : wasDisliked,
              likes: !wasLiked ? comment.likes + 1 : comment.likes - 1,
              dislikes: !wasLiked && wasDisliked ? comment.dislikes - 1 : comment.dislikes
            };
          } else if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateComment(comment.replies)
            };
          }
          return comment;
        });
      };
      
      // Optimistic update
      setComments(prev => updateComment(prev));

      // API call
      if (wasLiked) {
        await CommentReactionService.removeReaction(commentIdNum);
      } else {
        await CommentReactionService.addReaction(commentIdNum, 1);
      }
    } catch (error) {
      console.error('Error liking comment:', error);
      // Revert optimistic update on error
      loadComments();
    }
  };
  const handleDislikeComment = async (commentId: string) => {
    try {
      const commentIdNum = parseInt(commentId);
      
      // Recursive function to find comment or reply
      const findComment = (comments: Comment[]): Comment | null => {
        for (const comment of comments) {
          if (comment.id === commentId) {
            return comment;
          }
          if (comment.replies) {
            const found = findComment(comment.replies);
            if (found) return found;
          }
        }
        return null;
      };
      
      const currentComment = findComment(comments);
      const wasDisliked = currentComment?.disliked || false;
      const wasLiked = currentComment?.liked || false;
      
      // Recursive function to update comment or reply
      const updateComment = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              disliked: !wasDisliked,
              liked: !wasDisliked ? false : wasLiked,
              dislikes: !wasDisliked ? comment.dislikes + 1 : comment.dislikes - 1,
              likes: !wasDisliked && wasLiked ? comment.likes - 1 : comment.likes
            };
          } else if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateComment(comment.replies)
            };
          }
          return comment;
        });
      };
      
      // Optimistic update
      setComments(prev => updateComment(prev));

      // API call
      if (wasDisliked) {
        await CommentReactionService.removeReaction(commentIdNum);
      } else {
        await CommentReactionService.addReaction(commentIdNum, 2);
      }
    } catch (error) {
      console.error('Error disliking comment:', error);
      // Revert optimistic update on error
      loadComments();
    }
  };

  const getUserAvatarSrc = () => {
    if (currentUser?.avatar && currentUser.avatar.trim() !== '') {
      return currentUser.avatar;
    }
    return avatarBase64;
  };

  return (
    <Card className="mt-4">
      <CardBody className="p-4">
        <h3 className="text-lg font-semibold mb-4">
          Bình luận ({comments.length})
        </h3>

        {/* New Comment Form */}
        <div className="flex gap-3 mb-6">
          <Avatar 
            radius="full" 
            size="sm" 
            src={getUserAvatarSrc()}
            className="flex-shrink-0"
          />
          <div className="flex-1 space-y-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Viết bình luận..."
              minRows={2}
              maxRows={4}
              className="w-full"
            />
            <div className="flex justify-end">
              <Button 
                color="primary"
                size="sm"
                onClick={handleSubmitComment}
                isLoading={loading}
                isDisabled={!newComment.trim()}
                startContent={!loading && <Send size={14} />}
              >
                Đăng
              </Button>
            </div>
          </div>
        </div>

        <Divider className="mb-4" />

        {/* Comments List */}
        {loadingComments ? (
          <div className="text-center py-8 text-default-400">
            Đang tải bình luận...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-default-400">
            Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={handleReply}
                onLike={handleLikeComment}
                onDislike={handleDislikeComment}
                currentUser={currentUser}
              />
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}