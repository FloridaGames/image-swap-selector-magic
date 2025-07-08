import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectableImageProps {
  src: string;
  alt: string;
  className?: string;
  onImageChange?: (newSrc: string) => void;
}

const SelectableImage: React.FC<SelectableImageProps> = ({ 
  src, 
  alt, 
  className,
  onImageChange 
}) => {
  const [isSelected, setIsSelected] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    setIsSelected(!isSelected);
  };

  const handleChangeImage = () => {
    fileInputRef.current?.click();
  };

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
      const newImageUrl = URL.createObjectURL(file);
      setCurrentSrc(newImageUrl);
      onImageChange?.(newImageUrl);
      setIsSelected(false); // Deselect after successful upload
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

  return (
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
  );
};

export default SelectableImage;