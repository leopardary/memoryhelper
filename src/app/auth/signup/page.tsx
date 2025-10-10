'use client';
import { useState, useCallback } from "react";
import { Field, Fieldset, Input, Label, Legend } from '@headlessui/react'
import { useRouter } from "next/navigation";
import { Button } from '@/app/components/button';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { X } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      // Create unique filename with timestamp
      const fileExtension = file.name.split('.').pop();
      const uniqueFileName = `signup-${Date.now()}.${fileExtension}`;

      // Get presigned URL
      const res = await fetch('/api/s3/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: uniqueFileName,
          fileType: file.type,
          filePath: 'profile-images'
        }),
      });

      const { uploadUrl, publicUrl } = await res.json();

      // Upload to S3
      await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      setImageUrl(publicUrl);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { 'image/*': [] },
  });

  const removeImage = async () => {
    if (!imageUrl) return;

    try {
      // Extract key from URL
      const url = new URL(imageUrl);
      const key = url.pathname.substring(1); // Remove leading slash

      await fetch('/api/s3/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });

      setImageUrl('');
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to remove image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password, imageUrl }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      router.push("/auth/signin");
    } else {
      const error = await res.json();
      alert(error.error || "Signup failed");
    }
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setName('');
    setEmail('');
    setPassword('');
    setImageUrl('');
  };

  return (
    <div className="w-full justify-items-center px-4">
      <div className="w-full md:w-10/12 lg:w-8/12 xl:w-6/12">
        <Fieldset className="space-y-6 rounded-xl bg-gray-100 dark:bg-gray-900 p-6 sm:p-10">
          <Legend className="text-base/7 font-semibold text-foreground border-b">Sign Up</Legend>
          <Field>
            <Label className="text-sm/6 font-medium text-foreground">Name</Label>
            <Input
              type="name"
              className='mt-3 block w-full rounded-lg border-none bg-gray-900/5 dark:bg-gray-100/5 px-3 py-1.5 text-sm/6 text-foreground focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </Field>
          <Field>
            <Label className="text-sm/6 font-medium text-foreground">Email</Label>
            <Input
              type="email"
              className='mt-3 block w-full rounded-lg border-none bg-gray-900/5 dark:bg-gray-100/5 px-3 py-1.5 text-sm/6 text-foreground focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field>
            <Label className="text-sm/6 font-medium text-foreground">Password</Label>
            <Input
              type="password"
              className='mt-3 block w-full rounded-lg border-none bg-gray-900/5 dark:bg-gray-100/5 px-3 py-1.5 text-sm/6 text-foreground focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </Field>
          <Field>
            <Label className="text-sm/6 font-medium text-foreground">Profile Image (Optional)</Label>
            <div className="mt-3">
              {imageUrl ? (
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Image
                      src={imageUrl}
                      alt="Profile preview"
                      width={80}
                      height={80}
                      className="rounded-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground self-center">
                    Click X to remove image
                  </p>
                </div>
              ) : (
                <>
                  {!uploading && (
                    <div
                      {...getRootProps()}
                      className="border-2 border-dashed border-gray-300 dark:border-gray-600 p-4 rounded-lg text-center cursor-pointer hover:bg-gray-900/5 dark:hover:bg-gray-100/5"
                    >
                      <input {...getInputProps()} />
                      <p className="text-sm text-muted-foreground">
                        {isDragActive
                          ? 'Drop the image here...'
                          : 'Drag & drop or click to upload'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Max 5MB
                      </p>
                    </div>
                  )}

                  {uploading && (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin h-5 w-5 border-3 border-primary border-t-transparent rounded-full" />
                    </div>
                  )}
                </>
              )}
            </div>
          </Field>
          <div className="w-full flex justify-between mt-4">
            <Button variant="outline" type="reset" onClick={handleReset}>Reset</Button>
            <Button type="submit" onClick={handleSubmit} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Sign Up'}
            </Button>
          </div>
        </Fieldset>
      </div>
    </div>
  );
}
