# Memory Piece Unlink Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace memory piece deletion with unlink operation that removes the piece from only the current unit, with conditional full deletion for orphaned pieces.

**Architecture:** Add a new database API function `removeMemoryPieceFromUnit()` that removes the unit reference from a memory piece's units array. The API route will call this function and return the status (removed/orphaned). The UI will handle orphaned pieces with a two-step confirmation dialog.

**Tech Stack:** Next.js 15, TypeScript, MongoDB/Mongoose, React 19, Heroicons

---

## Task 1: Add Database API Function for Unlinking

**Files:**
- Modify: `src/lib/db/api/memory-piece.ts:147` (add new function after searchMemoryPieces)

**Step 1: Write the function signature and JSDoc**

Add after the `searchMemoryPieces` function:

```typescript
/**
 * Remove a memory piece from a specific unit.
 * Returns the status of the operation and whether the piece is now orphaned.
 */
export async function removeMemoryPieceFromUnit(memoryPieceId: string, unitId: string): Promise<{
  success: boolean;
  status: 'removed' | 'orphaned' | 'not_found';
  memoryPiece?: any;
}> {
  await connectDB();

  const memoryPiece = await MemoryPiece.findById(memoryPieceId);

  if (!memoryPiece) {
    return { success: false, status: 'not_found' };
  }

  // Remove the unit from the units array
  const initialUnitsCount = memoryPiece.units?.length || 0;
  memoryPiece.units = memoryPiece.units?.filter(
    (id: any) => id.toString() !== unitId
  ) || [];

  await memoryPiece.save();

  // Check if orphaned (no units left)
  if (memoryPiece.units.length === 0) {
    return {
      success: true,
      status: 'orphaned',
      memoryPiece
    };
  }

  return {
    success: true,
    status: 'removed',
    memoryPiece
  };
}
```

**Step 2: Commit the database API change**

```bash
git add src/lib/db/api/memory-piece.ts
git commit -m "feat: add removeMemoryPieceFromUnit function

Adds new function to unlink memory piece from unit without deleting it.
Returns status indicating if piece is orphaned after unlink.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 2: Update API Route to Handle Unlink Operation

**Files:**
- Modify: `src/app/api/admin/memory-pieces/route.ts:59-101` (DELETE handler)

**Step 1: Import the new function**

Add to imports at line 5:

```typescript
import { updateMemoryPiece, deleteMemoryPiece, removeMemoryPieceFromUnit } from '@/lib/db/api/memory-piece';
```

**Step 2: Update DELETE handler to support unlink**

Replace the DELETE function (lines 59-101) with:

```typescript
// DELETE - Delete memory piece or unlink from unit
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const subjectId = searchParams.get('subjectId');
    const unitId = searchParams.get('unitId');

    if (!id) {
      return NextResponse.json(
        { error: 'Memory piece ID is required' },
        { status: 400 }
      );
    }

    if (!subjectId) {
      return NextResponse.json(
        { error: 'Subject ID is required' },
        { status: 400 }
      );
    }

    const canManage = await hasPermission(session.user.id, 'manage_content', subjectId);
    if (!canManage) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // If unitId provided, unlink from unit; otherwise full delete
    if (unitId) {
      const result = await removeMemoryPieceFromUnit(id, unitId);

      if (!result.success) {
        return NextResponse.json(
          { error: 'Memory piece not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        id,
        status: result.status,
        message: result.status === 'orphaned'
          ? 'Memory piece unlinked. It is not linked to any other units.'
          : 'Memory piece unlinked from unit successfully.'
      });
    } else {
      // Full delete (for orphaned pieces)
      await deleteMemoryPiece(id);
      return NextResponse.json({ success: true, id, status: 'deleted' });
    }
  } catch (error) {
    console.error('Delete/unlink memory piece error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to delete/unlink memory piece', details: errorMessage },
      { status: 500 }
    );
  }
}
```

**Step 3: Commit the API route changes**

```bash
git add src/app/api/admin/memory-pieces/route.ts
git commit -m "feat: support unlink operation in DELETE endpoint

Updates DELETE handler to unlink memory piece from unit when unitId provided.
Falls back to full deletion when unitId not provided (for orphaned pieces).

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 3: Update UI Component - Part 1 (Unlink Handler)

**Files:**
- Modify: `src/app/components/ContentManagement.tsx:61-86` (handleMemoryPieceDelete)

**Step 1: Find available unlink icon from Heroicons**

Check what's available:

```bash
grep -r "LinkIcon\|UnlinkIcon\|Link.*Icon" node_modules/@heroicons/react/24/outline/index.d.ts | head -20
```

Expected: Should find LinkSlashIcon or similar

**Step 2: Update imports to include unlink icon**

At line 3, update the import:

```typescript
import { PencilIcon, LinkSlashIcon } from '@heroicons/react/24/outline';
```

**Step 3: Replace handleMemoryPieceDelete with handleMemoryPieceUnlink**

Replace the function at lines 61-86:

