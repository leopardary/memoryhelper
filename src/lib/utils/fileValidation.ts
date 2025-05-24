import fs from 'fs';
import path from 'path';

export function validateImagePath(imagePaths: string[]): boolean {
  // Remove leading slash and combine with public directory
  for (const imagePath of imagePaths) {
    const fullPath = path.join(process.cwd(), 'public', imagePath.replace(/^\//, ''));
    
    try {
      return fs.existsSync(fullPath);
    } catch (error) {
      console.error('Error validating image path:', error);
      return false;
    }
  }
  return true;
}