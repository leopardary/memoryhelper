# S3 Bucket Organization

This document describes the organization and structure of files in the MemoryHelper S3 bucket.

## Overview

The S3 bucket (`memoryhelper`) stores all image assets for the MemoryHelper application. Files are organized into specific folders based on their entity type and usage.

## Folder Structure

```
memoryhelper (S3 Bucket)
├── Home/                    # MemoryPiece images
│   ├── {content}/           # Each MemoryPiece has its own folder
│   │   ├── image1.jpg
│   │   └── image2.png
│   └── [other memory pieces]/
├── units/                   # Unit images (hierarchical structure)
│   ├── 中文/
│   │   └── {course}/
│   │       └── {unit}/
│   │           └── {title}/
│   │               ├── image1.webp
│   │               └── image2.webp
│   ├── 语文/
│   ├── FIBER/
│   └── [other subjects]/
├── subjects/                # Subject cover images
│   ├── {title}/             # Each Subject has its own folder
│   │   ├── cover1.jpg
│   │   └── cover2.png
│   └── [other subjects]/
└── uploads/                 # Temporary upload location (legacy)
```

## Detailed Folder Descriptions

### 1. Home/ Folder

**Purpose**: Stores images associated with MemoryPiece entities (flashcard content).

**Structure**: Each MemoryPiece has its own subfolder named after its content, allowing multiple images per memory piece.

**Naming Convention**:
- Folder structure: `Home/{content}/`
- Each MemoryPiece content gets its own folder
- Files are stored with their original filenames within the content folder
- Chinese characters in paths are stored as actual Unicode characters (not URL-encoded)

**Example Files**:
```
Home/我/image1.jpg
Home/我/image2.png
Home/你好/photo1.webp
Home/你好/photo2.webp
Home/example-word/picture.jpg
```

**Database References**:
```javascript
// MemoryPiece document
{
  _id: "...",
  content: "我",
  imageUrls: [
    "https://memoryhelper.s3.us-west-1.amazonaws.com/Home/我/image1.jpg",
    "https://memoryhelper.s3.us-west-1.amazonaws.com/Home/我/image2.png"
  ]
}
```

**Current Status**: 10 active MemoryPiece images stored here.

---

### 2. units/ Folder

**Purpose**: Stores images associated with Unit entities (organizational containers for learning content).

**Structure**: Hierarchical structure mirroring the learning content organization. Each unit has its own subfolder named after its title, allowing multiple images per unit.

**Path Pattern**: `units/{subject}/{course}/{unit-path}/{title}/{filename}`

**Naming Convention**:
- Paths use actual Chinese characters (e.g., `中文`, `语文`)
- Subdirectory structure reflects the complete learning hierarchy
- Each unit's title becomes the final folder containing its images
- Filenames are typically UUIDs or descriptive names with extensions

**Example Paths**:
```
units/中文/第一册/第一单元/第一课：识字/image1.webp
units/中文/第一册/第一单元/第一课：识字/image2.webp
units/语文/统编版小学语文四年级 - 下册/第一单元/第一课/photo1.webp
units/语文/统编版小学语文四年级 - 下册/第一单元/第一课/photo2.webp
units/FIBER/Unit 2: Genesis/Lesson 1/image.jpeg
```

**Database References**:
```javascript
// Unit document
{
  _id: "...",
  title: "第一课：识字",
  imageUrls: [
    "https://memoryhelper.s3.us-west-1.amazonaws.com/units/中文/第一册/第一单元/第一课：识字/image1.webp",
    "https://memoryhelper.s3.us-west-1.amazonaws.com/units/中文/第一册/第一单元/第一课：识字/image2.webp"
  ]
}
```

**Current Status**: 219 images organized in hierarchical subdirectories.

---

### 3. subjects/ Folder

**Purpose**: Stores cover images and assets for Subject entities (top-level learning topics).

**Structure**: Each subject has its own subfolder named after its title, allowing multiple images per subject.

**Naming Convention**:
- Folder structure: `subjects/{title}/`
- Each Subject title gets its own folder
- Files are stored with their original filenames within the title folder
- Chinese characters in paths are stored as actual Unicode characters (not URL-encoded)

**Example Files**:
```
subjects/Chinese Characters/cover.jpg
subjects/Chinese Characters/banner.png
subjects/中文/主图.jpg
subjects/中文/背景.png
subjects/FIBER/logo.png
```

