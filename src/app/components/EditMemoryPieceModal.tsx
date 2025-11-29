'use client'
import { toast } from 'sonner';
import { UploadedImage } from '@/app/components/CreateMemoryPieceForm';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X } from 'lucide-react';
import Image from "next/image";

interface MemoryPieceData {
  _id: string;
  content: string;
  description?: string;
  imageUrls?: string[];
  labels?: string[];
}

interface EditMemoryPieceFormProps {
  memoryPiece: MemoryPieceData;
  unitPath: string;
  subjectId: string;
  updateMemoryPiece: (id: string, subjectId: string, data: any) => Promise<any>;
  setModalOpen: (open: boolean) => void;
  onSuccess: () => void;
}

function EditMemoryPieceForm({ memoryPiece, unitPath, subjectId, updateMemoryPiece, setModalOpen, onSuccess }: EditMemoryPieceFormProps) {
  const [images, setImages] = useState<UploadedImage[]>(
    memoryPiece.imageUrls?.map(url => ({ url, key: url })) || []
  );
  const [uploading, setUploading] = useState(false);
  const [content, setContent] = useState(memoryPiece.content);
  const [description, setDescription] = useState(memoryPiece.description || '');
  const [labels, setLabels] = useState<string>(memoryPiece.labels?.join(', ') || '');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);

    for (const file of acceptedFiles) {
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
      // Only delete from S3 if it's a newly uploaded image (not the original)
      if (!memoryPiece.imageUrls?.includes(key)) {
        await fetch('/api/s3/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key }),
        });
      }
      setImages(prev => prev.filter(img => img.key !== key));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await updateMemoryPiece(memoryPiece._id.toString(), subjectId, {
        content,
        description,
        imageUrls: images.map(image => image.url),
        labels: labels.split(',').map(l => l.trim()).filter(Boolean),
      });

      if (res != null) {
        toast.success('Memory piece updated successfully!');
        onSuccess();
        setModalOpen(false);
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update memory piece');
    }
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
          className="w-full border rounded px-3 py-2 min-h-[100px]"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Labels (comma-separated)</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={labels}
          onChange={e => setLabels(e.target.value)}
          placeholder="e.g. Chinese, HSK 1, Vocabulary"
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
                  width={128}
                  height={128}
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

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={uploading || !content || images.length === 0}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          Update Memory Piece
        </button>
        <button
          type="button"
          onClick={() => setModalOpen(false)}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

interface EditMemoryPieceModalProps {
  memoryPiece: MemoryPieceData;
  unitPath: string;
  subjectId: string;
  updateMemoryPiece: (id: string, subjectId: string, data: any) => Promise<any>;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditMemoryPieceModal({
  memoryPiece,
  unitPath,
  subjectId,
  updateMemoryPiece,
  isOpen,
  onClose,
  onSuccess
}: EditMemoryPieceModalProps) {
  return (
    <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={onClose}>
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto bg-black/50 backdrop-blur-sm">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-2xl rounded-xl bg-popover p-6 text-foreground shadow-xl ring-1 ring-border backdrop-blur-2xl duration-300 ease-out data-closed:scale-95 data-closed:opacity-0"
          >
            <DialogTitle as="h3" className="mb-4 text-base/7 font-medium leading-7 text-foreground">
              Edit Memory Piece
            </DialogTitle>
            <EditMemoryPieceForm
              memoryPiece={memoryPiece}
              unitPath={unitPath}
              subjectId={subjectId}
              updateMemoryPiece={updateMemoryPiece}
              setModalOpen={onClose}
              onSuccess={onSuccess}
            />
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
