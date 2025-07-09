import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Crop as CropIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import { useImageSize } from 'react-image-size';
import 'react-image-crop/dist/ReactCrop.css';

interface SelectableImageProps {
  src: string;
  alt: string;
  className?: string;
  targetWidth?: number;
  targetHeight?: number;
  onImageChange?: (newSrc: string) => void;
}

const SelectableImage: React.FC<SelectableImageProps> = ({ 
  src, 
  alt, 
  className,
  targetWidth = 1230,
  targetHeight = 120,
  onImageChange 
}) => {
  const [isSelected, setIsSelected] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isUploading, setIsUploading] = useState(false);
  const [showCrop, setShowCrop] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [tempImageSrc, setTempImageSrc] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleImageClick = () => {
    setIsSelected(!isSelected);
  };

  const handleChangeImage = () => {
    fileInputRef.current?.click();
  };

  const getCroppedImg = useCallback((
    image: HTMLImageElement,
    crop: PixelCrop
  ): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Set canvas size to target dimensions
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Calculate scale to maintain aspect ratio
    const scaleX = targetWidth / crop.width;
    const scaleY = targetHeight / crop.height;

    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      targetWidth,
      targetHeight
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Failed to create blob');
        }
        const croppedImageUrl = URL.createObjectURL(blob);
        resolve(croppedImageUrl);
      }, 'image/jpeg', 0.95);
    });
  }, [targetWidth, targetHeight]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setIsUploading(true);

    try {
      // Create a URL for the uploaded file
      const tempUrl = URL.createObjectURL(file);
      setTempImageSrc(tempUrl);
      setShowCrop(true);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCropComplete = async () => {
    if (!imgRef.current || !crop) return;

    try {
      const croppedImageUrl = await getCroppedImg(imgRef.current, crop as PixelCrop);
      setCurrentSrc(croppedImageUrl);
      onImageChange?.(croppedImageUrl);
      setShowCrop(false);
      setIsSelected(false);
      // Clean up temp URL
      if (tempImageSrc) {
        URL.revokeObjectURL(tempImageSrc);
        setTempImageSrc('');
      }
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Failed to crop image');
    }
  };

  const handleCropCancel = () => {
    setShowCrop(false);
    if (tempImageSrc) {
      URL.revokeObjectURL(tempImageSrc);
      setTempImageSrc('');
    }
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    
    // Calculate crop to maintain aspect ratio while fitting target dimensions
    const targetAspect = targetWidth / targetHeight;
    const imageAspect = width / height;
    
    let cropWidth, cropHeight, cropX, cropY;
    
    if (imageAspect > targetAspect) {
      // Image is wider than target aspect ratio
      cropHeight = height;
      cropWidth = height * targetAspect;
      cropX = (width - cropWidth) / 2;
      cropY = 0;
    } else {
      // Image is taller than target aspect ratio
      cropWidth = width;
      cropHeight = width / targetAspect;
      cropX = 0;
      cropY = (height - cropHeight) / 2;
    }

    setCrop({
      unit: 'px',
      x: cropX,
      y: cropY,
      width: cropWidth,
      height: cropHeight,
    });
  }, [targetWidth, targetHeight]);

  return (
    <>
      <div className="relative inline-block">
        <div 
          className={cn(
            "relative cursor-pointer transition-all duration-200",
            isSelected && "ring-2 ring-primary ring-offset-2",
            className
          )}
          onClick={handleImageClick}
        >
          <img
            src={currentSrc}
            alt={alt}
            className={cn(
              "w-full h-auto transition-all duration-200",
              isSelected && "brightness-90"
            )}
            style={{ position: 'relative' }}
          />
          
          {/* Selection overlay */}
          {isSelected && (
            <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
          )}
        </div>

        {/* Change Image Button */}
        {isSelected && (
          <div className="absolute top-2 right-2 z-10">
            <Button
              onClick={handleChangeImage}
              size="sm"
              disabled={isUploading}
              className="shadow-lg"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Change Image'}
            </Button>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Crop Modal */}
      {showCrop && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto">
            <h3 className="text-lg font-semibold mb-4">Crop Image</h3>
            <div className="mb-4">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                aspect={targetWidth / targetHeight}
                minWidth={50}
                minHeight={50}
              >
                <img
                  ref={imgRef}
                  src={tempImageSrc}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  className="max-w-full max-h-[60vh] object-contain"
                />
              </ReactCrop>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleCropCancel}>
                Cancel
              </Button>
              <Button onClick={handleCropComplete}>
                <CropIcon className="w-4 h-4 mr-2" />
                Apply Crop
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SelectableImage;