"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Heart, MessageCircle, Share, MoreHorizontal } from "react-feather";
import { Card, CardHeader, CardBody, CardFooter, Avatar, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { formatDistanceToNow } from "date-fns";

interface PostProps {
  id: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: Date;
  liked?: boolean;
}

export default function Post({
  id,
  authorName,
  authorUsername,
  authorAvatar,
  content,
  image,
  likes,
  comments,
  shares,
  createdAt,
  liked = false
}: PostProps) {
  const [isLiked, setIsLiked] = useState(liked);
  const [likeCount, setLikeCount] = useState(likes);
  
  const handleLike = () => {
    if (isLiked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
  };

  return (
    <Card className="mb-4 border border-gray-200 dark:border-gray-700">
      <CardHeader className="justify-between">
        <div className="flex gap-3">
          <Avatar radius="full" size="md" src={authorAvatar} />
          <div className="flex flex-col items-start justify-center">
            <h4 className="text-sm font-semibold leading-none text-default-600">{authorName}</h4>
            <p className="text-xs text-default-400">@{authorUsername}</p>
          </div>
        </div>
        <Dropdown>
          <DropdownTrigger>
            <Button isIconOnly variant="light" size="sm">
              <MoreHorizontal size={20} />
            </Button>
          </DropdownTrigger>          <DropdownMenu aria-label="Post actions">
            <DropdownItem key="save">Save post</DropdownItem>
            <DropdownItem key="report">Report</DropdownItem>
            <DropdownItem key="hide">Hide</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </CardHeader>

      <CardBody className="px-3 py-0 text-sm">
        <p>{content}</p>
        {image && (
          <div className="mt-3">
            <img 
              src={image} 
              alt="Post content" 
              className="rounded-lg w-full object-cover max-h-96"
            />
          </div>
        )}
      </CardBody>

      <CardFooter className="gap-3">
        <div className="flex gap-1 items-center">
          <Button 
            isIconOnly 
            size="sm" 
            variant="light" 
            onClick={handleLike}
            className={isLiked ? "text-red-500" : ""}
          >
            <Heart 
              size={18} 
              className={isLiked ? "fill-current text-red-500" : ""} 
            />
          </Button>
          <span className="text-default-400 text-xs">{likeCount}</span>
        </div>

        <div className="flex gap-1 items-center">
          <Button isIconOnly size="sm" variant="light">
            <MessageCircle size={18} />
          </Button>
          <span className="text-default-400 text-xs">{comments}</span>
        </div>

        <div className="flex gap-1 items-center">
          <Button isIconOnly size="sm" variant="light">
            <Share size={18} />
          </Button>
          <span className="text-default-400 text-xs">{shares}</span>
        </div>

        <div className="ml-auto">
          <span className="text-default-400 text-xs">
            {formatDistanceToNow(createdAt, { addSuffix: true })}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
