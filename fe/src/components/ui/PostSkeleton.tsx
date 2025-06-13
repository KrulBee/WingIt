import React from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '@nextui-org/react';

const PostSkeleton: React.FC = () => {
  return (
    <Card className="wingit-card mb-6">
      <CardHeader className="justify-between pb-3">
        <div className="flex gap-3 w-full">
          {/* Avatar skeleton */}
          <div className="w-12 h-12 bg-gray-200 dark:bg-dark-700 rounded-full shimmer"></div>
          
          <div className="flex flex-col gap-2 flex-1">
            {/* Name skeleton */}
            <div className="h-4 bg-gray-200 dark:bg-dark-700 rounded-md w-32 shimmer"></div>
            {/* Username skeleton */}
            <div className="h-3 bg-gray-200 dark:bg-dark-700 rounded-md w-24 shimmer"></div>
          </div>
        </div>
        
        {/* Menu button skeleton */}
        <div className="w-8 h-8 bg-gray-200 dark:bg-dark-700 rounded-full shimmer"></div>
      </CardHeader>

      <CardBody className="px-6 py-0">
        {/* Content skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 dark:bg-dark-700 rounded-md w-full shimmer"></div>
          <div className="h-4 bg-gray-200 dark:bg-dark-700 rounded-md w-4/5 shimmer"></div>
          <div className="h-4 bg-gray-200 dark:bg-dark-700 rounded-md w-3/5 shimmer"></div>
        </div>
        
        {/* Image skeleton */}
        <div className="h-64 bg-gray-200 dark:bg-dark-700 rounded-lg mb-4 shimmer"></div>
        
        {/* Timestamp skeleton */}
        <div className="h-3 bg-gray-200 dark:bg-dark-700 rounded-md w-20 shimmer"></div>
      </CardBody>

      <CardFooter className="gap-3 pt-3">
        <div className="flex items-center justify-between w-full">
          {/* Action buttons skeleton */}
          <div className="flex items-center gap-6">
            {/* Like button */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 dark:bg-dark-700 rounded-full shimmer"></div>
              <div className="h-4 bg-gray-200 dark:bg-dark-700 rounded-md w-6 shimmer"></div>
            </div>
            
            {/* Dislike button */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 dark:bg-dark-700 rounded-full shimmer"></div>
              <div className="h-4 bg-gray-200 dark:bg-dark-700 rounded-md w-6 shimmer"></div>
            </div>
          </div>
          
          {/* Comment button */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 dark:bg-dark-700 rounded-full shimmer"></div>
            <div className="h-4 bg-gray-200 dark:bg-dark-700 rounded-md w-6 shimmer"></div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

// Multiple skeleton posts component
interface PostSkeletonListProps {
  count?: number;
}

export const PostSkeletonList: React.FC<PostSkeletonListProps> = ({ count = 3 }) => {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }, (_, index) => (
        <PostSkeleton key={index} />
      ))}
    </div>
  );
};

export default PostSkeleton;
