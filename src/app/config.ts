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

export const ENABLED_BOTS = [
  'chatgpt',
  'claude',
  'deepseek',
  'perplexity',
  'gemini',
] as const

export const BOT_DEFAULT_CONFIG = {
  chatgpt: {
    models: [
      'openai/gpt-3.5-turbo',
      'openai/gpt-4',
      'openai/gpt-4-turbo',
      'openai/gpt-4o-mini',
    ],
  },
  claude: {
    models: [
      'anthropic/claude-3.5-sonnet',
      'anthropic/claude-3.7-sonnet',
      'anthropic/claude-sonnet-4',
      'anthropic/claude-3-opus',
    ],
  },
  deepseek: {
    models: [
      'deepseek/deepseek-chat',
      'deepseek/deepseek-reasoner',
      'deepseek/deepseek-chat-v3-0324',
    ],
  },
  perplexity: {
    models: [
      'perplexity/pplx-70b-online',
      'perplexity/pplx-7b-online',
    ],
  },
  gemini: {
    models: [
      'google/gemini-pro',
      'google/gemini-pro-vision',
    ],
  },
} as const

// TODO：这个OPENROUTER_API_KEY其实是不需要的，看怎么优化掉
export const OPENROUTER_API_KEY = 'your-openrouter-api-key-here'
