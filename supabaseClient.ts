
import { createClient } from '@supabase/supabase-js';

// Configurações de acesso à Cloud Monte Imobiliária
// Estas chaves permitem que a aplicação execute operações de leitura e escrita
const supabaseUrl = 'https://skklgfnceltuzgfpfujf.supabase.co';
const supabaseAnonKey = 'sb_publishable_s3vvX27iCYLid6-bTFi3OA_6mJ3v_s0';

// Inicialização do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
