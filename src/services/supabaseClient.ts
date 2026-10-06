import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    !supabaseUrl.includes('placeholder')
  );
};

// Create and export the initialized client
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-anon-key');

export const SUPABASE_BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || 'Files';

// Helper to upload resident government ID image to Supabase Storage
export const uploadValidIdImage = async (
  file: File,
  userId: string
): Promise<{ storagePath: string; publicUrl: string } | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `resident-valid-ids/${userId}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.warn(`Upload to bucket '${SUPABASE_BUCKET}' encountered error:`, uploadError.message);
      return null;
    }

    const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(filePath);
    return {
      storagePath: filePath,
      publicUrl: data.publicUrl,
    };
  } catch (err) {
    console.error('Supabase upload exception:', err);
    return null;
  }
};

export default supabase;
