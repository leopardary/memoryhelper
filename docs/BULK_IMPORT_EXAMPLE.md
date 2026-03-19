# Bulk Import Example

This document provides a complete example of the filesystem structure needed for bulk importing content into MemoryHelper.

## Directory Structure

Here's a complete example showing how to structure your import data:

```
import-data/
├── ChineseBasics/                          # Subject folder (becomes Subject title)
│   ├── Lesson1-Greetings/                  # Root unit (chapter)
│   │   ├── Part1-HelloGoodbye/             # Child unit (lesson)
│   │   │   └── memory-pieces.csv           # Memory pieces for this unit
│   │   └── Part2-Introductions/            # Child unit (lesson)
│   │       └── memory-pieces.csv
│   └── Lesson2-Numbers/                    # Root unit (chapter)
│       ├── Part1-OneToTen/                 # Child unit (lesson)
│       │   └── memory-pieces.csv
│       └── Part2-ElevenToTwenty/          # Child unit (lesson)
│           └── memory-pieces.csv
└── memoryPieces/                           # Memory pieces content folder
    ├── 你好/                                # Content folder
    │   ├── nihao.jpg                       # Image 1
    │   ├── nihao-context.png              # Image 2
    │   └── description.txt                 # Description text
    ├── 再见/
    │   ├── zaijian.gif
    │   └── description.txt
    ├── 一/
    │   ├── yi-stroke-order.gif
    │   ├── yi-example.jpg
    │   └── description.txt
    └── 二/
        ├── er.webp
        └── description.txt
```

## File Contents

### CSV File Example

**File**: `import-data/ChineseBasics/Lesson1-Greetings/Part1-HelloGoodbye/memory-pieces.csv`

```csv
content,label
你好,greeting
再见,greeting
谢谢,polite expression
```

**Alternative format** (without header):
```csv
你好,greeting
再见,greeting
谢谢,polite expression
```

### Description File Example

**File**: `import-data/memoryPieces/你好/description.txt`

```
你好 (nǐ hǎo) is the most common greeting in Chinese, meaning "hello" or "hi".

It literally translates to "you good" and is appropriate for both formal and informal situations.

Pronunciation: nǐ hǎo (tone: 3rd tone + 3rd tone)
```

**File**: `import-data/memoryPieces/一/description.txt`

```
一 (yī) is the Chinese character for the number "one".

It is one of the simplest characters, consisting of a single horizontal stroke.

Stroke order: Left to right
Pronunciation: yī (1st tone)
```

## Complete Working Example

Let's create content for "Chinese Numbers 1-5":

### 1. Create Subject Folder

```bash
mkdir -p import-data/ChineseNumbers
```

### 2. Create Unit Structure

```bash
mkdir -p "import-data/ChineseNumbers/Basic Numbers"
```

### 3. Create CSV File

**File**: `import-data/ChineseNumbers/Basic Numbers/memory-pieces.csv`

```csv
content,label
一,number
二,number
三,number
四,number
五,number
```

### 4. Create Memory Pieces Folder

```bash
mkdir -p import-data/memoryPieces
mkdir -p import-data/memoryPieces/一
mkdir -p import-data/memoryPieces/二
mkdir -p import-data/memoryPieces/三
mkdir -p import-data/memoryPieces/四
mkdir -p import-data/memoryPieces/五
```

### 5. Add Images and Descriptions

For each number, add at least one image and optionally a description:

**File**: `import-data/memoryPieces/一/description.txt`
```
一 (yī) - Number "one"
The simplest Chinese character, written as a single horizontal line.
Pronunciation: yī (1st tone)
```

**Files**:
- `import-data/memoryPieces/一/yi.jpg` (stroke order image)
- `import-data/memoryPieces/二/er.jpg` (stroke order image)
- `import-data/memoryPieces/三/san.jpg` (stroke order image)
- etc.

### 6. Run Import

```bash
npm run import:from-filesystem ./import-data/ChineseNumbers ./import-data/memoryPieces
```

