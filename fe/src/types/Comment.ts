export interface Comment {
  id: string;
  content: string;
  authorName: string;
  authorUsername: string;
  authorAvatar?: string;
  likes: number;
  dislikes: number;
  liked?: boolean;
  disliked?: boolean;
  totalReactions?: number;
  userReaction?: {
    id: number;
    reactionTypeId: number;
  } | null;
  createdAt: Date;
  replies?: Comment[];
  parentId?: string;
}

export interface CommentReply {
  id: string;
  content: string;
  authorName: string;
  authorUsername: string;
  authorAvatar?: string;
  likes: number;
  dislikes: number;
  liked?: boolean;
  disliked?: boolean;
  totalReactions?: number;
  userReaction?: {
    id: number;
    reactionTypeId: number;
  } | null;
  createdAt: Date;
  parentId: string;
}