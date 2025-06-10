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

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onOpenChange}
      size="4xl"
      scrollBehavior="inside"
      classNames={{
        body: "py-6",
        backdrop: "bg-black/50 backdrop-opacity-40",
        base: "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900",
        header: "border-b border-gray-200 dark:border-gray-700",
        footer: "border-t border-gray-200 dark:border-gray-700",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Cắt {cropType === 'profile' ? 'Ảnh đại diện' : 'Ảnh bìa'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {cropType === 'profile' 
                  ? 'Điều chỉnh ảnh đại diện để phù hợp hoàn hảo'
                  : 'Điều chỉnh ảnh bìa để phù hợp với khu vực banner'
                }
              </p>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                {/* Crop Controls */}                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Tỷ lệ</label>
                    <Slider 
                      size="sm"
                      step={0.1}
                      maxValue={3}
                      minValue={0.5}
                      value={scale}
                      onChange={(value) => setScale(Array.isArray(value) ? value[0] : value)}
                      className="max-w-md"
                      classNames={{
                        track: "bg-gray-200 dark:bg-gray-700",
                        filler: "bg-blue-500 dark:bg-blue-400",
                        thumb: "bg-blue-500 dark:bg-blue-400 border-white dark:border-gray-800"
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Xoay</label>
                    <Slider 
                      size="sm"
                      step={1}
                      maxValue={180}
                      minValue={-180}
                      value={rotate}
                      onChange={(value) => setRotate(Array.isArray(value) ? value[0] : value)}
                      className="max-w-md"
                      classNames={{
                        track: "bg-gray-200 dark:bg-gray-700",
                        filler: "bg-blue-500 dark:bg-blue-400",
                        thumb: "bg-blue-500 dark:bg-blue-400 border-white dark:border-gray-800"
                      }}
                    />
                  </div>
                </div>                {/* Crop Area - Full width container */}
                <div className="w-full border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
                  <ReactCrop
                    crop={crop}
                    onChange={(pixelCrop, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={aspectRatio}
                    className="w-full"
                    style={{
                      width: '100%',
                      height: 'auto'
                    }}
                  >
                    <img
                      ref={imgRef}
                      alt="Crop preview"
                      src={imageSrc}
                      style={{ 
                        transform: `scale(${scale}) rotate(${rotate}deg)`,
                        width: '100%',
                        height: 'auto',
                        maxHeight: '500px',
                        objectFit: 'contain'
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
                Hủy
              </Button>
              <Button 
                color="primary" 
                onPress={handleCropSave}
                isDisabled={!completedCrop}
              >
                Áp dụng cắt ảnh
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ImageCropModal;
