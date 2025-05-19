"use client";
import React, { useState } from "react";
import { Card, CardBody, Avatar, Button, Textarea } from "@nextui-org/react";
import { Image, Smile, MapPin } from "react-feather";

export default function CreatePostForm() {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    // In a real app, this would call an API
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Post created:", content);
      setContent("");
      setIsSubmitting(false);
    }, 1000);
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
          
          <div className="flex justify-between mt-4">
            <div className="flex gap-2">
              <Button variant="light" size="sm" isIconOnly>
                <Image size={18} />
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
