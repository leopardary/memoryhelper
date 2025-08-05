'use client';

import { useState } from 'react';
import ImageUploader from '@/app/components/ImageUploader';
import Image from "next/image";

export default function Page() {
  const [imageUrl, setImageUrl] = useState('');

  return (
    <div className="max-w-md mx-auto p-4">
      <ImageUploader onUploaded={setImageUrl} />
      {imageUrl && (
        <Image src={imageUrl} alt="Uploaded" className="mt-4 rounded-lg shadow" />
      )}
    </div>
  );
}