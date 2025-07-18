"use client";
import React, { useState } from "react";
import { Card, CardBody, Avatar, Button, Textarea, Select, SelectItem } from "@nextui-org/react";
import { Image as ImageIcon, Smile } from "react-feather";
import MediaUpload from "./MediaUpload";
import ProfanityWarningModal from "./ProfanityWarningModal";
import { PostService } from "@/services";
import LocationService, { Location } from "@/services/LocationService";
import PostTypeService, { PostType } from "@/services/PostTypeService";
import { AuthService } from "@/services";
import ProfanityService from "@/services/ProfanityService";
import { avatarBase64 } from "@/static/images/avatarDefault";

interface CreatePostFormProps {
  onPostCreated?: (post: any) => void;
  refreshPageAfterPost?: boolean;
}

interface UserData {
  id: number;
  username: string;
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  dateOfBirth?: string;
}

export default function CreatePostForm({ onPostCreated, refreshPageAfterPost = false }: CreatePostFormProps) {  
  const [content, setContent] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [selectedPostTypeId, setSelectedPostTypeId] = useState<number | null>(2); // Default to 'scenic'
  const [locations, setLocations] = useState<Location[]>([]);
  const [postTypes, setPostTypes] = useState<PostType[]>([]);
  const [showMediaUpload, setShowMediaUpload] = useState(false);  
  const [isSubmitting, setIsSubmitting] = useState(false);  
  const [locationsLoaded, setLocationsLoaded] = useState(false);
  const [postTypesLoaded, setPostTypesLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  
  // Profanity detection states
  const [showProfanityWarning, setShowProfanityWarning] = useState(false);
  const [profanityResult, setProfanityResult] = useState<any>(null);const loadLocations = async () => {
    if (!locationsLoaded) {
      try {
        console.log('Loading locations...');
        const locationData = await LocationService.getAllLocations();
        console.log('Locations loaded:', locationData);
        setLocations(locationData);
        setLocationsLoaded(true);
      } catch (error) {
        console.error('Failed to load locations:', error);
        console.error('Error details:', error);
      }
    }
  };  const loadPostTypes = async () => {
    if (!postTypesLoaded) {
      try {
        console.log('Loading post types...');
        const postTypeData = await PostTypeService.getAllPostTypes();
        console.log('Post types loaded:', postTypeData);
        setPostTypes(postTypeData);
        setPostTypesLoaded(true);
      } catch (error) {
        console.error('Failed to load post types:', error);
        console.error('Error details:', error);
      }
    }
  };
  const loadCurrentUser = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to load current user:', error);
    }
  };

  // Load locations, post types, and current user when component mounts
  React.useEffect(() => {
    loadLocations();
    loadPostTypes();
    loadCurrentUser();
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && mediaUrls.length === 0) return;
    if (!selectedLocationId) {
      alert('Vui lòng chọn địa điểm cho bài viết của bạn');
      return;
    }
    if (!selectedPostTypeId) {
      alert('Vui lòng chọn loại bài viết');
      return;
    }

    setIsSubmitting(true);    try {
      const postData = {
        content,
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
        locationId: selectedLocationId,
        typeId: selectedPostTypeId
      };

      const newPost = await PostService.createPost(postData);

      // Call the callback if provided
      if (onPostCreated) {
        onPostCreated(newPost);
      }

      // Refresh page if requested
      if (refreshPageAfterPost) {
        window.location.reload();
        return; // Exit early as page will reload
      }

      // Reset form
      setContent("");
      setMediaUrls([]);
      setSelectedLocationId(null);
      setShowMediaUpload(false);    } catch (error: any) {
      console.error("Failed to create post:", error);
        // Try to parse the error message if it's a JSON string
      let errorData: any = null;
      const errorMessage = error?.message || '';
      
      // Check if error message is a JSON string (from backend)
      try {
        if (typeof errorMessage === 'string' && errorMessage.startsWith('{')) {
          errorData = JSON.parse(errorMessage);
        } else {
          // Check if it's nested in response
          errorData = error?.response?.data;
        }
      } catch (parseError) {
        console.error("Error parsing error data:", parseError);
        errorData = error?.response?.data;
      }
      
      // Check if it's a profanity error
      if (errorData?.isProfanityError === true || 
          errorData?.error === 'PROFANITY_DETECTED' ||
          ProfanityService.isProfanityError(errorData?.message || errorMessage)) {
        
        console.log("Profanity detected, showing modal with data:", errorData);
        
        // Show profanity warning modal with backend data
        setProfanityResult({
          is_profane: true,
          confidence: errorData?.confidence || 0.8,
          toxic_spans: errorData?.toxicSpans || [],
          processed_text: content
        });
        setShowProfanityWarning(true);
      } else {
        // Show appropriate error message
        const displayMessage = errorData?.message || errorMessage || 'Không thể tạo bài viết. Vui lòng thử lại.';
        alert(displayMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfanityEdit = () => {
    setShowProfanityWarning(false);
    // Keep the content so user can edit it
    // Focus back to textarea would be nice but we'll keep it simple
  };

  const handleProfanityCancel = () => {
    setShowProfanityWarning(false);
    setProfanityResult(null);
    // Optionally clear content
    setContent("");
  };
  
  const handleMediaUploadComplete = (urls: string[]) => {
    setMediaUrls(urls);
    setShowMediaUpload(false);
  };

  return (
    <Card className="mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm dark:shadow-lg">
      <CardBody>        <form onSubmit={handleSubmit}>
          <div className="flex gap-3">
            <Avatar 
              radius="full" 
              size="md" 
              src={currentUser?.profilePicture || avatarBase64}
            />            <Textarea
              placeholder="Bạn đang nghĩ gì?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              fullWidth
              minRows={1}
              maxRows={5}
              variant="bordered"
              classNames={{
                input: "text-sm",
                inputWrapper: "bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-500 hover:border-gray-400 dark:hover:border-gray-400 focus-within:border-primary-500 dark:focus-within:border-primary-400",
                label: "text-gray-700 dark:text-gray-300"
              }}
            /></div>

          {showMediaUpload && (
            <div className="mt-4">
              <MediaUpload
                type="post"
                onUploadComplete={handleMediaUploadComplete}
                maxFiles={4}
                allowVideo={true}
              />
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Chọn địa điểm"
              placeholder="Bài viết này về địa điểm nào?"
              selectedKeys={selectedLocationId ? [selectedLocationId.toString()] : []}
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0];
                setSelectedLocationId(selectedKey ? Number(selectedKey) : null);
              }}
              className="w-full"
              size="sm"
              isRequired
              classNames={{
                trigger: "bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-500 hover:border-gray-400 dark:hover:border-gray-400 focus:border-primary-500 dark:focus:border-primary-400",
                label: "text-gray-700 dark:text-gray-300",
                value: "text-gray-900 dark:text-gray-100"
              }}
              items={locations.map(location => ({
                key: location.id.toString(),
                label: location.location
              }))}
            >
              {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
            </Select>

            <Select
              label="Loại bài viết"
              placeholder="Chọn loại bài viết"
              selectedKeys={selectedPostTypeId ? [selectedPostTypeId.toString()] : []}
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0];
                setSelectedPostTypeId(selectedKey ? Number(selectedKey) : null);
              }}
              className="w-full"
              size="sm"
              isRequired
              classNames={{
                trigger: "bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-500 hover:border-gray-400 dark:hover:border-gray-400 focus:border-primary-500 dark:focus:border-primary-400",
                label: "text-gray-700 dark:text-gray-300",
                value: "text-gray-900 dark:text-gray-100"
              }}
              items={postTypes.map(postType => ({
                key: postType.id.toString(),
                label: postType.typeName === 'info' ? 'Thông tin' :
                       postType.typeName === 'scenic' ? 'Cảnh đẹp' :
                       postType.typeName === 'discussion' ? 'Thảo luận' : postType.typeName
              }))}
            >
              {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
            </Select>
          </div>
          
          {mediaUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              {mediaUrls.map((url, index) => (
                <div key={index} className="relative">                  <img 
                    src={url} 
                    alt={`Hình ảnh bài viết ${index + 1}`}
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
            <div className="flex justify-between mt-4">            <div className="flex gap-2">
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
            </div>
              <Button 
              color="primary" 
              size="sm" 
              type="submit" 
              isDisabled={!content.trim() || !selectedLocationId}
              isLoading={isSubmitting}
            >
              Đăng bài
            </Button>
          </div>
        </form>
      </CardBody>
      
      {/* Profanity Warning Modal */}
      <ProfanityWarningModal
        isOpen={showProfanityWarning}
        onClose={handleProfanityCancel}
        onEdit={handleProfanityEdit}
        content={content}
        toxicSpans={profanityResult?.toxic_spans || []}
        confidence={profanityResult?.confidence || 0}
        type="post"
      />
    </Card>
  );
}
