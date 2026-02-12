# S3 Bucket Organization

This document describes the organization and structure of files in the MemoryHelper S3 bucket.

## Overview

The S3 bucket (`memoryhelper`) stores all image assets for the MemoryHelper application. Files are organized into specific folders based on their entity type and usage.

## Folder Structure

```
memoryhelper (S3 Bucket)
├── Home/                    # MemoryPiece images
├── units/                   # Unit images (hierarchical structure)
│   ├── 中文/
│   ├── 语文/
│   ├── FIBER/
│   └── [other subjects]/
├── subjects/                # Subject cover images
└── uploads/                 # Temporary upload location (legacy)
```

## Detailed Folder Descriptions

### 1. Home/ Folder

**Purpose**: Stores images associated with MemoryPiece entities (flashcard content).

**Structure**: Flat structure with all files in the root of the Home/ folder.

**Naming Convention**:
- Files are stored with their original filenames
- No subdirectories
- Chinese characters in filenames are stored as actual Unicode characters (not URL-encoded)

**Example Files**:
```
Home/23-700.jpeg
Home/IMG_4160.JPG
Home/Screenshot-2020-08-18-at-7.42.30-PM.png
Home/in-the-beginning.jpg
```

**Database References**:
```javascript
// MemoryPiece document
{
  _id: "...",
  imageUrls: [
    "https://memoryhelper.s3.us-west-1.amazonaws.com/Home/image-name.jpg"
  ]
}
```

**Current Status**: 10 active MemoryPiece images stored here.

---

### 2. units/ Folder

**Purpose**: Stores images associated with Unit entities (organizational containers for learning content).

**Structure**: Hierarchical structure mirroring the learning content organization.

**Path Pattern**: `units/{subject}/{course}/{unit}/{lesson}/{filename}`

**Naming Convention**:
- Paths use actual Chinese characters (e.g., `中文`, `语文`)
- Subdirectory structure reflects the learning hierarchy
- Filenames are typically UUIDs or descriptive names with extensions

**Example Paths**:
```
units/中文/第一册/第一单元/第一课：识字/0b33b350-543e-48f8-b08e-0dda2534b1d7-0016.webp
units/语文/统编版小学语文四年级 - 下册/第一单元/d46af58b-246d-409b-aa44-483d06b2d9f1-0005.webp
units/FIBER/Unit 2: Genesis/23-700.jpeg
```

**Database References**:
```javascript
// Unit document
{
  _id: "...",
  imageUrls: [
    "https://memoryhelper.s3.us-west-1.amazonaws.com/units/中文/第一册/第一单元/image.webp"
  ]
}
```

**Current Status**: 219 images organized in hierarchical subdirectories.

---

### 3. subjects/ Folder

**Purpose**: Stores cover images and assets for Subject entities (top-level learning topics).

**Structure**: Flat or lightly nested structure.

**Naming Convention**:
- Subject-related asset filenames
- May include subject IDs or descriptive names

**Example Files**:
```
subjects/chinese-cover.jpg
subjects/subject-id-123.png
```

**Database References**:
```javascript
// Subject document
{
  _id: "...",
  imageUrls: [
    "https://memoryhelper.s3.us-west-1.amazonaws.com/subjects/cover-image.jpg"
  ]
}
```

---

### 4. uploads/ Folder

**Purpose**: Temporary storage for newly uploaded files before they are moved to their final location.

**Structure**: Flat structure with timestamped or UUID filenames.

**Status**: Legacy folder. Most files have been migrated to appropriate locations (Home/ or units/).

**Current Status**: 2 orphaned files remaining (not referenced by any database entities).

---

## URL Storage Standards

### Database URL Format

All image URLs stored in the MongoDB database follow this format:

```
https://{bucket-name}.s3.{region}.amazonaws.com/{folder-path}/{filename}
```

**Example**:
```
https://memoryhelper.s3.us-west-1.amazonaws.com/units/中文/第一册/image.webp
```

### Important: Character Encoding

- **S3 Keys**: Stored with actual Chinese characters (e.g., `units/中文/第一册/image.webp`)
- **Database URLs**: Stored with actual Chinese characters (NOT URL-encoded like `%E4%B8%AD%E6%96%87`)
- **Browser Access**: Browsers automatically handle URL encoding when accessing these URLs

**Correct**:
```javascript
imageUrls: ["https://memoryhelper.s3.us-west-1.amazonaws.com/units/中文/第一册/image.webp"]
```

**Incorrect** (deprecated):
```javascript
imageUrls: ["https://memoryhelper.s3.us-west-1.amazonaws.com/units/%E4%B8%AD%E6%96%87/..."]
```

---

## File Organization Rules

### 1. One Entity Type Per Folder
- MemoryPiece images → `Home/`
- Unit images → `units/`
- Subject images → `subjects/`

### 2. Preserve Hierarchy for Units
- Unit images maintain the learning content hierarchy in their path structure
- This makes it easier to organize and locate images by course structure

