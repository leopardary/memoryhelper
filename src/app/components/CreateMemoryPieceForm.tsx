'use client';

import { useDropzone } from 'react-dropzone';
import { useCallback, useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from 'lucide-react';
import Image from "next/image";
import { toast } from 'sonner';
import { FormField, TextAreaField } from '@/app/components/FormField';

const memoryPieceSchema = z.object({
  content: z.string()
    .min(1, "Content is required")
    .max(200, "Content must be less than 200 characters"),
  description: z.string().optional(),
  labels: z.string().optional(),
});

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
  unitPath: string;
  submitCallback?: () => void;
}

type MemoryPieceFormData = z.infer<typeof memoryPieceSchema>;

export default function CreateMemoryPieceForm({ unitId, unitPath, submitCallback } : CreateMemoryPieceFormProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const {
    register,
    handleSubmit: handleFormSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<MemoryPieceFormData>({
    resolver: zodResolver(memoryPieceSchema),
    mode: "onBlur",
    defaultValues: {
      content: '',
      description: '',
      labels: ''
    }
  });

  const content = watch('content');

  const handleGenerate = async () => {
    if (!content) {
      toast.error("Please enter content first");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-chinese-character-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (res.ok) {
        setValue('description', data.description);
        toast.success("Description generated successfully");
      } else {
        toast.error(data.error || "生成失败");
      }
    } catch (err) {
      console.error(err);
      toast.error("生成描述时出错");
    } finally {
      setGenerating(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);

    for (const file of acceptedFiles) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) continue; // 5MB max

      const key = unitPath + '/' + content + '/' + file.name;
      try {
        const res = await fetch('/api/s3/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, fileType: file.type, filePath: unitPath + '/' + content }),
        });

        const { uploadUrl, publicUrl } = await res.json();

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
  }, [unitPath, content]);

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

  const onSubmit = async (data: MemoryPieceFormData) => {
    // Validate that at least one image is uploaded
    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    try {
      const response = await fetch('/api/admin/memory-pieces/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitId,
          content: data.content,
          description: data.description,
          imageUrls: images.map(image => image.url),
          labels: data.labels?.split(',').map(l => l.trim()).filter(Boolean) || []
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Failed to create memory piece');
      }

      const res = await response.json();

      if (res) {
        toast.success('Memory piece created successfully!');
        setValue('content', '');
        setValue('description', '');
        setValue('labels', '');
        setImages([]);
        window.location.reload();
      }
    } catch (error) {
      console.error('Create memory piece error:', error);
      toast.error('Failed to create memory piece');
    }
    submitCallback?.();
  };

  return (
    <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-4 max-w-xl mx-auto">
      <FormField
        label="Content"
        name="content"
        type="text"
        placeholder="Enter memory piece content"
        register={register}
        error={errors.content}
        disabled={uploading}
      />

      <div>
        <TextAreaField
          label="Description"
          name="description"
          placeholder="Enter description (optional)"
          register={register}
          error={errors.description}
          disabled={uploading}
          rows={3}
        />
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating || !content}
          className="mt-2 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {generating ? "Generating..." : "Generate Description"}
        </button>
      </div>

      <FormField
        label="Labels (comma-separated)"
        name="labels"
        type="text"
        placeholder="e.g., vocabulary, HSK4, common"
        register={register}
        error={errors.labels}
        disabled={uploading}
      />

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
        disabled={uploading || images.length === 0}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {uploading ? 'Uploading...' : 'Submit'}
      </button>

      {images.length === 0 && (
        <p className="text-sm text-destructive">* At least one image is required</p>
      )}
    </form>
  );
}