## Advanced Example: Nested Units

For more complex hierarchies with multiple nesting levels:

```
import-data/
└── MathematicsK12/
    ├── Grade1/
    │   ├── Addition/
    │   │   ├── SingleDigit/
    │   │   │   └── memory-pieces.csv
    │   │   └── DoubleDigit/
    │   │       └── memory-pieces.csv
    │   └── Subtraction/
    │       ├── SingleDigit/
    │       │   └── memory-pieces.csv
    │       └── DoubleDigit/
    │           └── memory-pieces.csv
    └── Grade2/
        └── Multiplication/
            ├── Tables2to5/
            │   └── memory-pieces.csv
            └── Tables6to10/
                └── memory-pieces.csv
```

This creates:
- **Subject**: MathematicsK12
- **Root Units**: Grade1, Grade2
- **Chapter Units**: Addition, Subtraction, Multiplication
- **Lesson Units**: SingleDigit, DoubleDigit, Tables2to5, Tables6to10

Each leaf unit (SingleDigit, DoubleDigit, etc.) contains a `memory-pieces.csv` file with the actual learning content.

## Tips for Preparing Import Data

### 1. Start Small
Begin with a single unit to validate your structure:
```
import-data/
└── TestSubject/
    └── TestUnit/
        └── memory-pieces.csv
```

### 2. Use Spreadsheets
Create CSV files in Excel or Google Sheets for easier editing:
- Column A: content
- Column B: label
- Export as CSV

### 3. Batch Image Preparation
- Use consistent naming (e.g., `{content}.jpg`)
- Keep images under 5MB each
- Supported formats: jpg, png, gif, webp

### 4. Description Templates
Create a template for descriptions to maintain consistency:
```
{Character/Word} ({pinyin})

Meaning: {English translation}

Usage: {Common usage context}

Pronunciation: {Pinyin with tones}

Notes: {Any special notes}
```

### 5. Validation Checklist

Before running import, verify:
- [ ] Subject folder name is correct (becomes subject title)
- [ ] Unit folder names are descriptive
- [ ] CSV files have correct format (content,label)
- [ ] Memory piece folders in `memoryPieces/` match CSV content exactly
- [ ] All referenced memory pieces have at least one image OR a description
- [ ] Image files are valid formats (.jpg, .png, .gif, .webp)
- [ ] `description.txt` files use UTF-8 encoding

## Expected Results

After successful import:

1. **Database**:
   - Subject created with title matching folder name
   - Units created with hierarchy matching folder structure
   - Memory pieces created with content, descriptions, and labels
   - All relationships established (Subject → Units → MemoryPieces)

2. **S3 Storage**:
   - Images uploaded to `Home/{content}/` folders
   - Public URLs stored in database
   - All images accessible via HTTPS

3. **Web Interface**:
   - Subject appears on homepage
   - Units navigable through hierarchy
   - Memory pieces viewable with images
   - Content ready for practice/review

## Troubleshooting Import

### Common Issues

**Issue**: "Source directory not found"
- **Solution**: Use absolute paths or relative paths from project root

**Issue**: "Memory piece folder not found"
- **Solution**: Ensure `memoryPieces/{content}/` folder exists and matches CSV content exactly

**Issue**: "CSV parsing error"
- **Solution**: Check CSV format, ensure UTF-8 encoding, verify no special characters breaking the format

**Issue**: "Image upload failed"
- **Solution**: Verify AWS credentials in `.env.local`, check image file size (<5MB)

**Issue**: "Memory piece already exists"
- **Note**: This is normal behavior - existing memory pieces are reused efficiently

## Next Steps

After successful import:

1. **Verify in Web UI**: Navigate to your subject and verify all content appears correctly
2. **Add Subject Images**: Use the web UI to add cover images for your subject
3. **Add Unit Images**: Optionally add representative images for units
4. **Test Practice Flow**: Create subscriptions and test the spaced repetition system
5. **Iterate**: Use the import script again to add more content to existing subjects
