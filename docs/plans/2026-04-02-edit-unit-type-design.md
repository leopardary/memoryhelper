# Edit Unit Type Field Design

**Date:** 2026-04-02
**Feature:** Add type field editing to the Edit Unit modal

## Overview

Add the ability to edit a unit's type (module/chapter/lesson) through the EditUnitModal, with a warning banner when the unit has children to alert users about potential hierarchy changes.

## Requirements

- Add type dropdown to EditUnitModal
- Initialize dropdown with current unit type
- Show warning banner if unit has child units
- Allow changing type (warn but allow approach)
- Validate type on API route
- Maintain consistency with create forms

## Design Approach

**Approach 1: Simple Dropdown with Warning Banner** (selected)

Add a type dropdown that shows current value, and display a static warning banner if the unit has children. This approach:
- Is consistent with existing create forms
- Fast to implement and maintain
- Non-blocking but informative
- Follows "warn but allow" principle

## Implementation Details

### 1. Component Changes - EditUnitModal

**File:** `src/app/components/EditUnitModal.tsx`

#### Update UnitData Interface
Add type and children fields:
```typescript
interface UnitData {
  _id: string;
  title: string;
  description?: string;
  imageUrls?: string[];
  type: 'chapter' | 'lesson' | 'module';
  children?: any[];
}
```

#### Add Type State
Initialize from unit data:
```typescript
const [type, setType] = useState<'module' | 'chapter' | 'lesson'>(unit.type);
```

#### Add Type Dropdown
Position after Description field, before Images:
```typescript
<div>
  <label className="block mb-1 font-medium">Type</label>
  <select
    className="w-full border rounded px-3 py-2"
    value={type}
    onChange={e => setType(e.target.value as 'module' | 'chapter' | 'lesson')}
    required
  >
    <option value="module">Module</option>
    <option value="chapter">Chapter</option>
    <option value="lesson">Lesson</option>
  </select>
</div>
```

#### Add Warning Banner
Show conditionally if unit has children:
```typescript
{unit.children && unit.children.length > 0 && (
  <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded flex gap-2 items-start">
    <span className="text-amber-600">⚠️</span>
    <p className="text-sm">
      This unit has child units. Changing its type may create an unusual hierarchy.
    </p>
  </div>
)}
```

#### Update handleSubmit
Include type in update request:
```typescript
const res = await updateUnit(unit._id.toString(), {
  title,
  description,
  imageUrls: images.map(image => image.url),
  type,
});
```

**Visual Layout:**
```
Title: [text input]
Description: [textarea]
Type: [dropdown: Module/Chapter/Lesson]
⚠️ [Warning banner if has children]
Images: [image uploader]
[Update Unit] [Cancel]
```

### 2. API Route Changes

**File:** `src/app/api/admin/units/route.ts`

#### Add Type Import and Validation Constant
```typescript
import { UnitType } from '@/lib/db/model/types/Unit.types';

const VALID_UNIT_TYPES: ReadonlyArray<UnitType> = ['module', 'chapter', 'lesson'];
```

#### Add Type Validation in PUT Handler
Before calling updateUnit:
```typescript
// Validate type if provided
if (data.type && !VALID_UNIT_TYPES.includes(data.type as UnitType)) {
  return NextResponse.json(
    { error: 'Invalid unit type. Must be one of: module, chapter, lesson' },
    { status: 400 }
  );
}
```

**Backend already supports:**
- `updateUnit()` accepts `UpdateUnitInput` which includes optional `type?: UnitType`
- Mongoose schema validates against enum `['chapter', 'lesson', 'module']`
- No database layer changes needed

### 3. Parent Component Integration

**File:** `src/app/components/ContentManagement.tsx`

**No changes required** - the unit object from `getUnit()` already includes:
- `type` field from database
- `children` virtual field populated by Mongoose

The existing data flow works:
```
Unit Page (fetches unit with type + children via getUnit())
    ↓
ContentManagement (passes unit to EditUnitModal)
    ↓
EditUnitModal (displays type dropdown + warning if has children)
```

## User Experience Flow

1. User opens Edit Unit modal for an existing unit
2. Form displays with current type pre-selected in dropdown
3. If unit has children, warning banner appears below type dropdown
4. User can change type by selecting from dropdown
5. On submit, type is validated and updated
6. Unit is updated with new type (children keep their types)

## Error Handling

- **Invalid type value:** API returns 400 with descriptive error message
- **Mongoose validation:** Schema enforces enum values as backup
- **Type assertion:** TypeScript ensures type safety in component

## Warning Banner Behavior

The warning banner:
- Only appears if `unit.children && unit.children.length > 0`
- Provides informative message about hierarchy implications
- Does not block the action (warn but allow approach)
- Uses amber/yellow color scheme for warning (not error red)

## Testing Considerations

- Test editing type for units without children
- Test editing type for units with children (verify warning appears)
- Test that children keep their current types after parent type change
- Test invalid type values are rejected by API
- Test type validation with edge cases
- Verify consistency with create forms styling and behavior

## Notes

- Consistent with create forms (same dropdown, same styling)
- Backend was already prepared - updateUnit supports type parameter
- Warning is informative but non-blocking per requirements
- No changes to child units when parent type changes
