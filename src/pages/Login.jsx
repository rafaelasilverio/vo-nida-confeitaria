import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { Lock, Mail, ArrowLeft, Loader2, AlertCircle } from "lucide-react";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Se o usuário já estiver logado, redireciona para o painel
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          navigate("/admin", { replace: true });
        }
      });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!isSupabaseConfigured || !supabase) {
      setErrorMessage("O Supabase ainda não foi configurado no arquivo .env.local.");
      return;
    }

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Por favor, preencha o e-mail e a senha.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("E-mail ou senha incorretos.");
        } else if (error.message.includes("Email not confirmed")) {
          throw new Error("E-mail não confirmado. Verifique a caixa de entrada ou desative a confirmação no painel do Supabase.");
        } else {
          throw error;
        }
      }

      if (data?.session) {
        const from = location.state?.from?.pathname || "/admin";
        navigate(from, { replace: true });
      }
    } catch (err) {
      setErrorMessage(err.message || "Ocorreu um erro ao tentar entrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Botão de Retorno */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500 hover:text-pink-600 transition-colors"
          >
            <ArrowLeft size={16} /> Voltar para o Cardápio
          </Link>
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-pink-100">
          {/* Logo e Título */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-pink-200 overflow-hidden shadow-sm">
              <img
                src="/logo-vonida.png"
                alt="Vó Nida Confeitaria"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
            <h1 className="text-2xl font-serif font-bold text-stone-700">
              Vó Nida Admin
            </h1>
            <p className="text-xs uppercase tracking-widest text-pink-500 font-semibold mt-1">
              Painel de Gerenciamento
            </p>
          </div>

          {/* Aviso se Supabase não estiver configurado */}
          {!isSupabaseConfigured && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-2xl flex items-start gap-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-amber-600" />
              <div>
                <strong>Atenção:</strong> Configure suas chaves do Supabase no arquivo{" "}
                <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env.local</code>{" "}
                para liberar o acesso.
              </div>
            </div>
          )}

          {/* Mensagem de Erro */}
          {errorMessage && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Formulário de Login */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <input
                  type="email"
                  required
                  placeholder="admin@vonida.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-stone-800 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-stone-800 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-md shadow-pink-200 transition-all flex items-center justify-center gap-2 mt-6 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Entrando...</span>
                </>
              ) : (
                <span>Acessar Painel</span>
              )}
            </button>
          </form>

          {/* Dica amigável */}
          <div className="mt-8 pt-6 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-400">
              Esqueceu sua senha? Você pode redefini-la diretamente no painel do Supabase em{" "}
              <span className="font-semibold text-stone-500">Authentication &gt; Users</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
