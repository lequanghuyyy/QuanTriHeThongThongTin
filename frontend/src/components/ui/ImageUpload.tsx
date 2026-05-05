import { useState, useRef } from 'react';
import { UploadCloud, X } from 'lucide-react';
import clsx from 'clsx';
import { toast } from '../../utils/toast';

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
}

export const ImageUpload = ({ value, onChange, maxFiles = 5 }: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = async (files: File[]) => {
    if (value.length + files.length > maxFiles) {
      toast.warning(`Chỉ được tải lên tối đa ${maxFiles} ảnh.`);
      return;
    }

    setIsUploading(true);
    
    // Simulate Cloudinary upload by using object URLs for now
    // In production, you would upload to Cloudinary and get the secure_url
    const newUrls: string[] = [];
    
    for (const file of files) {
      // Fake upload delay
      await new Promise(resolve => setTimeout(resolve, 500));
      const url = URL.createObjectURL(file); // TODO: Replace with real Cloudinary upload
      newUrls.push(url);
    }
    
    onChange([...value, ...newUrls]);
    setIsUploading(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div 
        className={clsx(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
          isDragging ? "border-primary bg-primary/5" : "border-gray-300 hover:bg-gray-50",
          isUploading ? "opacity-50 pointer-events-none" : ""
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/png, image/jpeg, image/webp" 
          multiple 
          onChange={handleFileChange}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-medium text-gray-600">Đang tải ảnh lên...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <UploadCloud size={40} className="text-gray-400 mb-3" />
            <p className="text-sm font-medium text-gray-700 mb-1">
              Kéo thả ảnh hoặc <span className="text-primary">chọn từ thiết bị</span>
            </p>
            <p className="text-xs text-gray-500">
              Hỗ trợ PNG, JPG, WEBP. Tối đa {maxFiles} ảnh.
            </p>
          </div>
        )}
      </div>

      {/* Preview Gallery */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div key={index} className="relative aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-50 group">
              <img 
                src={url} 
                alt={`Uploaded ${index}`} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                  className="bg-danger text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  title="Xóa ảnh"
                >
                  <X size={16} />
                </button>
              </div>
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                  Ảnh bìa
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
