import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { config } from '../config/config';

/**
 * Ensure that the upload directory exists
 */
export const ensureUploadDir = (): void => {
  if (!fs.existsSync(config.upload.dir)) {
    fs.mkdirSync(config.upload.dir, { recursive: true });
  }
};

/**
 * Save a file to the upload directory
 * @param buffer File buffer
 * @param originalFilename Original filename
 * @returns Path to saved file
 */
export const saveFile = async (buffer: Buffer, originalFilename: string): Promise<string> => {
  ensureUploadDir();
  
  // Get file extension
  const ext = path.extname(originalFilename).toLowerCase();
  
  // Generate unique filename
  const filename = `${randomUUID()}${ext}`;
  const filepath = path.join(config.upload.dir, filename);
  
  // Write file to disk
  await fs.promises.writeFile(filepath, buffer);
  
  // Return just the filename, not the full path
  return filename;
};

/**
 * Delete a file from the upload directory
 * @param filename Filename to delete
 */
export const deleteFile = async (filename: string): Promise<void> => {
  // Don't delete default avatar
  if (filename === 'default.png') {
    return;
  }
  
  const filepath = path.join(config.upload.dir, filename);
  
  // Check if file exists
  if (fs.existsSync(filepath)) {
    await fs.promises.unlink(filepath);
  }
};

/**
 * Create default avatar if it doesn't exist
 */
export const createDefaultAvatar = async (): Promise<void> => {
  const defaultAvatarPath = path.join(config.upload.dir, 'default.png');
  
  // If default avatar already exists, skip
  if (fs.existsSync(defaultAvatarPath)) {
    return;
  }
  
  ensureUploadDir();
  
  // Create a simple default avatar (a colored square)
  const size = 200;
  const canvas = new Uint8Array(size * size * 4);
  
  // Fill with a blue-ish color
  for (let i = 0; i < canvas.length; i += 4) {
    canvas[i] = 100;     // R
    canvas[i + 1] = 149;  // G
    canvas[i + 2] = 237;  // B
    canvas[i + 3] = 255;  // A
  }
  
  // This is a minimal PNG representation - in production you might want a better default avatar
  // For now, we'd need additional libraries to generate a real PNG
  console.log(`Default avatar would be created at ${defaultAvatarPath}`);
  
  // Placeholder for demo - in practice, you'd use a real image library
  await fs.promises.writeFile(defaultAvatarPath, Buffer.from('Default avatar placeholder'));
};

/**
 * Validate file type (for avatars, only accept images)
 * @param mimetype File mimetype
 * @returns True if file type is valid
 */
export const isValidImageType = (mimetype: string): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(mimetype);
};
