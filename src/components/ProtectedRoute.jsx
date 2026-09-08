import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { Loader2, AlertCircle } from "lucide-react";

export const ProtectedRoute = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    // 1. Obtém a sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Escuta mudanças na autenticação (login, logout, renovação de token)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Se o Supabase ainda não foi configurado nas variáveis de ambiente
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-sm border border-pink-200 text-center">
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-serif font-bold text-stone-800 mb-2">
            Configuração Pendente
          </h2>
          <p className="text-stone-600 text-sm mb-6">
            O Supabase ainda não foi configurado no arquivo <code className="bg-stone-100 px-2 py-0.5 rounded text-pink-600 font-mono">.env.local</code>.
            Adicione sua URL e Chave Anon para acessar a área administrativa.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-medium transition-colors text-sm"
          >
            Voltar ao Cardápio
          </a>
        </div>
      </div>
    );
  }

  // Enquanto valida a sessão do usuário
  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-pink-500 animate-spin mb-4" />
        <p className="text-stone-500 text-sm font-medium">
          Verificando permissões da Vó Nida...
        </p>
      </div>
    );
  }

  // Se não estiver logado, redireciona para a página de login
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
