import { Client, Storage, ID, Account, Permission, Role } from 'appwrite';

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

export const storage = new Storage(client);
export const account = new Account(client);

export const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || '';

// Create an anonymous session for file uploads
export const createAnonymousSession = async () => {
    try {
        // Check if we already have a session
        const session = await account.getSession('current');
        if (session) {
            return; // Session already exists
        }
    } catch (error) {
        // No session exists, create one
        try {
            await account.createAnonymousSession();
        } catch (createError) {
            console.error('Error creating anonymous session:', createError);
            throw createError;
        }
    }
};

export const uploadFile = async (file: File) => {
    try {
        // Ensure we have an anonymous session
        await createAnonymousSession();
        
        const response = await storage.createFile(
            BUCKET_ID,
            ID.unique(),
            file,
            [
                Permission.read(Role.any()), // Allow anyone to read
                Permission.update(Role.any()), // Allow anyone to update
                Permission.delete(Role.any()) // Allow anyone to delete
            ]
        );
        return response;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

export const getFilePreview = (fileId: string) => {
    return storage.getFilePreview(BUCKET_ID, fileId);
};

export const getFileDownload = (fileId: string) => {
    return storage.getFileDownload(BUCKET_ID, fileId);
};

export const deleteFile = async (fileId: string) => {
    try {
        await storage.deleteFile(BUCKET_ID, fileId);
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
}; 