### 3. Flat Structure for MemoryPieces
- All MemoryPiece images are in the root of `Home/` folder
- No subdirectories needed as MemoryPieces can belong to multiple units

### 4. No Duplicate Files
- Each image file should exist in only one location
- Use the appropriate folder based on the primary entity type

---

## Migration Scripts

The following scripts are available for maintaining the S3 bucket organization:

### Available Scripts

```bash
# Migrate specific entity types to S3
npm run migrate:images-to-s3              # Migrate MemoryPiece images
npm run migrate:subjects-images-to-s3     # Migrate Subject images
npm run migrate:units-images-to-s3        # Migrate Unit images

# Cleanup and organization
npm run cleanup:home-folder               # Move Unit images from Home/ to units/
npm run cleanup:uploads-folder            # Move uploads/ files to appropriate locations
npm run flatten:home-folder               # Flatten Home/ subdirectories (MemoryPieces only)

# Fix URL encoding
npm run fix:unit-image-urls               # Fix Home/ URLs to units/ URLs
npm run decode:unit-image-urls            # Decode URL-encoded paths to Chinese characters

# Verification
npm run verify:image-migrations           # Check for any remaining local URLs

# Rollback (emergency use only)
npm run rollback:memorypieces-urls        # Rollback MemoryPiece URLs from memoryPieces/ to Home/
```

### Migration History

1. **Initial Migration**: All images moved from local `/public/images` to S3
2. **Folder Reorganization**: Unit images moved from `Home/` to `units/` with hierarchy
3. **Flattening**: MemoryPiece images flattened to `Home/` root
4. **URL Decoding**: All URL-encoded paths decoded to use actual Chinese characters

---

## Best Practices

### When Uploading New Images

1. **Determine Entity Type**:
   - MemoryPiece → Upload to `Home/`
   - Unit → Upload to `units/{subject}/{path}/`
   - Subject → Upload to `subjects/`

2. **Use Descriptive Filenames**:
   - Include UUIDs for uniqueness
   - Use meaningful names when possible
   - Avoid special characters except Chinese, hyphens, and underscores

3. **Set Correct ACL**:
   - All public images should have `public-read` ACL
   - Private images can use more restrictive ACLs

4. **Store URLs with Chinese Characters**:
   - Always store actual Chinese characters in the database
   - Never store URL-encoded characters like `%E4%B8%AD%E6%96%87`

### When Querying Images

```javascript
// Good: Query with actual Chinese characters
const units = await Unit.find({
  imageUrls: {
    $regex: 'units/中文/第一册'
  }
});

// The URLs in the database contain actual Chinese characters
console.log(unit.imageUrls[0]);
// Output: https://memoryhelper.s3.us-west-1.amazonaws.com/units/中文/第一册/image.webp
```

---

## Troubleshooting

### Issue: Images Not Loading

**Check**:
1. Verify the S3 key exists using AWS Console or CLI
2. Check if the file has `public-read` ACL
3. Verify the URL in the database matches the S3 key exactly
4. Check for URL encoding issues (URLs should contain actual Chinese characters)

**Fix**:
```bash
# Verify migrations
npm run verify:image-migrations

# Fix URL encoding if needed
npm run decode:unit-image-urls
```

### Issue: Duplicate Files

**Check**:
1. Search for the filename across all folders
2. Verify which entity references the file

**Fix**:
```bash
# Use cleanup scripts to organize files
npm run cleanup:home-folder
npm run cleanup:uploads-folder
```

### Issue: Chinese Characters Not Displaying

**Check**:
1. Verify the S3 key uses actual Chinese characters (not URL-encoded)
2. Check the database URL contains actual Chinese characters
3. Ensure your terminal/editor supports UTF-8

**Fix**:
```bash
# Decode URL-encoded paths
npm run decode:unit-image-urls
```

---

## Statistics (Current State)

| Folder | Files | Entity Type | Status |
|--------|-------|-------------|--------|
| Home/ | 10 active + 1,293 orphaned | MemoryPiece | Active |
| units/ | 219 | Unit | Active |
| subjects/ | Unknown | Subject | Active |
| uploads/ | 2 orphaned | N/A | Legacy |

**Total Active Files**: 229 files properly organized and referenced in database

**Orphaned Files**: 1,295 files not referenced by any database entity (can be cleaned up if needed)

---

## Related Files

- **Environment Variables**: `.env.local` (S3 credentials)
- **Migration Scripts**: `scripts/migrate-*.ts`
- **Database Models**:
  - `src/lib/db/model/MemoryPiece.ts`
  - `src/lib/db/model/Unit.ts`
  - `src/lib/db/model/Subject.ts`

---

## Notes

- S3 folders are "virtual" - they don't exist as separate objects in S3
- All file operations should preserve Chinese characters in paths
- When migrating or moving files, always update database references
- Use the provided scripts rather than manual S3 operations to maintain consistency

---

*Last Updated: 2025-02-11*
*Bucket: memoryhelper*
*Region: us-west-1*
