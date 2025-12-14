import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  description?: string;
  file: File | null;
  previewUrl: string | null;
  onFileChange: (file: File | null, url: string | null) => void;
  accept?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  description,
  file,
  previewUrl,
  onFileChange,
  accept = "image/png, image/jpeg, image/webp"
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const url = URL.createObjectURL(selectedFile);
      onFileChange(selectedFile, url);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileChange(null, null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const triggerClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-300">{label}</label>
      <div 
        onClick={triggerClick}
        className={`
          relative group cursor-pointer 
          border-2 border-dashed rounded-xl transition-all duration-200 ease-in-out
          h-48 flex flex-col items-center justify-center overflow-hidden
          ${previewUrl ? 'border-slate-600 bg-slate-800' : 'border-slate-600 hover:border-blue-500 hover:bg-slate-800/50 bg-slate-900'}
        `}
      >
        <input 
          type="file" 
          ref={inputRef}
          className="hidden" 
          accept={accept} 
          onChange={handleFileChange}
        />

        {previewUrl ? (
          <>
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full h-full object-contain p-2"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <span className="text-white font-medium text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">Change Image</span>
            </div>
            <button 
              onClick={clearFile}
              className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors"
              title="Remove image"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 gap-3 px-4 text-center">
            <div className="p-3 bg-slate-800 rounded-full">
              <Upload size={24} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-slate-200">Click to upload</span>
              {description && <span className="text-xs text-slate-500">{description}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