**Database References**:
```javascript
// Subject document
{
  _id: "...",
  title: "Chinese Characters",
  imageUrls: [
    "https://memoryhelper.s3.us-west-1.amazonaws.com/subjects/Chinese Characters/cover.jpg",
    "https://memoryhelper.s3.us-west-1.amazonaws.com/subjects/Chinese Characters/banner.png"
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
- MemoryPiece images → `Home/{content}/`
- Unit images → `units/{subject}/{path}/{title}/`
- Subject images → `subjects/{title}/`

### 2. Entity-Specific Subfolders
- Each entity instance (MemoryPiece, Unit, Subject) gets its own subfolder
- Folder name is derived from the entity's identifying property (content, title)
- This allows multiple images per entity while keeping them organized

### 3. Preserve Complete Hierarchy for Units
- Unit images maintain the full learning content hierarchy in their path structure
- The final folder in the path is the unit's title
- This makes it easier to organize and locate images by course structure

### 4. Support Multiple Images
- Each entity can have multiple image files in its dedicated folder
- Files within an entity's folder can have any valid filename
- This structure scales naturally as entities add more images

### 5. No Duplicate Files
- Each image file should exist in only one location
- Use the appropriate folder based on the entity type and its identifying properties

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

# Reorganize to entity-specific subfolders
npm run migrate:memorypieces-to-subfolders  # Move MemoryPiece images to Home/{content}/ subfolders
npm run migrate:units-to-subfolders         # Move Unit images to units/{path}/{title}/ subfolders

# Fix URL encoding
npm run fix:unit-image-urls               # Fix Home/ URLs to units/ URLs
npm run decode:unit-image-urls            # Decode URL-encoded paths to Chinese characters

# Bulk import from filesystem
npm run import:from-filesystem <subject-dir> <memory-pieces-dir>  # Import entire subject hierarchy from filesystem

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
5. **Entity-Specific Subfolders for MemoryPieces**: MemoryPiece images organized into `Home/{content}/` subfolders to support multiple images per memory piece
6. **Entity-Specific Subfolders for Units**: Unit images organized into `units/{path}/{title}/` subfolders to support multiple images per unit

---

## Best Practices

### When Uploading New Images

1. **Determine Entity Type and Identifying Property**:
   - MemoryPiece → Upload to `Home/{content}/`
     - Use the memory piece's `content` field as the folder name
   - Unit → Upload to `units/{subject}/{path}/{title}/`
     - Use the complete path hierarchy including the unit's `title`
   - Subject → Upload to `subjects/{title}/`
     - Use the subject's `title` field as the folder name

2. **Use Descriptive Filenames**:
   - Include UUIDs for uniqueness when needed
   - Use meaningful names when possible
   - Avoid special characters except Chinese, hyphens, and underscores
   - Multiple images for the same entity can have different filenames

3. **Set Correct ACL**:
   - All public images should have `public-read` ACL
   - Private images can use more restrictive ACLs

4. **Store URLs with Chinese Characters**:
   - Always store actual Chinese characters in the database
   - Never store URL-encoded characters like `%E4%B8%AD%E6%96%87`

5. **Organize by Entity**:
   - All images for a single entity should be in that entity's dedicated folder
   - Don't mix images from different entities in the same folder
   - The folder structure ensures natural organization and discoverability

### When Querying Images

```javascript
// Good: Query with actual Chinese characters
const units = await Unit.find({
  imageUrls: {
    $regex: 'units/中文/第一册'
  }
});

// The URLs in the database contain actual Chinese characters
// and include the unit's title in the path
console.log(unit.imageUrls[0]);
// Output: https://memoryhelper.s3.us-west-1.amazonaws.com/units/中文/第一册/第一单元/第一课/image.webp

// Query MemoryPieces by content folder
const memoryPieces = await MemoryPiece.find({
  imageUrls: {
    $regex: 'Home/我/'
  }
});

