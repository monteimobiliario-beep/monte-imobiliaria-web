
import { createClient } from '@supabase/supabase-js';

// Configurações de acesso à Cloud Monte Imobiliária
// Estas chaves permitem que a aplicação execute operações de leitura e escrita
// Sanitize and validate URL
const getSanitizedUrl = (url: string) => {
  if (!url) return '';
  let sanitized = url.trim();
  // Remove any internal spaces (typo common in copy-pasting)
  sanitized = sanitized.replace(/\s+/g, '');
  // Handle common typo cases from user input
  if (sanitized.includes('https::')) sanitized = sanitized.replace('https::', 'https://');
  if (sanitized.includes('http://:')) sanitized = sanitized.replace('http://:', 'http://');
  if (sanitized.includes('https://:')) sanitized = sanitized.replace('https://:', 'https://');
  
  if (!sanitized.startsWith('http') && sanitized.length > 0) sanitized = `https://${sanitized}`;
  
  if (sanitized.length > 0 && !sanitized.includes('.supabase.co') && !sanitized.includes('localhost')) {
     sanitized = sanitized.endsWith('/') ? sanitized.slice(0, -1) : sanitized;
     sanitized = `${sanitized}.supabase.co`;
  }
  return sanitized;
};

const rawUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qiqlntnxzozsedpmynlr.supabase.co';
const supabaseUrl = getSanitizedUrl(rawUrl);
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-clWChvAhC3RYBlLPuAO6w_2PUNKzRt').trim();

console.log('Initializing Supabase with URL:', supabaseUrl);

// Inicialização do cliente Supabase com tratamento de erro
let supabaseInstance: any;
try {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'monte-auth-token',
      // No recent version supports disabling locks easily via generic options without custom storage,
      // but we can ensure the instance is clean.
    }
  });
} catch (error) {
  console.error('FAILED to initialize Supabase client:', error);
  supabaseInstance = {
    auth: { onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }), getSession: async () => ({ data: { session: null }, error: new Error('Invalid Supabase Configuration') }), signOut: async () => {} },
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: new Error('Invalid Supabase Configuration') }) }) }) })
  } as any;
}

// Helpers para acessar os esquemas corporativos (hr, fleet, finance, catalog, core)
export const db = {
  hr: (table: string) => supabaseInstance.schema('hr').from(table),
  fleet: (table: string) => supabaseInstance.schema('fleet').from(table),
  finance: (table: string) => supabaseInstance.schema('finance').from(table),
  catalog: (table: string) => supabaseInstance.schema('catalog').from(table),
  core: (table: string) => supabaseInstance.schema('core').from(table),
  public: (table: string) => supabaseInstance.from(table)
};

export const supabase = supabaseInstance;

