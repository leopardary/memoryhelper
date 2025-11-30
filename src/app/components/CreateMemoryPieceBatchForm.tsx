'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Plus, Loader2, Sparkles, CheckCircle2, Download } from 'lucide-react';
import Image from "next/image";
import { toast } from 'sonner';

export type UploadedImage = {
  url: string;
  key: string;
};

interface MemoryPieceRow {
  id: string;
  content: string;
  description: string;
  labels: string[];
  images: UploadedImage[];
  generating: boolean;
  uploading: boolean;
  checking: boolean;
  exists: boolean;
  autoFetching: boolean;
}

export interface CreateMemoryPieceBatchFormProps {
  unitId: string;
  unitPath: string;
  submitCallback?: () => void;
}

export default function CreateMemoryPieceBatchForm({
  unitId,
  unitPath,
  submitCallback
}: CreateMemoryPieceBatchFormProps) {
  const [rows, setRows] = useState<MemoryPieceRow[]>([
    {
      id: crypto.randomUUID(),
      content: '',
      description: '',
      labels: [],
      images: [],
      generating: false,
      uploading: false,
      checking: false,
      exists: false,
      autoFetching: false,
    }
  ]);
  const [allLabels, setAllLabels] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [labelSuggestions, setLabelSuggestions] = useState<Record<string, string[]>>({});
  const [labelInput, setLabelInput] = useState<Record<string, string>>({});
  const checkTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  // Fetch existing labels for autocomplete
  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const res = await fetch('/api/memory-pieces/labels');
        const data = await res.json();
        setAllLabels(data.labels || []);
      } catch (error) {
        console.error('Failed to fetch labels:', error);
      }
    };
    fetchLabels();
  }, []);

  const addRow = () => {
    setRows([...rows, {
      id: crypto.randomUUID(),
      content: '',
      description: '',
      labels: [],
      images: [],
      generating: false,
      uploading: false,
      checking: false,
      exists: false,
      autoFetching: false,
    }]);
  };

  // Check if memory piece exists and prefill data
  const checkExistingMemoryPiece = async (rowId: string, content: string) => {
    if (!content || content.trim().length === 0) {
      updateRow(rowId, { exists: false, checking: false });
      return;
    }

    updateRow(rowId, { checking: true });

    try {
      const res = await fetch(`/api/memory-pieces/check?content=${encodeURIComponent(content.trim())}`);
      const data = await res.json();

      if (data.exists && data.memoryPiece) {
        // Convert imageUrls to UploadedImage format
        const existingImages: UploadedImage[] = data.memoryPiece.imageUrls.map((url: string) => {
          // Extract key from URL
          const urlObj = new URL(url);
          const key = urlObj.pathname.substring(1); // Remove leading slash
          return { url, key };
        });

        updateRow(rowId, {
          exists: true,
          checking: false,
          description: data.memoryPiece.description || '',
          labels: data.memoryPiece.labels || [],
          images: existingImages,
        });
      } else {
        updateRow(rowId, { exists: false, checking: false });
      }
    } catch (error) {
      console.error('Error checking memory piece:', error);
      updateRow(rowId, { checking: false });
    }
  };

  // Debounced content change handler
  const handleContentChange = (rowId: string, content: string) => {
    updateRow(rowId, { content });

    // Clear existing timeout for this row
    if (checkTimeouts.current[rowId]) {
      clearTimeout(checkTimeouts.current[rowId]);
    }

    // Set new timeout to check after 500ms of no typing
    checkTimeouts.current[rowId] = setTimeout(() => {
      checkExistingMemoryPiece(rowId, content);
    }, 500);
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(checkTimeouts.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  const removeRow = (id: string) => {
    setRows(prevRows => {
      if (prevRows.length === 1) {
        toast.error('Cannot remove the last row');
        return prevRows;
      }
      return prevRows.filter(row => row.id !== id);
    });
  };

  const updateRow = (id: string, updates: Partial<MemoryPieceRow>) => {
    setRows(prevRows => prevRows.map(row => row.id === id ? { ...row, ...updates } : row));
  };

  const handleGenerate = async (rowId: string, content: string) => {
    if (!content) {
      toast.error("请先输入 content");
      return;
    }

    updateRow(rowId, { generating: true });

    try {
      const res = await fetch("/api/generate-chinese-character-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (res.ok) {
        updateRow(rowId, { description: data.description, generating: false });
        toast.success("Description generated successfully");
      } else {
        toast.error(data.error || "生成失败");
        updateRow(rowId, { generating: false });
      }
    } catch (err) {
      console.error(err);
      toast.error("生成描述时出错");
      updateRow(rowId, { generating: false });
    }
  };

  const handleImageUpload = async (rowId: string, content: string, acceptedFiles: File[]) => {
    if (!content) {
      toast.error('请先输入 content');
      return;
    }

    updateRow(rowId, { uploading: true });

    const row = rows.find(r => r.id === rowId);
    if (!row) return;

    const newImages: UploadedImage[] = [...row.images];

    for (const file of acceptedFiles) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) continue; // 5MB max

      const key = unitPath + '/' + content + '/' + file.name;
      try {
        const res = await fetch('/api/s3/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            filePath: unitPath + '/' + content
          }),
        });

        const { uploadUrl, publicUrl } = await res.json();

        await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });

        newImages.push({ url: publicUrl, key });
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }

    updateRow(rowId, { images: newImages, uploading: false });
  };

  const handleAutoFetchImage = async (rowId: string, content: string) => {
    if (!content) {
      toast.error('请先输入 content');
      return;
    }

    updateRow(rowId, { autoFetching: true });

    try {
      const res = await fetch('/api/auto-fetch-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: content,
          filePath: unitPath + '/' + content,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.details || error.error || 'Failed to fetch image');
      }

      const { imageUrl, key } = await res.json();

      // Add the fetched image to the row
      const row = rows.find(r => r.id === rowId);
      if (row) {
        updateRow(rowId, {
          images: [...row.images, { url: imageUrl, key }],
          autoFetching: false,
        });
      }
    } catch (error) {
      console.error('Auto-fetch failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to auto-fetch image');
      updateRow(rowId, { autoFetching: false });
    }
  };

  const removeImage = async (rowId: string, key: string) => {
    try {
      await fetch('/api/s3/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });

      const row = rows.find(r => r.id === rowId);
      if (row) {
        updateRow(rowId, {
          images: row.images.filter(img => img.key !== key)
        });
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleLabelInputChange = (rowId: string, value: string) => {
    setLabelInput({ ...labelInput, [rowId]: value });

    // Filter suggestions
    if (value.trim()) {
      const suggestions = allLabels.filter(label =>
        label.toLowerCase().includes(value.toLowerCase())
      );
      setLabelSuggestions({ ...labelSuggestions, [rowId]: suggestions });
    } else {
      setLabelSuggestions({ ...labelSuggestions, [rowId]: [] });
    }
  };

  const addLabel = (rowId: string, label: string) => {
    const row = rows.find(r => r.id === rowId);
    if (row && label.trim() && !row.labels.includes(label.trim())) {
      updateRow(rowId, { labels: [...row.labels, label.trim()] });
    }
    setLabelInput({ ...labelInput, [rowId]: '' });
    setLabelSuggestions({ ...labelSuggestions, [rowId]: [] });
  };

  const removeLabel = (rowId: string, label: string) => {
    const row = rows.find(r => r.id === rowId);
    if (row) {
      updateRow(rowId, { labels: row.labels.filter(l => l !== label) });
    }
  };

  const handleSubmit = async () => {
    // Validate that at least one row has content and images
    const validRows = rows.filter(row =>
      row.content.trim() && row.images.length > 0
    );

    if (validRows.length === 0) {
      toast.error('Please add at least one memory piece with content and images');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/admin/memory-pieces/create-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitId,
          memoryPieces: validRows.map(row => ({
            content: row.content,
            description: row.description,
            imageUrls: row.images.map(img => img.url),
            labels: row.labels,
          }))
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Failed to create memory pieces');
      }

      const result = await response.json();
      toast.success(`Successfully created ${result.count} memory pieces!`);
      window.location.reload();
    } catch (error) {
      console.error('Batch create error:', error);
      toast.error('Failed to create memory pieces');
    } finally {
      setSubmitting(false);
    }

    submitCallback?.();
  };

  const RowImageDropzone = ({ row }: { row: MemoryPieceRow }) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
      handleImageUpload(row.id, row.content, acceptedFiles);
    }, [row.id, row.content]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      multiple: true,
      accept: { 'image/*': [] },
      disabled: !row.content || row.uploading,
    });

    return (
      <div className="w-full space-y-1">
        {!row.uploading && !row.autoFetching && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed p-2 rounded text-center cursor-pointer hover:bg-muted text-xs ${
              !row.content ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <input {...getInputProps()} />
            <p className="text-muted-foreground">
              {isDragActive ? 'Drop...' : 'Drop/Click'}
            </p>
          </div>
        )}

        {(row.uploading || row.autoFetching) && (
          <div className="flex justify-center py-2">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        )}

        {/* Auto-fetch button */}
        {!row.uploading && !row.autoFetching && (
          <button
            type="button"
            onClick={() => handleAutoFetchImage(row.id, row.content)}
            disabled={!row.content}
            className="w-full text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 disabled:bg-gray-400 flex items-center justify-center gap-1"
            title="Auto-fetch from Baidu Hanyu"
          >
            <Download className="w-3 h-3" />
            Auto-Fetch
          </button>
        )}

        {row.images.length > 0 && (
          <div className="mt-2 flex gap-1 flex-wrap">
            {row.images.map(img => (
              <div key={img.key} className="relative group w-12 h-12">
                <Image
                  src={img.url}
                  alt="Uploaded"
                  className="w-full h-full object-cover rounded"
                  width={48}
                  height={48}
                />
                <button
                  type="button"
                  onClick={() => removeImage(row.id, img.key)}
                  className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground p-0.5 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-2 h-2" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 w-full">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left text-sm font-medium">Content</th>
              <th className="p-2 text-left text-sm font-medium">Description</th>
              <th className="p-2 text-left text-sm font-medium">Labels</th>
              <th className="p-2 text-left text-sm font-medium">Images</th>
              <th className="p-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b">
                {/* Content */}
                <td className="p-2 align-top">
                  <div className="relative">
                    <input
                      type="text"
                      className={`w-full border rounded px-2 py-1 text-sm pr-8 ${
                        row.exists ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''
                      }`}
                      value={row.content}
                      onChange={(e) => handleContentChange(row.id, e.target.value)}
                      placeholder="Content"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      {row.checking && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                      {!row.checking && row.exists && (
                        <div title="Existing memory piece - data prefilled">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Description */}
                <td className="p-2 align-top">
                  <div className="space-y-1">
                    <textarea
                      className={`w-full border rounded px-2 py-1 text-sm min-h-[60px] ${
                        row.exists ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''
                      }`}
                      value={row.description}
                      onChange={(e) => updateRow(row.id, { description: e.target.value })}
                      placeholder="Description"
                      rows={2}
                    />
                    <button
                      type="button"
                      onClick={() => handleGenerate(row.id, row.content)}
                      disabled={row.generating || !row.content}
                      className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-1"
                    >
                      {row.generating ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      Generate
                    </button>
                  </div>
                </td>

                {/* Labels */}
                <td className="p-2 align-top">
                  <div className="space-y-1 relative">
                    <div className={`flex flex-wrap gap-1 mb-1 min-h-[24px] ${
                      row.exists && row.labels.length > 0 ? 'p-1 border border-green-500 rounded bg-green-50 dark:bg-green-950' : ''
                    }`}>
                      {row.labels.map(label => (
                        <span
                          key={label}
                          className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs px-2 py-0.5 rounded"
                        >
                          {label}
                          <button
                            type="button"
                            onClick={() => removeLabel(row.id, label)}
                            className="hover:text-red-600"
                          >
                            <X className="w-2 h-2" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={labelInput[row.id] || ''}
                      onChange={(e) => handleLabelInputChange(row.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && labelInput[row.id]?.trim()) {
                          e.preventDefault();
                          addLabel(row.id, labelInput[row.id]);
                        }
                      }}
                      placeholder="Add label..."
                    />
                    {labelSuggestions[row.id]?.length > 0 && (
                      <div className="absolute z-10 w-full bg-popover border rounded-md shadow-lg max-h-32 overflow-y-auto">
                        {labelSuggestions[row.id].map(suggestion => (
                          <button
                            key={suggestion}
                            type="button"
                            className="w-full text-left px-2 py-1 text-sm hover:bg-muted"
                            onClick={() => addLabel(row.id, suggestion)}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>

                {/* Images */}
                <td className="p-2 align-top">
                  <div className={row.exists && row.images.length > 0 ? 'p-1 border border-green-500 rounded bg-green-50 dark:bg-green-950' : ''}>
                    <RowImageDropzone row={row} />
                  </div>
                </td>

                {/* Delete */}
                <td className="p-2 align-top">
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Remove row"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Row Button */}
      <div className="flex justify-start">
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-600 rounded hover:bg-blue-50"
        >
          <Plus className="w-4 h-4" />
          Add Row
        </button>
      </div>

      {/* Submit and Cancel */}
      <div className="flex justify-center gap-4 pt-4 border-t">
        <button
          type="button"
          onClick={() => submitCallback?.()}
          className="px-6 py-2 border rounded hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Submit All
        </button>
      </div>
    </div>
  );
}
