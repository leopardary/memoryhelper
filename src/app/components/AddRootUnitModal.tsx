'use client'
import {UploadedImage} from '@/app/components/CreateMemoryPieceForm';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { useCallback, useState } from 'react';
import { Button } from '@/app/components/button';
import { useDropzone } from 'react-dropzone';
import { X } from 'lucide-react';
import Image from "next/image";

interface CreateRootUnitPanelProps extends AddRootUnitModalProps {
  setModalOpen: (open: boolean) => void;
}

function CreateRootUnitForm({ subjectTitle, subjectId, addRootUnitForSubject, setModalOpen } : CreateRootUnitPanelProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);

    for (const file of acceptedFiles) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) continue; // 5MB max

      const key = 'Home/' + subjectTitle + '/' + title + '/' + file.name;
      try {
        const res = await fetch('/api/s3/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, fileType: file.type, filePath: 'Home/' + subjectTitle + '/' + title }),
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
  }, [subjectTitle, title]);

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
    const res = await addRootUnitForSubject({
      subjectId,
      title,
      description,
      imageUrls: images.map(image => image.url),
    })

    if (res != null) {
      alert('Submitted!');
      setTitle('');
      setDescription('');
      setImages([]);
    }
    setModalOpen?.(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
      <div>
        <label className="block mb-1 font-medium">Title</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Description</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={description}
          onChange={e => setDescription(e.target.value)}
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
        disabled={uploading || !title || images.length === 0}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        Submit
      </button>
    </form>
  );
}

function CreateRootUnitPanel({subjectTitle, subjectId, addRootUnitForSubject, setModalOpen}: CreateRootUnitPanelProps) {
  return  <DialogPanel
              transition
              className="w-full max-w-md rounded-xl bg-popover p-6 text-foreground shadow-xl ring-1 ring-border backdrop-blur-2xl duration-300 ease-out data-closed:scale-95 data-closed:opacity-0"
            >
              <DialogTitle as="h3" className="mb-4 text-base/7 font-medium leading-7 text-foreground">
                Add Unit
              </DialogTitle>
              <CreateRootUnitForm subjectTitle={subjectTitle} subjectId={subjectId} addRootUnitForSubject={addRootUnitForSubject} setModalOpen={setModalOpen} />
            </DialogPanel>
}

interface UnitBaseProps {
  title: string,
  description: string,
  imageUrls: string[]
}

interface AddRootUnitProps extends UnitBaseProps {
  subjectId: string,
}

interface AddRootUnitModalProps {
  subjectTitle: string;
  subjectId: string;
  addRootUnitForSubject: (props: AddRootUnitProps) => Promise<string>
}

export default function AddRootUnitModal(props: AddRootUnitModalProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const {subjectTitle, subjectId, addRootUnitForSubject} = props;
  const panel = <CreateRootUnitPanel subjectTitle={subjectTitle} subjectId={subjectId} addRootUnitForSubject={addRootUnitForSubject} setModalOpen={setModalOpen} />
  return (
    <>
    <Button onClick={() => setModalOpen(!modalOpen)}>{modalOpen ? 'Close Modal' : 'Open Modal'}</Button>
    <Dialog open={modalOpen} as="div" className="relative z-10 focus:outline-none" onClose={() => setModalOpen(false)}>
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto bg-black/50 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center p-4">
            {panel}
          </div>
        </div>
      </Dialog></>);
}
