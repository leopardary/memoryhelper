import fs from 'fs';
import path from 'path';

export function validateImagePath(imagePath: string): boolean {
  // Remove leading slash and combine with public directory
  const fullPath = path.join(process.cwd(), 'public', imagePath.replace(/^\//, ''));
  
  try {
    return fs.existsSync(fullPath);
  } catch (error) {
    console.error('Error validating image path:', error);
    return false;
  }
}