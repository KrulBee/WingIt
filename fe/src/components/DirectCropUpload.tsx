import { useRef, useState } from 'react';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react';
import ImageCropModal from './ImageCropModal';
import { Check, X } from 'react-feather';

type DirectCropUploadProps = {
  onUploadComplete: (urls: string[]) => void;
  type: 'profile' | 'cover';
  trigger: React.ReactNode;
};

export default function DirectCropUpload({ onUploadComplete, type, trigger }: DirectCropUploadProps) {
  const [selectedImageForCrop, setSelectedImageForCrop] = useState<string>('');
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadMedia, isLoading } = useMediaUpload();
  
  // Crop modal
  const { isOpen: isCropOpen, onOpen: onCropOpen, onOpenChange: onCropOpenChange } = useDisclosure();
  
  // Confirmation modal
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onOpenChange: onConfirmOpenChange } = useDisclosure();

  const handleTriggerClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const selectedFile = e.target.files[0];
    const imageUrl = URL.createObjectURL(selectedFile);
    setSelectedImageForCrop(imageUrl);
    onCropOpen();
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = async (croppedImageUrl: string) => {
    setCroppedImageUrl(croppedImageUrl);
    onCropOpenChange(); // Close crop modal
    onConfirmOpen(); // Open confirmation modal
  };

  const handleConfirmUpload = async () => {
    if (!croppedImageUrl) return;
    
    try {
      // Convert the cropped image data URL to a File
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      const fileName = `cropped_${type}_${Date.now()}.jpg`;
      const croppedFile = new File([blob], fileName, { type: 'image/jpeg' });
      
      // Upload the cropped image
      const urls = await uploadMedia([croppedFile], type);
      if (urls.length > 0) {
        onUploadComplete(urls);
        onConfirmOpenChange(); // Close confirmation modal
      }
    } catch (error) {
      console.error('Error uploading cropped image:', error);
    } finally {
      // Clean up URLs
      if (selectedImageForCrop) {
        URL.revokeObjectURL(selectedImageForCrop);
        setSelectedImageForCrop('');
      }
      if (croppedImageUrl) {
        URL.revokeObjectURL(croppedImageUrl);
        setCroppedImageUrl('');
      }
    }
  };

  const handleCancel = () => {
    // Clean up URLs
    if (selectedImageForCrop) {
      URL.revokeObjectURL(selectedImageForCrop);
      setSelectedImageForCrop('');
    }
    if (croppedImageUrl) {
      URL.revokeObjectURL(croppedImageUrl);
      setCroppedImageUrl('');
    }
    onConfirmOpenChange();
  };

  const getAspectRatio = () => {
    return type === 'profile' ? 1 : 16 / 9; // 1:1 for profile, 16:9 for cover
  };

  const getTitle = () => {
    return type === 'profile' ? 'Crop Profile Picture' : 'Crop Cover Photo';
  };

  const getConfirmTitle = () => {
    return type === 'profile' ? 'Update Profile Picture?' : 'Update Cover Photo?';
  };

  const getConfirmMessage = () => {
    return type === 'profile' 
      ? 'Are you happy with this cropped profile picture?' 
      : 'Are you happy with this cropped cover photo?';
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      
      {/* Trigger element */}
      <div onClick={handleTriggerClick} className="cursor-pointer">
        {trigger}
      </div>

      {/* Crop Modal */}
      <ImageCropModal
        isOpen={isCropOpen}
        onOpenChange={onCropOpenChange}
        imageUrl={selectedImageForCrop}
        onCropComplete={handleCropComplete}
        aspectRatio={getAspectRatio()}
        title={getTitle()}
      />

      {/* Confirmation Modal */}
      <Modal 
        isOpen={isConfirmOpen} 
        onOpenChange={onConfirmOpenChange}
        size="md"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-center">
                {getConfirmTitle()}
              </ModalHeader>
              <ModalBody className="text-center">
                {croppedImageUrl && (
                  <div className="flex justify-center mb-4">
                    <img
                      src={croppedImageUrl}
                      alt="Cropped preview"
                      className={`max-w-full h-auto rounded-lg shadow-md ${
                        type === 'profile' 
                          ? 'w-32 h-32 rounded-full object-cover' 
                          : 'max-h-32 object-cover'
                      }`}
                    />
                  </div>
                )}
                <p className="text-gray-600 dark:text-gray-400">
                  {getConfirmMessage()}
                </p>
              </ModalBody>
              <ModalFooter className="justify-center">
                <Button
                  color="danger"
                  variant="light"
                  onPress={handleCancel}
                  startContent={<X size={16} />}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleConfirmUpload}
                  isLoading={isLoading}
                  startContent={!isLoading && <Check size={16} />}
                >
                  {isLoading ? 'Uploading...' : 'Confirm'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
