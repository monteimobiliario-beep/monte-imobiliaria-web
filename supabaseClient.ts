
import { createClient } from '@supabase/supabase-js';

// Configurações de acesso à Cloud Monte Imobiliária
// Estas chaves permitem que a aplicação execute operações de leitura e escrita
const supabaseUrl = 'https://xhtgkvwtxmhsgifpewqv.supabase.co';
const supabaseAnonKey = 'sb_publishable_9A2Mld3ty3AfhVGiipFQUA_9z_Y8nl6';

// Inicialização do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
