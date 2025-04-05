import fs from 'fs';
import path from 'path';

export async function writeBufferToFile(buffer: Buffer, filePath: string): Promise<void> {
  try {
    // Ensure the directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write the buffer to file
    await fs.promises.writeFile(filePath, buffer);
    console.log(`File written successfully to: ${filePath}`);
  } catch (error) {
    console.error('Error writing file:', error);
    throw new Error(`Failed to write file to: ${filePath}`);
  }
}