"use client";
import React, { useState } from "react";
import { Card, CardBody, Avatar, Button, Textarea } from "@nextui-org/react";
import { Image as ImageIcon, Smile, MapPin } from "react-feather";
import MediaUpload from "./MediaUpload";
import { PostService } from "@/services";

interface CreatePostFormProps {
  onPostCreated?: (post: any) => void;
}

export default function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const [content, setContent] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && mediaUrls.length === 0) return;
    
    setIsSubmitting(true);
    
    try {
      const postData = {
        content,
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined
      };

      const newPost = await PostService.createPost(postData);
      
      // Call the callback if provided
      if (onPostCreated) {
        onPostCreated(newPost);
      }

      // Reset form
      setContent("");
      setMediaUrls([]);
      setShowMediaUpload(false);
    } catch (error) {
      console.error("Failed to create post:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleMediaUploadComplete = (urls: string[]) => {
    setMediaUrls(urls);
    setShowMediaUpload(false);
  };

  return (
    <Card className="mb-4 border border-gray-200 dark:border-gray-700">
      <CardBody>
        <form onSubmit={handleSubmit}>
          <div className="flex gap-3">
            <Avatar radius="full" size="md" src="https://i.pravatar.cc/150?u=example" />
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              fullWidth
              minRows={1}
              maxRows={5}
              variant="bordered"
              classNames={{
                input: "text-sm",
              }}
            />
          </div>
            {showMediaUpload && (
            <div className="mt-4">
              <MediaUpload 
                type="post" 
                onUploadComplete={handleMediaUploadComplete} 
                maxFiles={4} 
              />
            </div>
          )}
          
          {mediaUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              {mediaUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img 
                    src={url} 
                    alt={`Post media ${index + 1}`}
                    className="rounded object-cover w-full h-32"
                  />
                  <Button
                    size="sm"
                    color="danger"
                    variant="flat"
                    isIconOnly
                    className="absolute top-1 right-1"
                    onClick={() => setMediaUrls(mediaUrls.filter((_, i) => i !== index))}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-between mt-4">
            <div className="flex gap-2">
              <Button 
                variant="light" 
                size="sm" 
                isIconOnly
                onClick={() => setShowMediaUpload(!showMediaUpload)}
                className={showMediaUpload ? "text-primary" : ""}
              >
                <ImageIcon size={18} />
              </Button>
              <Button variant="light" size="sm" isIconOnly>
                <Smile size={18} />
              </Button>
              <Button variant="light" size="sm" isIconOnly>
                <MapPin size={18} />
              </Button>
            </div>
            
            <Button 
              color="primary" 
              size="sm" 
              type="submit" 
              isDisabled={!content.trim()}
              isLoading={isSubmitting}
            >
              Post
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
