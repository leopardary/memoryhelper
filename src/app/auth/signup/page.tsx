'use client';
import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Fieldset, Legend } from '@headlessui/react'
import { useRouter } from "next/navigation";
import { Button } from '@/app/components/button';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { FormField } from '@/app/components/FormField';

const signupSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur"
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
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
      toast.success('Image uploaded successfully');
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('Failed to upload image');
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
      toast.success('Image removed successfully');
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Failed to remove image');
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ ...data, imageUrl }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        toast.success("Account created successfully! Please sign in.");
        router.push("/auth/signin");
      } else {
        const error = await res.json();
        toast.error(error.error || "Signup failed");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset();
    setImageUrl('');
  };

  return (
    <div className="w-full justify-items-center px-4">
      <div className="w-full md:w-10/12 lg:w-8/12 xl:w-6/12">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Fieldset className="space-y-6 rounded-xl bg-gray-100 dark:bg-gray-900 p-6 sm:p-10">
            <Legend className="text-base/7 font-semibold text-foreground border-b">Sign Up</Legend>

            <FormField
              label="Name"
              name="name"
              type="text"
              placeholder="Your full name"
              autoComplete="name"
              register={register}
              error={errors.name}
              disabled={isSubmitting || uploading}
              className="bg-gray-900/5 dark:bg-gray-100/5"
            />

            <FormField
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              register={register}
              error={errors.email}
              disabled={isSubmitting || uploading}
              className="bg-gray-900/5 dark:bg-gray-100/5"
            />

            <FormField
              label="Password"
              name="password"
              type="password"
              placeholder="At least 6 characters"
              autoComplete="new-password"
              register={register}
              error={errors.password}
              disabled={isSubmitting || uploading}
              className="bg-gray-900/5 dark:bg-gray-100/5"
            />

            <div>
              <label className="block text-sm font-medium mb-1">Profile Image (Optional)</label>
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
            </div>

            <div className="w-full flex justify-between mt-4">
              <Button
                variant="outline"
                type="button"
                onClick={handleReset}
                disabled={isSubmitting || uploading}
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || uploading}
              >
                {uploading ? 'Uploading...' : isSubmitting ? 'Creating account...' : 'Sign Up'}
              </Button>
            </div>
          </Fieldset>
        </form>
      </div>
    </div>
  );
}
