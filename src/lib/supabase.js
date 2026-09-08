import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Verifica se as credenciais foram preenchidas e não são apenas o exemplo padrão
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "https://seu-projeto.supabase.co" &&
    !supabaseUrl.includes("seu-projeto")
);

// Cria e exporta o cliente do Supabase
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Função utilitária para fazer upload de imagem no Supabase Storage (bucket 'bolos')
 * e retornar a URL pública permanente da imagem.
 */
export async function uploadCakeImage(file) {
  if (!supabase) {
    throw new Error("Cliente Supabase não está configurado. Verifique as variáveis de ambiente.");
  }

  // Gera um nome único e seguro para o arquivo
  const fileExt = file.name.split(".").pop();
  const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `fotos/${cleanFileName}`;

  const { error: uploadError } = await supabase.storage
    .from("bolos")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  // Recupera a URL pública para salvar na coluna 'imagem_url' da tabela 'bolos'
  const { data } = supabase.storage
    .from("bolos")
    .getPublicUrl(filePath);

  return data.publicUrl;
}