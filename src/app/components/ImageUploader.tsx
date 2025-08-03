'use client'; // for App Router, or remove if using Pages Router

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export default function ImageUploader({ onUploaded }: { onUploaded: (url: string) => void }) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // 1. Get pre-signed URL
    const res = await fetch('/api/s3/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: file.name, fileType: file.type }),
    });

    const { uploadUrl, publicUrl } = await res.json();

    // 2. Upload directly to S3
    await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });

    onUploaded(publicUrl);
  }, [onUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className="p-6 border-2 border-dashed rounded-xl text-center cursor-pointer hover:bg-gray-50"
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the file here ...</p>
      ) : (
        <p>Drag & drop image here, or click to select</p>
      )}
    </div>
  );
}
