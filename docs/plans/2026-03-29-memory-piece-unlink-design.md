# Memory Piece Unlink from Unit - Design Document

**Date**: 2026-03-29
**Status**: Approved

## Problem Statement

Currently, when an administrator deletes a memory piece from a unit view, the entire memory piece is deleted from the database. This affects all units that contain the memory piece, which is incorrect behavior.

The expected behavior is to remove the memory piece from only the current unit (unlink), not delete it entirely.

## Root Cause

The deletion flow currently performs a hard delete:

1. UI Component (`ContentManagement.tsx`) calls DELETE endpoint
2. API Route (`/api/admin/memory-pieces/route.ts`) calls `deleteMemoryPiece(id)`
3. Database API (`memory-piece.ts`) executes `MemoryPiece.findByIdAndDelete(id)`

The relationship structure is:
- MemoryPiece has a `units` array field containing Unit ObjectIds (many-to-many)
- Unit has a virtual `memoryPieces` field querying MemoryPieces where `units` contains the unit's ID
- The relationship is stored in the MemoryPiece document

## Solution Design

### Core Behavior

When an administrator clicks the unlink icon on a memory piece within a unit:

1. **Remove the relationship**: Remove the unit ID from the memory piece's `units` array
2. **Check if orphaned**: After unlinking, check if the memory piece has any remaining unit associations
3. **Handle orphaned pieces**:
   - If this was the **only unit**, show a confirmation dialog: "This memory piece is not linked to any other units. Do you want to delete it completely?"
     - Yes → Delete the memory piece from the database
     - No → Keep the orphaned memory piece (findable via search but not displayed in any unit)
4. **Handle shared pieces**: If the memory piece belongs to **other units**, simply remove from current unit without additional confirmation

### UI Changes

1. **Icon change**: Replace `TrashIcon` with an unlink/disconnect icon from Heroicons
   - Visual indication of "removing relationship" rather than "deleting"

2. **Button attributes**:
   - Title: "Unlink from this unit" (instead of "Delete memory piece")

3. **Confirmation messages**:
   - For shared pieces: "Remove '[content]' from this unit? It will remain in other units."
   - For last unit: Two-step confirmation:
     1. Initial unlink confirmation
     2. If it's the only unit: "This memory piece is not linked to any other units. Do you want to delete it completely?"

### Implementation Components

#### 1. Database API Layer (`src/lib/db/api/memory-piece.ts`)

Add new function:
```typescript
removeMemoryPieceFromUnit(memoryPieceId: string, unitId: string)
```

Logic:
- Find the memory piece by ID
- Remove unitId from its `units` array using MongoDB `$pull` operator
- Check if `units` array is now empty
- Return status indicating: "removed" | "orphaned" | "deleted"

#### 2. API Route (`src/app/api/admin/memory-pieces/route.ts`)

Modify DELETE handler:
- Accept `unitId` query parameter (required)
- Call `removeMemoryPieceFromUnit(id, unitId)`
- Return response with status information for UI handling

#### 3. UI Component (`src/app/components/ContentManagement.tsx`)

Modify `handleMemoryPieceDelete`:
- Rename to `handleMemoryPieceUnlink` for clarity
- Pass `unitId` in DELETE request
- Handle response status:
  - If "removed": Show success message, reload
  - If "orphaned": Show second confirmation dialog asking if user wants to delete completely
    - If yes: Make second DELETE call without unitId (full delete)
    - If no: Just reload (piece is now orphaned)

Update UI elements:
- Replace `TrashIcon` with unlink icon
- Update button title to "Unlink from this unit"
- Update confirmation message based on context

### Data Flow

**Happy Path (Memory Piece in Multiple Units)**:
1. User clicks unlink icon
2. Confirmation: "Remove '[content]' from this unit? It will remain in other units."
3. API removes unitId from memory piece's `units` array
4. Success message: "Memory piece unlinked from this unit"
5. Page reloads

**Special Case (Memory Piece in Single Unit)**:
1. User clicks unlink icon
2. First confirmation: "Remove '[content]' from this unit?"
3. API removes unitId, detects orphaned status
4. Second confirmation: "This memory piece is not linked to any other units. Do you want to delete it completely?"
5. If Yes: Delete memory piece entirely
6. If No: Keep as orphaned (searchable but not in any unit)
7. Reload with appropriate success message

### Considerations

**Subscriptions**: Memory pieces may have existing user subscriptions. When a memory piece is unlinked or deleted:
- Subscriptions remain valid (users can still practice)
- This is acceptable as subscriptions are user-specific learning data

**Orphaned Memory Pieces**: Memory pieces with no unit associations:
- Remain in database
- Can be found via search
- Can be re-linked to units later
- This provides flexibility for content reorganization

**Permissions**: Existing permission checks (`manage_content` on subject) remain unchanged.

## Testing Strategy

Test cases:
1. Memory piece in single unit → unlink prompts for deletion
2. Memory piece in multiple units → unlink only removes from current unit
3. User declines deletion of orphaned piece → piece remains searchable
4. Memory piece with existing subscriptions → handles gracefully
5. Permission checks still work correctly
6. UI shows correct icon and messages

## Files to Modify

1. `src/lib/db/api/memory-piece.ts` - Add `removeMemoryPieceFromUnit()`
2. `src/app/api/admin/memory-pieces/route.ts` - Update DELETE handler
3. `src/app/components/ContentManagement.tsx` - Update UI and handler logic
