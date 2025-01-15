import React, { useRef } from 'react';
import { Paperclip } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface FileInputProps {
  onFileSelect: (file: File) => void;
}

export const FileInput: React.FC<FileInputProps> = ({ onFileSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    } else {
      alert('Please select an image file.');
    }
  };

  return (
    <>
      <Button variant="ghost" size="icon" type='button' onClick={handleClick}>
        <Paperclip className="h-5 w-5" />
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
    </>
  );
};

