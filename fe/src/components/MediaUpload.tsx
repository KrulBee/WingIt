import { useRef, useState } from 'react';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import Image from 'next/image';

type MediaUploadProps = {
  onUploadComplete: (urls: string[]) => void;
  type: 'post' | 'profile';
  maxFiles?: number;
};

export default function MediaUpload({ onUploadComplete, type, maxFiles = 4 }: MediaUploadProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadMedia, isLoading, error } = useMediaUpload();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const selectedFiles = Array.from(e.target.files);
    const newFiles = type === 'profile' 
      ? [selectedFiles[0]] // Only take one file for profile pictures
      : files.length + selectedFiles.length > maxFiles 
        ? selectedFiles.slice(0, maxFiles - files.length) 
        : selectedFiles;
    
    // Create object URLs for previews
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
    setPreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(previews[index]);
    
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setPreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index));
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
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center mb-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={type === 'profile' ? previews.length > 0 : previews.length >= maxFiles}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          {type === 'profile' ? 'Select Profile Image' : 'Add Images'}
        </button>
        {previews.length > 0 && (
          <button
            type="button"
            onClick={handleUpload}
            disabled={isLoading}
            className="ml-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
          >
            {isLoading ? 'Uploading...' : 'Upload'}
          </button>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        multiple={type !== 'profile'}
      />
      
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
      
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
          {previews.map((preview, index) => (
            <div key={index} className="relative">
              <Image
                src={preview}
                alt="Preview"
                width={200}
                height={200}
                className="rounded object-cover w-full h-32"
              />
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
        <p className="text-sm text-gray-500 mt-1">
          {previews.length}/{maxFiles} images selected
        </p>
      )}
    </div>
  );
}
