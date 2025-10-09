'use client'
import { useState } from 'react';
import AddSubjectModal from '@/app/components/AddSubjectModal';
import EditSubjectModal from '@/app/components/EditSubjectModal';
import { SubjectProps } from '@/lib/db/model/types/Subject.types';
import Image from 'next/image';
import Link from 'next/link';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

interface SubjectManagementProps {
  subjectsData: string;
  findOrCreateSubject: (props: any) => Promise<any>;
  deleteSubject: (id: string) => Promise<any>;
}

export default function SubjectManagement({
  subjectsData,
  findOrCreateSubject,
  deleteSubject
}: SubjectManagementProps) {
  const initialSubjects: SubjectProps[] = JSON.parse(subjectsData);
  const [subjects, setSubjects] = useState<SubjectProps[]>(initialSubjects);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingSubject, setEditingSubject] = useState<SubjectProps | null>(null);

  const handleDelete = async (subjectId: string, subjectTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${subjectTitle}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(subjectId);
    try {
      await deleteSubject(subjectId);
      setSubjects(prev => prev.filter(s => s._id.toString() !== subjectId));
      alert('Subject deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete subject');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSubjectCreated = async (newSubject: SubjectProps) => {
    // Add the new subject to the list without refreshing
    setSubjects(prev => [newSubject, ...prev]);
  };

  const updateSubject = async (id: string, data: any) => {
    const response = await fetch('/api/admin/subjects', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Update failed:', errorData);
      throw new Error(errorData.details || errorData.error || 'Failed to update subject');
    }

    return response.json();
  };

  const handleEditSuccess = () => {
    // Refresh the page to get updated subjects list
    window.location.reload();
  };

  return (
    <div className="space-y-8">
      {/* Create New Subject Section */}
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Create New Subject</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Add a new subject to the application with title, description, images, and labels.
        </p>
        <AddSubjectModal findOrCreateSubject={findOrCreateSubject} onSuccess={handleSubjectCreated} />
      </div>

      {/* Existing Subjects Section */}
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Existing Subjects ({subjects.length})</h2>

        {subjects.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No subjects created yet. Create your first subject above!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <div
                key={subject._id.toString()}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Subject Image */}
                {subject.imageUrls && subject.imageUrls[0] && (
                  <div className="relative h-48 bg-muted">
                    <Image
                      src={subject.imageUrls[0]}
                      alt={subject.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Subject Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{subject.title}</h3>
                  {subject.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {subject.description}
                    </p>
                  )}

                  {/* Labels */}
                  {subject.labels && subject.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {subject.labels.slice(0, 3).map((label, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
                        >
                          {label}
                        </span>
                      ))}
                      {subject.labels.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded">
                          +{subject.labels.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Link
                      href={`/subject/${subject._id}`}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-sm border rounded hover:bg-muted transition-colors"
                    >
                      <EyeIcon className="w-4 h-4" />
                      View
                    </Link>
                    <button
                      onClick={() => setEditingSubject(subject)}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-sm border rounded hover:bg-muted transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(subject._id.toString(), subject.title)}
                      disabled={isDeleting === subject._id.toString()}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 disabled:opacity-50 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                      {isDeleting === subject._id.toString() ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Subject Modal */}
      {editingSubject && (
        <EditSubjectModal
          subject={editingSubject}
          updateSubject={updateSubject}
          isOpen={!!editingSubject}
          onClose={() => setEditingSubject(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