// Output: https://memoryhelper.s3.us-west-1.amazonaws.com/Home/我/image1.jpg
```

---

## Bulk Import from Filesystem

For efficient content creation, you can use the filesystem-based bulk import workflow. This allows you to prepare all content (subjects, units, memory pieces, images, descriptions) in a structured folder hierarchy and import everything at once.

### Filesystem Structure

The import system expects two directory structures:

1. **Subject Directory**: Nested folders representing the unit hierarchy
2. **Memory Pieces Directory**: Flat directory with content-based folders containing images and descriptions

#### Example Structure

```
import-data/
├── Chinese/                        # Subject directory (subject title)
│   ├── Unit1/                      # Unit directory (unit title)
│   │   ├── SubUnit1/               # Child unit directory
│   │   │   └── memory-pieces.csv   # CSV with content,label columns
│   │   └── SubUnit2/
│   │       └── memory-pieces.csv
│   └── Unit2/
│       └── memory-pieces.csv
└── memoryPieces/                   # Memory pieces content directory
    ├── 我/                          # Folder named by content
    │   ├── 我.gif                   # Images for this memory piece
    │   ├── 我-2.jpg                 # Multiple images supported
    │   └── description.txt         # Description text file
    ├── 你/
    │   ├── 你.jpg
    │   └── description.txt
    └── 好/
        ├── 好.png
        └── description.txt
```

### CSV Format

Each `memory-pieces.csv` file should have two columns:

```csv
content,label
我,pronoun
你,pronoun
好,adjective
```

**CSV Guidelines**:
- First row can be a header (will be auto-detected and skipped)
- Content column: The actual memory piece content (e.g., Chinese character, word, phrase)
- Label column: Category or label for the memory piece
- Quoted fields are supported for content with commas
- Empty rows are automatically filtered out

### Memory Pieces Directory

For each memory piece content referenced in CSV files, create a folder in the `memoryPieces/` directory:

```
memoryPieces/
  {content}/              # Folder named exactly as the content in CSV
    image1.jpg            # One or more image files
    image2.png
    description.txt       # Optional: text file with description
```

**Guidelines**:
- Folder name must match the `content` column in CSV exactly
- Supported image formats: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
- `description.txt` is optional but recommended
- Multiple images per memory piece are supported
- If a memory piece folder doesn't exist, the script will create the memory piece without images

### Running the Import

```bash
npm run import:from-filesystem <subject-directory> <memory-pieces-directory>
```

**Example**:
```bash
npm run import:from-filesystem ./import-data/Chinese ./import-data/memoryPieces
```

### Import Process

The script performs the following operations:

1. **Create or Reuse Subject**: Creates subject if it doesn't exist, reuses if it does
2. **Build Unit Hierarchy**: Recursively creates units based on folder structure
3. **Process CSV Files**: For each `memory-pieces.csv` in leaf units:
   - Creates or reuses memory pieces
   - Reads descriptions from `description.txt` files
   - Uploads images to S3 at `Home/{content}/` paths
   - Associates memory pieces with the unit
4. **Database Updates**: Creates all relationships between subjects, units, and memory pieces

### Import Output

The script provides detailed progress reporting:

```
Processing Subject: "Chinese"
  ✅ Created Subject: "Chinese"

Building unit tree from filesystem...
Found 2 root units

Processing Unit: "Unit1"
  ✅ Created Unit: "Unit1"
  Processing memory pieces from CSV...
  MemoryPiece "我" already exists, reusing
    ✅ Uploaded image: Home/我/我.gif
  ✅ Created MemoryPiece: "我" with 1 images
  ✅ Added 3 memory pieces to unit

Processing Unit: "SubUnit1"
  ✅ Created Unit: "SubUnit1"
  ...

========================================================================
📊 Import Summary:
========================================================================
✅ Subjects created: 1
✅ Units created: 5
✅ Memory pieces created: 15
✅ Images uploaded: 23
```

### Best Practices for Bulk Import

1. **Prepare Content Offline**: Create all folders, CSV files, images, and descriptions offline
2. **Test with Small Dataset**: Start with a single unit to verify structure
3. **Validate CSV Files**: Ensure CSV files are properly formatted with correct column names
4. **Match Content Exactly**: Memory piece folder names must match CSV content exactly
5. **Reusable Memory Pieces**: If a memory piece already exists, it will be reused (efficient for shared content)
6. **Idempotent**: You can run the import multiple times safely - existing entities are reused

### Advantages of Filesystem Import

- **Bulk Creation**: Create entire subject hierarchies in one command
- **Offline Preparation**: Prepare all content in any text editor or spreadsheet tool
- **Version Control**: Content structure can be tracked in Git
- **Automated**: No need for manual UI data entry
- **Efficient**: Reuses existing memory pieces to avoid duplicates
- **Scalable**: Handle hundreds or thousands of memory pieces easily

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
