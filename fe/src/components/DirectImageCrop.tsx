"use client";
import React, { useState, useRef, useCallback } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Slider } from '@nextui-org/react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface DirectImageCropProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCropComplete: (croppedImageUrl: string, croppedFile: File) => void;
  cropType: 'profile' | 'cover';
  title: string;
}

const DirectImageCrop: React.FC<DirectImageCropProps> = ({
  isOpen,
  onOpenChange,
  onCropComplete,
  cropType,
  title
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatio = cropType === 'profile' ? 1 : 16 / 9;

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspectRatio) {
      const { width, height } = e.currentTarget;
      setCrop(centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          aspectRatio,
          width,
          height,
        ),
        width,
        height,
      ));
    }
  }, [aspectRatio]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const file = e.target.files[0];
    setOriginalFile(file);
    const imageUrl = URL.createObjectURL(file);
    setImageSrc(imageUrl);
    
    // Reset crop settings
    setScale(1);
    setRotate(0);
  };

  const getCroppedImg = useCallback(async (): Promise<string | null> => {
    if (!imgRef.current || !completedCrop || !imageSrc) return null;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio;

    canvas.width = completedCrop.width * scaleX * pixelRatio;
    canvas.height = completedCrop.height * scaleY * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;

    const centerX = image.naturalWidth / 2;
    const centerY = image.naturalHeight / 2;

    ctx.save();

    ctx.translate(-cropX, -cropY);
    ctx.translate(centerX, centerY);
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);
    ctx.drawImage(image, 0, 0);

    ctx.restore();

    return canvas.toDataURL('image/jpeg', 0.95);
  }, [completedCrop, scale, rotate, imageSrc]);

  const handleCropConfirm = async () => {
    const croppedImageUrl = await getCroppedImg();
    if (croppedImageUrl && originalFile) {
      // Convert cropped image to File
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      const fileName = `cropped_${cropType}_${Date.now()}.jpg`;
      const croppedFile = new File([blob], fileName, { type: 'image/jpeg' });
      
      onCropComplete(croppedImageUrl, croppedFile);
      handleClose();
    }
  };

  const handleClose = () => {
    // Clean up
    if (imageSrc) {
      URL.revokeObjectURL(imageSrc);
    }
    setImageSrc('');
    setOriginalFile(null);
    setScale(1);
    setRotate(0);
    onOpenChange(false);
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        size="3xl"
        scrollBehavior="inside"
        classNames={{
          base: "bg-white dark:bg-gray-900",
          header: "border-b border-gray-200 dark:border-gray-700",
          body: "py-4",
          footer: "border-t border-gray-200 dark:border-gray-700"
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          </ModalHeader>
          
          <ModalBody className="px-6">
            {!imageSrc ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Chọn một hình ảnh để cắt và tải lên
                  </p>                  <Button
                    color="primary"
                    onClick={handleFileSelect}
                    size="lg"
                  >
                    Chọn ảnh
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-full">
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={aspectRatio}
                    className="w-full"
                  >
                    <img
                      ref={imgRef}
                      alt="Crop me"
                      src={imageSrc}
                      style={{
                        transform: `scale(${scale}) rotate(${rotate}deg)`,
                        maxWidth: '100%',
                        height: 'auto'
                      }}
                      onLoad={onImageLoad}
                      className="w-full h-auto"
                    />
                  </ReactCrop>
                </div>

                <div className="space-y-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div>                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tỷ lệ: {scale.toFixed(2)}
                    </label>
                    <Slider
                      size="sm"
                      step={0.1}
                      maxValue={3}
                      minValue={0.5}
                      value={scale}
                      onChange={(value) => setScale(value as number)}
                      className="w-full"
                      classNames={{
                        track: "bg-gray-300 dark:bg-gray-600",
                        filler: "bg-blue-500 dark:bg-blue-400"
                      }}
                    />
                  </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Xoay: {rotate}°
                    </label>
                    <Slider
                      size="sm"
                      step={1}
                      maxValue={180}
                      minValue={-180}
                      value={rotate}
                      onChange={(value) => setRotate(value as number)}
                      className="w-full"
                      classNames={{
                        track: "bg-gray-300 dark:bg-gray-600",
                        filler: "bg-blue-500 dark:bg-blue-400"
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
          
          <ModalFooter>            <Button 
              color="danger" 
              variant="light" 
              onPress={handleClose}
            >
              Hủy
            </Button>
            {imageSrc && (
              <>                <Button 
                  color="default" 
                  variant="light" 
                  onPress={handleFileSelect}
                >
                  Chọn ảnh khác
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleCropConfirm}
                  isDisabled={!completedCrop}
                >
                  Cắt & Tiếp tục
                </Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default DirectImageCrop;
