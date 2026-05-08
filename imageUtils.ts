
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
  const fileExt = file.name.split('.').pop()?.toLowerCase();
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'ico', 'svg'];
  
  if (fileExt && !allowedExtensions.includes(fileExt)) {
    throw new Error('Formato de arquivo não suportado. Use JPG, PNG, WEBP, GIF, ICO ou SVG.');
  }

  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  try {
    let uploadResult: any = null;
    let retries = 0;
    const maxRetries = 2;

    while (retries <= maxRetries) {
      try {
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          if (error.message?.includes('Lock broken')) {
            console.warn(`Auth lock conflict during upload. Retry ${retries + 1}/${maxRetries}`);
            retries++;
            await new Promise(r => setTimeout(r, 500));
            continue;
          }
          
          // Fallback simple: se o bucket específico falhar e for o padrão, tenta 'public'
          if ((error.message.toLowerCase().includes('not found')) && bucket === 'monte-assets') {
             console.warn("Bucket 'monte-assets' not found. Trying fallback 'public' bucket...");
             const { data: fallbackData, error: fallbackError } = await supabase.storage
               .from('public')
               .upload(filePath, file, { cacheControl: '3600', upsert: false });
             
             if (!fallbackError) {
                const { data: { publicUrl } } = supabase.storage.from('public').getPublicUrl(filePath);
                return publicUrl;
             }
             throw new Error(`O bucket de armazenamento não foi encontrado. Por favor, crie um bucket chamado "monte-assets" ou "public" no dashboard do Supabase (Storage) e marque-o como "Public".`);
          }
          throw error;
        }
        
        uploadResult = data;
        break;
      } catch (e: any) {
        if (retries === maxRetries) throw e;
        retries++;
        await new Promise(r => setTimeout(r, 500));
      }
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (err: any) {
    console.error("Critical Upload Error:", err);
    throw err;
  }
}
