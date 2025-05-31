"use client";
import React, { useState, useRef, useCallback } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Slider } from '@nextui-org/react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  onCropComplete: (croppedImageUrl: string) => void;
  aspectRatio?: number;
  cropType: 'profile' | 'cover';
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  onOpenChange,
  imageSrc,
  onCropComplete,
  aspectRatio = 1,
  cropType
}) => {
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
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

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

  const generateCroppedImage = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    canvas.width = crop.width;
    canvas.height = crop.height;

    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = crop.width * pixelRatio;
    canvas.height = crop.height * pixelRatio;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height,
    );

    return new Promise<string>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Failed to create blob');
          return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.95);
    });
  }, [completedCrop]);

  const handleCropSave = async () => {
    const croppedImageUrl = await generateCroppedImage();
    if (croppedImageUrl) {
      onCropComplete(croppedImageUrl);
      onOpenChange(false);
    }
  };

  const getCropDimensions = () => {
    if (cropType === 'profile') {
      return { minWidth: 150, minHeight: 150, maxWidth: 400, maxHeight: 400 };
    } else {
      return { minWidth: 600, minHeight: 200, maxWidth: 1200, maxHeight: 400 };
    }
  };

  const cropDimensions = getCropDimensions();

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onOpenChange}
      size="4xl"
      scrollBehavior="inside"
      classNames={{
        body: "py-6",
        backdrop: "bg-[#292f46]/50 backdrop-opacity-40",
        base: "border-[#292f46] bg-[#19172c] dark:bg-[#19172c] text-[#a8b0d3]",
        header: "border-b-[1px] border-[#292f46]",
        footer: "border-t-[1px] border-[#292f46]",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-xl font-bold">
                Crop {cropType === 'profile' ? 'Profile Picture' : 'Cover Photo'}
              </h2>
              <p className="text-sm text-gray-400">
                {cropType === 'profile' 
                  ? 'Adjust your profile picture to fit perfectly'
                  : 'Adjust your cover photo to fit the banner area'
                }
              </p>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                {/* Crop Controls */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Scale</label>
                    <Slider 
                      size="sm"
                      step={0.1}
                      maxValue={3}
                      minValue={0.5}
                      value={scale}
                      onChange={(value) => setScale(Array.isArray(value) ? value[0] : value)}
                      className="max-w-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Rotate</label>
                    <Slider 
                      size="sm"
                      step={1}
                      maxValue={180}
                      minValue={-180}
                      value={rotate}
                      onChange={(value) => setRotate(Array.isArray(value) ? value[0] : value)}
                      className="max-w-md"
                    />
                  </div>
                </div>

                {/* Crop Area */}
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <ReactCrop
                    crop={crop}
                    onChange={(pixelCrop, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={aspectRatio}
                    minWidth={cropDimensions.minWidth}
                    minHeight={cropDimensions.minHeight}
                    maxWidth={cropDimensions.maxWidth}
                    maxHeight={cropDimensions.maxHeight}
                  >
                    <img
                      ref={imgRef}
                      alt="Crop preview"
                      src={imageSrc}
                      style={{ 
                        transform: `scale(${scale}) rotate(${rotate}deg)`,
                        maxHeight: '400px',
                        maxWidth: '100%'
                      }}
                      onLoad={onImageLoad}
                    />
                  </ReactCrop>
                </div>

                {/* Preview Canvas (hidden) */}
                <canvas
                  ref={previewCanvasRef}
                  style={{ display: 'none' }}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button 
                color="danger" 
                variant="light" 
                onPress={onClose}
              >
                Cancel
              </Button>
              <Button 
                color="primary" 
                onPress={handleCropSave}
                isDisabled={!completedCrop}
              >
                Apply Crop
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ImageCropModal;
