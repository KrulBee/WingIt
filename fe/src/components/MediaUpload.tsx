import { useRef, useState } from 'react';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { useDisclosure } from '@nextui-org/react';
import Image from 'next/image';
import ImageCropModal from './ImageCropModal';

type MediaUploadProps = {
  onUploadComplete: (urls: string[]) => void;
  type: 'post' | 'profile' | 'cover';
  maxFiles?: number;
  enableCropping?: boolean;
  allowVideo?: boolean;
};

export default function MediaUpload({ onUploadComplete, type, maxFiles = 4, enableCropping = false, allowVideo = false }: MediaUploadProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [fileTypes, setFileTypes] = useState<string[]>([]); // Track file types
  const [selectedImageForCrop, setSelectedImageForCrop] = useState<string>('');
  const [croppedFiles, setCroppedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadMedia, isLoading, error } = useMediaUpload();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const selectedFiles = Array.from(e.target.files);

    // Check file sizes before processing
    for (const file of selectedFiles) {
      const fileSizeMB = Math.round(file.size / 1024 / 1024);
      if (file.size > 50 * 1024 * 1024) { // 50MB
        alert(`${file.type.startsWith('video/') ? 'Video' : 'Ảnh'} "${file.name}" quá lớn (${fileSizeMB}MB). Hãy chọn file dưới 50MB.`);
        return;
      }
      if (file.size > 30 * 1024 * 1024 && file.type.startsWith('video/')) { // 30MB warning for videos
        if (!confirm(`Video "${file.name}" khá lớn (${fileSizeMB}MB). Có thể tải lên chậm. Bạn có muốn tiếp tục?`)) {
          return;
        }
      }
    }

    const newFiles = type === 'profile' || type === 'cover'
      ? [selectedFiles[0]] // Only take one file for profile pictures and cover photos
      : files.length + selectedFiles.length > maxFiles
        ? selectedFiles.slice(0, maxFiles - files.length)
        : selectedFiles;

    // If cropping is enabled and it's a profile or cover photo, show crop modal (only for images)
    if (enableCropping && (type === 'profile' || type === 'cover') && newFiles.length > 0 && newFiles[0].type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(newFiles[0]);
      setSelectedImageForCrop(imageUrl);
      onOpen();
      return;
    }

    // Create object URLs for previews
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    const newFileTypes = newFiles.map(file => file.type);

    setFiles(prevFiles => [...prevFiles, ...newFiles]);
    setPreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
    setFileTypes(prevTypes => [...prevTypes, ...newFileTypes]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = async (croppedImageUrl: string) => {
    // Convert the cropped image data URL to a File
    const response = await fetch(croppedImageUrl);
    const blob = await response.blob();
    const fileName = `cropped_${type}_${Date.now()}.jpg`;
    const croppedFile = new File([blob], fileName, { type: 'image/jpeg' });
    
    // Clear existing files and previews for profile/cover (single file)
    previews.forEach(preview => URL.revokeObjectURL(preview));
    
    setFiles([croppedFile]);
    setPreviews([croppedImageUrl]);
    setCroppedFiles([croppedFile]);
    
    // Clean up the original image URL
    URL.revokeObjectURL(selectedImageForCrop);
    setSelectedImageForCrop('');
  };
  const removeFile = (index: number) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(previews[index]);

    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setPreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index));
    setFileTypes(prevTypes => prevTypes.filter((_, i) => i !== index));
    setCroppedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    const urls = await uploadMedia(files, type);
    if (urls.length > 0) {
      onUploadComplete(urls);
      
      // Clear all previews and files after successful upload
      previews.forEach(preview => URL.revokeObjectURL(preview));
      setPreviews([]);
      setFiles([]);
      setFileTypes([]);
      setCroppedFiles([]);
    }
  };
  const getButtonText = () => {
    switch (type) {
      case 'profile':
        return 'Chọn ảnh đại diện';
      case 'cover':
        return 'Chọn ảnh bìa';
      default:
        return allowVideo ? 'Thêm ảnh/video' : 'Thêm ảnh';
    }
  };

  const getAspectRatio = () => {
    switch (type) {
      case 'profile':
        return 1; // 1:1 square aspect ratio
      case 'cover':
        return 16 / 9; // 16:9 aspect ratio for cover photos
      default:
        return undefined;
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center mb-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={(type === 'profile' || type === 'cover') ? previews.length > 0 : previews.length >= maxFiles}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          {getButtonText()}
        </button>
        {previews.length > 0 && (
          <button
            type="button"
            onClick={handleUpload}
            disabled={isLoading}
            className="ml-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
          >
            {isLoading ? 'Đang tải lên...' : 'Tải lên'}
          </button>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept={allowVideo ? "image/*,video/*" : "image/*"}
        onChange={handleFileChange}
        className="hidden"
        multiple={type === 'post'}
      />
      
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
      
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
          {previews.map((preview, index) => (
            <div key={index} className="relative">
              {fileTypes[index]?.startsWith('video/') ? (
                <video
                  src={preview}
                  className={`rounded object-cover w-full ${
                    type === 'cover' ? 'h-20' : 'h-32'
                  }`}
                  controls
                  muted
                />
              ) : (
                <Image
                  src={preview}
                  alt="Preview"
                  width={200}
                  height={200}
                  className={`rounded object-cover w-full ${
                    type === 'cover' ? 'h-20' : 'h-32'
                  }`}
                />
              )}
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
        {type === 'post' && (
        <div className="text-sm text-gray-500 mt-1">
          <p>{previews.length}/{maxFiles} {allowVideo ? 'tệp' : 'ảnh'} đã chọn</p>
          {allowVideo && (
            <p className="text-xs mt-1 text-blue-600 dark:text-blue-400">
              💡 Gợi ý: Hãy gửi video dưới 50MB để tải lên thành công
            </p>
          )}
        </div>
      )}

      {/* Image Crop Modal */}
      {enableCropping && selectedImageForCrop && (
        <ImageCropModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          imageSrc={selectedImageForCrop}
          onCropComplete={handleCropComplete}
          aspectRatio={getAspectRatio()}
          cropType={type === 'profile' ? 'profile' : 'cover'}
        />
      )}
    </div>
  );
}
