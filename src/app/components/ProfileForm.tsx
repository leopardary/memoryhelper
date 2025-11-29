'use client'
import { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { X } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileForm() {
  const { data: session, update } = useSession();
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isOAuthUser, setIsOAuthUser] = useState(false);

  useEffect(() => {
    // Fetch user profile data
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          setName(data.user.name || '');
          setImageUrl(data.user.imageUrl || '');
          setIsOAuthUser(data.isOAuthUser);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
  }, []);

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
      // Get file extension
      const fileExtension = file.name.split('.').pop();
      const userId = session?.user?.id;

      if (!userId) {
        throw new Error('User ID not found');
      }

      // Create unique filename with user ID and timestamp
      const uniqueFileName = `${userId}-${Date.now()}.${fileExtension}`;

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
  }, [session?.user?.id]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password fields if changing password
    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        toast.error('Please fill in all password fields');
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }
      if (newPassword.length < 6) {
        toast.error('New password must be at least 6 characters');
        return;
      }
    }

    setLoading(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          imageUrl,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Failed to update profile');
      }

      toast.success('Profile updated successfully!');

      // Update session
      await update({
        name,
        image: imageUrl,
      });

      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeregister = async () => {
    const confirmed = confirm(
      'Are you sure you want to delete your account?\n\n' +
      'WARNING: This action will permanently delete:\n' +
      '- Your profile and account information\n' +
      '- All your subscriptions and memory checks\n' +
      '- Your role assignments\n' +
      '- All associated data\n\n' +
      'This action CANNOT be undone!'
    );

    if (!confirmed) return;

    const doubleConfirm = confirm(
      'This is your last chance to cancel.\n\n' +
      'Type your name in the next dialog to confirm deletion.'
    );

    if (!doubleConfirm) return;

    const typedName = prompt('Please type your name to confirm:');
    if (typedName !== name) {
      toast.error('Name does not match. Account deletion cancelled.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/user/deregister', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Failed to delete account');
      }

      toast.success('Your account has been successfully deleted. You will now be signed out.');

      // Sign out and redirect to home
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Deregister error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Information Section */}
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label className="block mb-2 font-medium">Name</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 disabled:bg-muted disabled:cursor-not-allowed"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isOAuthUser}
              required
            />
            {isOAuthUser && (
              <p className="text-sm text-muted-foreground mt-1">
                Name is managed by your OAuth provider
              </p>
            )}
          </div>

          {/* Email Field (Read-only) */}
          <div>
            <label className="block mb-2 font-medium">Email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2 bg-muted"
              value={session?.user?.email || ''}
              disabled
            />
            <p className="text-sm text-muted-foreground mt-1">Email cannot be changed</p>
          </div>

          {/* Profile Image */}
          <div>
            <label className="block mb-2 font-medium">Profile Image</label>

            {isOAuthUser ? (
              <div>
                {imageUrl && (
                  <div className="flex items-start gap-4">
                    <Image
                      src={imageUrl}
                      alt="Profile"
                      width={128}
                      height={128}
                      className="rounded-full object-cover"
                    />
                  </div>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  Profile image is managed by your OAuth provider
                </p>
              </div>
            ) : (
              <>
                {imageUrl ? (
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <Image
                        src={imageUrl}
                        alt="Profile"
                        width={128}
                        height={128}
                        className="rounded-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-1 rounded-full shadow hover:bg-destructive/90"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-2">
                        Click the X button to remove your current image
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    {!uploading && (
                      <div
                        {...getRootProps()}
                        className="border-2 border-dashed p-6 rounded-xl text-center cursor-pointer hover:bg-muted"
                      >
                        <input {...getInputProps()} />
                        <p className="text-muted-foreground">
                          {isDragActive
                            ? 'Drop the image here...'
                            : 'Drag & drop an image or click to upload'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Maximum size: 5MB
                        </p>
                      </div>
                    )}

                    {uploading && (
                      <div className="flex justify-center py-6">
                        <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Password Change Section */}
          {!isOAuthUser && (
            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-medium">Current Password</label>
                  <input
                    type="password"
                    className="w-full border rounded px-3 py-2"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium">New Password</label>
                  <input
                    type="password"
                    className="w-full border rounded px-3 py-2"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full border rounded px-3 py-2"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>
          )}

          {isOAuthUser && (
            <div className="pt-4 border-t">
              <div className="bg-muted p-4 rounded">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> You are signed in with OAuth. Your name, profile image, and password are managed by your OAuth provider (e.g., Google) and cannot be changed here.
                </p>
              </div>
            </div>
          )}

          {/* Save Button - only show for non-OAuth users */}
          {!isOAuthUser && (
            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-card p-6 rounded-lg border border-destructive">
        <h2 className="text-xl font-semibold mb-4 text-destructive">Danger Zone</h2>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Once you delete your account, there is no going back. This will permanently
            delete all your data including subscriptions, memory checks, and role assignments.
          </p>
          <button
            type="button"
            onClick={handleDeregister}
            disabled={loading}
            className="w-full bg-destructive text-destructive-foreground px-4 py-2 rounded hover:bg-destructive/90 disabled:opacity-50"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
