
import { supabase } from './supabaseClient';

/**
 * Converte links do Google Drive para links diretos de imagem
 */
export function formatImageUrl(url: string): string {
  if (!url) return '';
  
  // Tratar links do Google Drive
  if (url.includes('drive.google.com')) {
    const fileId = url.match(/\/d\/([^/]+)/)?.[1] || url.match(/id=([^&]+)/)?.[1];
    if (fileId) {
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }
  
  return url;
}

/**
 * Faz upload de uma imagem para o Supabase Storage
 */
export async function uploadImage(file: File, bucket: string = 'monte-assets'): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (error) {
    if (error.message.includes('bucket not found')) {
      throw new Error('A pasta de armazenamento "monte-assets" não foi encontrada. Por favor, crie-a no painel do Supabase.');
    }
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
}
