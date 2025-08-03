'use client';

import { useState } from 'react';
import ImageUploader from '@/app/components/ImageUploader';

export default function Page() {
  const [imageUrl, setImageUrl] = useState('');

  return (
    <div className="max-w-md mx-auto p-4">
      <ImageUploader onUploaded={setImageUrl} />
      {imageUrl && (
        <img src={imageUrl} alt="Uploaded" className="mt-4 rounded-lg shadow" />
      )}
    </div>
  );
}