import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { createHash } from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit

// Ensure upload directory exists
const ensureUploadDir = async () => {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
};

export const generateSecureFileName = (originalName: string) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(16).toString('hex');
  const extension = path.extname(originalName);
  return `${timestamp}-${randomString}${extension}`;
};

export const generateAccessKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const saveFile = async (file: Buffer, fileName: string) => {
  await ensureUploadDir();
  
  if (file.length > MAX_FILE_SIZE) {
    throw new Error('File size exceeds maximum limit of 50MB');
  }

  const secureFileName = generateSecureFileName(fileName);
  const filePath = path.join(UPLOAD_DIR, secureFileName);
  
  await fs.writeFile(filePath, file);
  
  // Generate file hash for integrity checking
  const fileHash = createHash('sha256').update(file).digest('hex');
  
  return {
    secureFileName,
    filePath,
    fileHash
  };
};

export const getFileStream = async (fileName: string) => {
  const filePath = path.join(UPLOAD_DIR, fileName);
  try {
    await fs.access(filePath);
    return fs.readFile(filePath);
  } catch {
    throw new Error('File not found');
  }
};

export const deleteFile = async (fileName: string) => {
  const filePath = path.join(UPLOAD_DIR, fileName);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
}; 