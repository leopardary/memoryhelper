'use client'
import { useState } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import AddRootUnitModal from '@/app/components/AddRootUnitModal';
import UnitAddContentModal from '@/app/components/UnitAddContentModal';
import EditUnitModal from '@/app/components/EditUnitModal';
import EditMemoryPieceModal from '@/app/components/EditMemoryPieceModal';

interface ContentManagementForSubjectProps {
  type: 'subject';
  subjectId: string;
  subjectTitle: string;
  units: any[];
}

interface ContentManagementForUnitProps {
  type: 'unit';
  unitId: string;
  unitPath: string;
  subjectId: string;
  hasSubUnits: boolean;
  hasMemoryPieces: boolean;
  units?: any[];
  memoryPieces?: any[];
}

type ContentManagementProps = ContentManagementForSubjectProps | ContentManagementForUnitProps;

export default function ContentManagement(props: ContentManagementProps) {
  const [editingUnit, setEditingUnit] = useState<any | null>(null);
  const [editingMemoryPiece, setEditingMemoryPiece] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleUnitDelete = async (unitId: string, unitTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${unitTitle}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(unitId);
    try {
      const response = await fetch(`/api/admin/units?id=${unitId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Failed to delete unit');
      }

      alert('Unit deleted successfully');
      window.location.reload();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete unit');
    } finally {
      setDeletingId(null);
    }
  };

  const handleMemoryPieceDelete = async (memoryPieceId: string, content: string) => {
    if (!confirm(`Are you sure you want to delete "${content}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(memoryPieceId);
    try {
      const subjectId = props.type === 'unit' ? props.subjectId : props.subjectId;
      const response = await fetch(`/api/admin/memory-pieces?id=${memoryPieceId}&subjectId=${subjectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Failed to delete memory piece');
      }

      alert('Memory piece deleted successfully');
      window.location.reload();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete memory piece');
    } finally {
      setDeletingId(null);
    }
  };

  const updateUnit = async (id: string, data: any) => {
    const response = await fetch('/api/admin/units', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || errorData.error || 'Failed to update unit');
    }

    return response.json();
  };

  const updateMemoryPiece = async (id: string, subjectId: string, data: any) => {
    const response = await fetch('/api/admin/memory-pieces', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, subjectId, ...data })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || errorData.error || 'Failed to update memory piece');
    }

    return response.json();
  };

  const handleEditSuccess = () => {
    window.location.reload();
  };

  if (props.type === 'subject') {
    return (
      <div className="w-full flex flex-col gap-4 mb-6">
        {/* Create Unit Button */}
        <div className="w-full flex justify-center">
          <AddRootUnitModal
            subjectTitle={props.subjectTitle}
            subjectId={props.subjectId}
          />
        </div>

        {/* Manage Units */}
        {props.units && props.units.length > 0 && (
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Manage Units</h3>
            <div className="space-y-2">
              {props.units.map((unit) => (
                <div
                  key={unit._id?.toString()}
                  className="flex items-center justify-between p-3 border rounded hover:bg-muted transition-colors"
                >
                  <span className="font-medium">{unit.title}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingUnit(unit)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit unit"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleUnitDelete(unit._id?.toString(), unit.title)}
                      disabled={deletingId === unit._id?.toString()}
                      className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                      title="Delete unit"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit Unit Modal */}
        {editingUnit && (
          <EditUnitModal
            unit={editingUnit}
            unitPath={`Home/${props.subjectTitle}`}
            updateUnit={updateUnit}
            isOpen={!!editingUnit}
            onClose={() => setEditingUnit(null)}
            onSuccess={handleEditSuccess}
          />
        )}
      </div>
    );
  }

  // For unit pages
  return (
    <div className="w-full flex flex-col gap-4 mb-6">
      {/* Create Content Button */}
      <div className="w-full flex justify-center">
        <UnitAddContentModal
          unitId={props.unitId}
          hasSubUnits={props.hasSubUnits}
          hasMemoryPieces={props.hasMemoryPieces}
          unitPath={props.unitPath}
        />
      </div>

      {/* Manage Sub Units */}
      {props.units && props.units.length > 0 && (
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Manage Sub Units</h3>
          <div className="space-y-2">
            {props.units.map((unit: any) => (
              <div
                key={unit._id?.toString()}
                className="flex items-center justify-between p-3 border rounded hover:bg-muted transition-colors"
              >
                <span className="font-medium">{unit.title}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingUnit(unit)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit unit"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleUnitDelete(unit._id?.toString(), unit.title)}
                    disabled={deletingId === unit._id?.toString()}
                    className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                    title="Delete unit"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manage Memory Pieces */}
      {props.memoryPieces && props.memoryPieces.length > 0 && (
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Manage Memory Pieces</h3>
          <div className="space-y-2">
            {props.memoryPieces.map((piece: any) => (
              <div
                key={piece._id?.toString()}
                className="flex items-center justify-between p-3 border rounded hover:bg-muted transition-colors"
              >
                <span className="font-medium truncate flex-1">{piece.content}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingMemoryPiece(piece)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit memory piece"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMemoryPieceDelete(piece._id?.toString(), piece.content)}
                    disabled={deletingId === piece._id?.toString()}
                    className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                    title="Delete memory piece"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Unit Modal */}
      {editingUnit && (
        <EditUnitModal
          unit={editingUnit}
          unitPath={props.unitPath}
          updateUnit={updateUnit}
          isOpen={!!editingUnit}
          onClose={() => setEditingUnit(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Edit Memory Piece Modal */}
      {editingMemoryPiece && (
        <EditMemoryPieceModal
          memoryPiece={editingMemoryPiece}
          unitPath={props.unitPath}
          subjectId={props.subjectId}
          updateMemoryPiece={updateMemoryPiece}
          isOpen={!!editingMemoryPiece}
          onClose={() => setEditingMemoryPiece(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
