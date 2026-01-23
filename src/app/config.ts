if (!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  alert("VITE_SUPABASE_PUBLISHABLE_KEY is required");
  throw new Error("VITE_SUPABASE_PUBLISHABLE_KEY is required");
}
if (!import.meta.env.VITE_SUPABASE_URL) {
  alert("VITE_SUPABASE_URL is required");
  throw new Error("VITE_SUPABASE_URL is required");
}

// TODO: supabase中有几种密钥，看下哪种合适，关乎到edge function中的details中的jwt校验
export const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export const UPLOAD_CONFIG = {
  maxSize: Number(import.meta.env.VITE_UPLOAD_MAX_SIZE),
  allowedTypes: (import.meta.env.VITE_UPLOAD_ALLOWED_TYPES).split(',')
} as const;
