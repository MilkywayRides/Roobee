import { supabase } from './supabase';

export async function uploadProjectFile(file: File, projectId: string) {
  const filePath = `${projectId}/${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage.from('projects').upload(filePath, file);
  if (error) throw error;
  const { data: publicUrlData } = supabase.storage.from('projects').getPublicUrl(filePath);
  return {
    fileName: file.name,
    fileUrl: publicUrlData.publicUrl,
    filePath,
  };
} 