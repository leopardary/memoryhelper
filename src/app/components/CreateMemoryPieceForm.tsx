'use client';

import { useDropzone } from 'react-dropzone';
import { useCallback, useState } from 'react';
import { X } from 'lucide-react';
import Image from "next/image";

export type UploadedImage = {
  url: string;
  key: string;
};

export interface AddMemoryPieceToUnitProps {
  unitId: string;
  content: string;
  imageUrls: string[];
  description?: string;
  descriptionFunc?: () => string;
  labels: string[];
}

export interface CreateMemoryPieceFormProps {
  unitId: string;
  // server util to save the new memoryPiece {@see memory-piece#addMemoryPieceToUnit}
  addMemoryPieceToUnit: (props: AddMemoryPieceToUnitProps) => Promise<boolean>;
  unitPath: string;
  submitCallback?: () => void;
}

export default function CreateMemoryPieceForm({ unitId, addMemoryPieceToUnit, unitPath, submitCallback } : CreateMemoryPieceFormProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [labels, setLabels] = useState<string>('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);

    for (const file of acceptedFiles) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) continue; // 5MB max

      try {
        const res = await fetch('/api/s3/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, fileType: file.type, filePath: unitPath }),
        });

        const { uploadUrl, publicUrl } = await res.json();

        const key = unitPath + '/' + file.name;

        await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });

        setImages(prev => [...prev, { url: publicUrl, key }]);
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }

    setUploading(false);
  }, [unitPath]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: { 'image/*': [] },
  });

  const removeImage = async (key: string) => {
    try {
      await fetch('/api/s3/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      setImages(prev => prev.filter(img => img.key !== key));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await addMemoryPieceToUnit({
      unitId,
      content,
      description,
      imageUrls: images.map(image => image.url),
      labels: labels.split(',')
    })

    if (res) {
      alert('Submitted!');
      setContent('');
      setDescription('');
      setImages([]);
      setLabels('');
    }
    submitCallback?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
      <div>
        <label className="block mb-1 font-medium">Content</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={content}
          onChange={e => setContent(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Description</label>
        <textarea
          className="w-full border rounded px-3 py-2"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Labels</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={labels}
          onChange={e => setLabels(e.target.value)}
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">Images</label>

        {!uploading && (
          <div
            {...getRootProps()}
            className="border-2 border-dashed p-6 rounded-xl text-center cursor-pointer hover:bg-gray-50"
          >
            <input {...getInputProps()} />
            <p className="text-gray-500">
              {isDragActive ? 'Drop the images here...' : 'Drag & drop images or click to upload'}
            </p>
          </div>
        )}

        {uploading && (
          <div className="flex justify-center py-6">
            <div className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full" />
          </div>
        )}

        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4">
            {images.map(img => (
              <div key={img.key} className="relative group">
                <Image
                  src={img.url}
                  alt="Uploaded"
                  className="w-full h-32 object-cover rounded shadow"
                  width={40}
                  height={40}
                />
                <button
                  type="button"
                  onClick={() => removeImage(img.key)}
                  className="absolute top-1 right-1 bg-white p-1 rounded-full shadow hover:bg-red-100"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={uploading || !content || images.length === 0}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        Submit
      </button>
    </form>
  );
}
