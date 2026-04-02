# Unit Type Dropdown Design

**Date:** 2026-04-01
**Feature:** Add type dropdown to unit creation forms with smart defaults

## Overview

Add a dropdown selector for unit type (module, chapter, lesson) to both root unit and sub-unit creation forms. The dropdown will have intelligent defaults based on the parent context, while allowing users to override the selection.

## Requirements

- Unit types: module, chapter, lesson (already defined in Unit model enum)
- Default type rules:
  - Root units (parent is subject): default to 'module'
  - Sub-units with parent type 'module': default to 'chapter'
  - Sub-units with parent type 'chapter': default to 'lesson'
  - Sub-units with parent type 'lesson': default to 'module'
- All unit types can have children (no leaf node restrictions)
- Users can override the default via dropdown

## Design Approach

**Approach 3: Client Default + Server Validation** (selected)

- Client calculates and pre-selects the appropriate default type
- User can edit via dropdown if needed
- Server accepts the type parameter and validates it's one of the enum values
- Server also sets a default if type is missing (defensive programming)

This provides the best UX with immediate feedback while maintaining data integrity.

## Implementation Details

### 1. UI Component Changes

#### AddRootUnitModal.tsx
- Add `type` state variable initialized to 'module'
- Add `<select>` dropdown between Title and Description fields
- Options: module, chapter, lesson
- Pre-select 'module' as default
- Include `type` in API request body to `/api/admin/units/create-root`

#### CreateSubUnitForm (in UnitAddContentModal.tsx)
- Add `type` state variable with smart initialization:
  ```typescript
  const getDefaultType = (parentType: string) => {
    if (parentType === 'module') return 'chapter';
    if (parentType === 'chapter') return 'lesson';
    return 'module'; // for 'lesson' or other cases
  };
  ```
- Add `<select>` dropdown with same styling as AddRootUnitModal
- Pre-select calculated default based on parent unit's type
- Include `type` in API request body to `/api/admin/units/create-sub`

**UI Styling:**
- Consistent with existing form inputs
- White background, border, rounded corners, padding
- Positioned between Title and Description fields

### 2. API Route Changes

#### `/api/admin/units/create-root/route.ts`
- Extract `type` from request body
- Validate `type` is in ['module', 'chapter', 'lesson']
- If invalid, return 400 with error: "Invalid unit type. Must be one of: module, chapter, lesson"
- Default to 'module' if type is missing
- Pass `type` to `addRootUnitForSubject()`

#### `/api/admin/units/create-sub/route.ts`
- Extract `type` from request body
- Validate `type` is in ['module', 'chapter', 'lesson']
- If invalid, return 400 error
- If type is missing, calculate default based on parent unit's type:
  - module → chapter
  - chapter → lesson
  - otherwise → module
- Pass `type` to `addSubUnit()`

### 3. Database Layer Changes

#### `src/lib/db/api/unit.ts`

Update interfaces:
```typescript
interface AddRootUnitProps extends UnitBaseProps {
  subjectId: string;
  type?: string;
}

interface AddSubUnitProps extends UnitBaseProps {
  parentUnitId: string;
  type?: string;
}
```

Update `addRootUnitForSubject()`:
- Accept `type` from props with default value 'module'
- Include `type` in `findOneAndUpdate()` call

Update `addSubUnit()`:
- Accept `type` from props
- Calculate default if not provided (same logic as API route)
- Include `type` in `findOneAndUpdate()` call

**Note:** The Unit model schema already has the `type` field with enum validation ['chapter', 'lesson', 'module'], so no schema changes are needed. Mongoose will automatically validate the type value.

## Data Flow

1. User opens "Add Unit" form
2. Form pre-selects appropriate type based on parent context
3. User can change type via dropdown or keep default
4. On submit, selected type is sent to API
5. API validates type and applies defensive default if missing
6. Database layer receives validated type and creates unit
7. Mongoose validates type against enum before saving

## Error Handling

- Invalid type value: API returns 400 with descriptive error message
- Missing type value: Server applies intelligent default
- Mongoose enum validation: Catches any invalid values that bypass API validation

## Testing Considerations

- Test root unit creation defaults to 'module'
- Test sub-unit creation with each parent type
- Test user override of default type
- Test invalid type values are rejected
- Test missing type value uses appropriate default