```typescript
const handleMemoryPieceUnlink = async (memoryPieceId: string, content: string) => {
  // First confirmation: unlink from this unit
  if (!confirm(`Remove "${content}" from this unit?`)) {
    return;
  }

  setDeletingId(memoryPieceId);
  try {
    const unitId = props.type === 'unit' ? props.unitId : undefined;

    if (!unitId) {
      toast.error('Cannot unlink: Unit ID not available');
      return;
    }

    const subjectId = props.subjectId;
    const response = await fetch(
      `/api/admin/memory-pieces?id=${memoryPieceId}&subjectId=${subjectId}&unitId=${unitId}`,
      { method: 'DELETE' }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || error.error || 'Failed to unlink memory piece');
    }

    const result = await response.json();

    // If orphaned, ask if user wants to delete completely
    if (result.status === 'orphaned') {
      if (confirm(`"${content}" is not linked to any other units. Do you want to delete it completely?`)) {
        // Delete the orphaned memory piece
        const deleteResponse = await fetch(
          `/api/admin/memory-pieces?id=${memoryPieceId}&subjectId=${subjectId}`,
          { method: 'DELETE' }
        );

        if (!deleteResponse.ok) {
          const error = await deleteResponse.json();
          throw new Error(error.details || error.error || 'Failed to delete memory piece');
        }

        toast.success('Memory piece deleted completely');
      } else {
        toast.success('Memory piece unlinked (kept as orphaned)');
      }
    } else {
      toast.success('Memory piece unlinked from this unit');
    }

    window.location.reload();
  } catch (error) {
    console.error('Unlink error:', error);
    toast.error('Failed to unlink memory piece');
  } finally {
    setDeletingId(null);
  }
};
```

**Step 4: Commit the handler update**

```bash
git add src/app/components/ContentManagement.tsx
git commit -m "feat: replace delete handler with unlink handler

Implements two-step confirmation for orphaned memory pieces.
Shows appropriate messages based on unlink status.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 4: Update UI Component - Part 2 (Icon and Button)

**Files:**
- Modify: `src/app/components/ContentManagement.tsx:248-255` (unlink button in memory pieces list)

**Step 1: Update the button to use new icon and handler**

Replace lines 248-255:

```typescript
                  <button
                    onClick={() => handleMemoryPieceUnlink(piece._id?.toString(), piece.content)}
                    disabled={deletingId === piece._id?.toString()}
                    className="p-2 text-orange-600 hover:bg-orange-50 rounded disabled:opacity-50"
                    title="Unlink from this unit"
                  >
                    <LinkSlashIcon className="w-4 h-4" />
                  </button>
```

**Step 2: Test the UI changes manually**

```bash
npm run dev
```

1. Navigate to a unit with memory pieces
2. Verify unlink icon appears (link-slash instead of trash)
3. Verify tooltip says "Unlink from this unit"
4. Click unlink and verify confirmation message
5. Test with memory piece in multiple units (should just unlink)
6. Test with memory piece in single unit (should show second confirmation)

**Step 3: Commit the UI changes**

```bash
git add src/app/components/ContentManagement.tsx
git commit -m "feat: update UI to use unlink icon and handler

Replaces trash icon with link-slash icon.
Updates button styling and tooltip to reflect unlink operation.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 5: Manual Testing and Verification

**Step 1: Set up test data**

Create a test scenario with:
1. One memory piece linked to multiple units
2. One memory piece linked to a single unit

**Step 2: Test unlink for shared memory piece**

1. Navigate to unit with shared memory piece
2. Click unlink icon
3. Verify confirmation: "Remove '[content]' from this unit?"
4. Confirm
5. Verify toast: "Memory piece unlinked from this unit"
6. Verify memory piece still exists in other unit
7. Verify memory piece removed from current unit

**Step 3: Test unlink for single-unit memory piece (keep orphaned)**

1. Navigate to unit with single-unit memory piece
2. Click unlink icon
3. Verify first confirmation: "Remove '[content]' from this unit?"
4. Confirm
5. Verify second confirmation: "'[content]' is not linked to any other units. Do you want to delete it completely?"
6. Click Cancel/No
7. Verify toast: "Memory piece unlinked (kept as orphaned)"
8. Verify memory piece removed from unit view

**Step 4: Test unlink for single-unit memory piece (delete completely)**

1. Navigate to unit with single-unit memory piece
2. Click unlink icon
3. Confirm first dialog
4. Confirm second dialog (delete completely)
5. Verify toast: "Memory piece deleted completely"
6. Verify memory piece does not appear anywhere

**Step 5: Test permissions**

1. Test as user without `manage_content` permission
2. Verify unlink button not visible or disabled
3. Verify API returns 403 if accessed directly

**Step 6: Document test results**

Create `docs/testing/2026-03-29-memory-piece-unlink-tests.md` with test results.

**Step 7: Final commit**

```bash
git add docs/testing/2026-03-29-memory-piece-unlink-tests.md
git commit -m "docs: add testing documentation for memory piece unlink

Documents manual testing scenarios and results.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 6: Update CLAUDE.md Documentation

**Files:**
- Modify: `CLAUDE.md` (add note about unlink behavior)

**Step 1: Add documentation about unlink behavior**

Find the section about "Data Model Hierarchy" and add after the MemoryPiece description:

```markdown
   - Can belong to multiple units
   - Unlinking from a unit removes the unit reference, not the memory piece itself
   - Orphaned memory pieces (no unit associations) are kept and remain searchable
```

**Step 2: Commit documentation update**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with memory piece unlink behavior

Clarifies that unlinking removes unit reference, not the piece itself.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Success Criteria

- ✓ Memory piece unlink removes only the unit association
- ✓ Memory pieces in multiple units unlink without additional confirmation
- ✓ Memory pieces in single unit prompt for deletion with two-step confirmation
- ✓ Orphaned memory pieces remain searchable if not deleted
- ✓ UI shows unlink icon instead of trash icon
- ✓ All existing permissions checks still work
- ✓ Existing subscriptions remain valid after unlink

## Notes

- This implementation maintains backward compatibility with subscriptions
- Orphaned memory pieces provide flexibility for content reorganization
- The two-step confirmation prevents accidental data loss
- The unlink icon provides clearer visual indication of the operation
