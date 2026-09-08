import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import AdminCakeModal from "../components/AdminCakeModal";
import {
  Plus,
  Edit2,
  Trash2,
  LogOut,
  ExternalLink,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Cake,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export const AdminDashboard = () => {
  const [cakes, setCakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, inactive
  const [selectedCake, setSelectedCake] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [notification, setNotification] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();

  // Carrega a sessão e os bolos
  useEffect(() => {
    fetchUserAndCakes();
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchUserAndCakes = async () => {
    setLoading(true);
    try {
      // 1. Obtém dados do usuário autenticado
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
      }

      // 2. Busca todos os bolos ordenados por nome
      const { data, error } = await supabase
        .from("bolos")
        .select("*")
        .order("nome", { ascending: true });

      if (error) throw error;
      setCakes(data || []);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      showNotification("Não foi possível carregar os bolos. Verifique sua conexão.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Deseja realmente sair da área administrativa?")) {
      await supabase.auth.signOut();
      navigate("/login");
    }
  };

  const handleOpenAddModal = () => {
    setSelectedCake(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cake) => {
    setSelectedCake(cake);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (cake) => {
    try {
      const newStatus = !cake.ativo;
      const { error } = await supabase
        .from("bolos")
        .update({ ativo: newStatus })
        .eq("id", cake.id);

      if (error) throw error;

      setCakes(
        cakes.map((c) => (c.id === cake.id ? { ...c, ativo: newStatus } : c))
      );

      showNotification(
        `Bolo "${cake.nome}" ${newStatus ? "ativado no cardápio" : "desativado do cardápio"}!`
      );
    } catch (err) {
      console.error("Erro ao alternar status:", err);
      showNotification("Erro ao atualizar status do bolo.", "error");
    }
  };

  const handleDeleteCake = async (cake) => {
    const confirmMessage = `Tem certeza que deseja EXCLUIR permanentemente o bolo "${cake.nome}"?`;
    if (!window.confirm(confirmMessage)) return;

    setDeletingId(cake.id);
    try {
      const { error } = await supabase
        .from("bolos")
        .delete()
        .eq("id", cake.id);

      if (error) throw error;

      setCakes(cakes.filter((c) => c.id !== cake.id));
      showNotification(`Bolo "${cake.nome}" removido com sucesso!`);
    } catch (err) {
      console.error("Erro ao excluir:", err);
      showNotification("Erro ao excluir o bolo. Verifique suas permissões.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  // Filtros combinados de pesquisa e status
  const filteredCakes = useMemo(() => {
    return cakes.filter((cake) => {
      const matchesSearch =
        cake.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cake.categoria.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === "active") return cake.ativo === true;
      if (statusFilter === "inactive") return cake.ativo === false;
      return true;
    });
  }, [cakes, searchTerm, statusFilter]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = cakes.length;
    const active = cakes.filter((c) => c.ativo).length;
    const categories = new Set(cakes.map((c) => c.categoria)).size;
    return { total, active, categories };
  }, [cakes]);

  return (
    <div className="min-h-screen bg-pink-50/60 text-stone-800 pb-16">
      {/* Top Navbar */}
      <header className="bg-white border-b border-pink-100 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center border-2 border-pink-200 overflow-hidden shrink-0">
              <img
                src="/logo-vonida.png"
                alt="Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-serif font-bold text-stone-800">
                  Painel da Confeitaria
                </h1>
                <span className="bg-pink-100 text-pink-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Admin
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Logada como: <span className="font-semibold text-stone-700">{userEmail || "Administradora"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors"
            >
              <ExternalLink size={14} />
              <span>Ver Cardápio Público</span>
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-colors"
              title="Encerrar sessão"
            >
              <LogOut size={14} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Notificação Flutuante */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top-4 duration-300">
          <div
            className={`px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3 text-sm font-medium border ${
              notification.type === "error"
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-emerald-50 border-emerald-200 text-emerald-800"
            }`}
          >
            {notification.type === "error" ? (
              <AlertCircle size={18} className="text-red-500 shrink-0" />
            ) : (
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className="max-w-6xl mx-auto px-4 pt-8">
        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-3xl border border-pink-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500 shrink-0">
              <Cake size={24} />
            </div>
            <div>
              <p className="text-xs uppercase font-bold text-stone-400 tracking-wider">
                Total de Bolos
              </p>
              <h3 className="text-2xl font-serif font-bold text-stone-700">
                {stats.total}
              </h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-pink-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-xs uppercase font-bold text-stone-400 tracking-wider">
                Ativos no Cardápio
              </p>
              <h3 className="text-2xl font-serif font-bold text-emerald-600">
                {stats.active}
              </h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-pink-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500 shrink-0">
              <Sparkles size={24} />
            </div>
            <div>
              <p className="text-xs uppercase font-bold text-stone-400 tracking-wider">
                Categorias
              </p>
              <h3 className="text-2xl font-serif font-bold text-stone-700">
                {stats.categories}
              </h3>
            </div>
          </div>
        </div>

        {/* Barra de Ações: Busca, Filtros e Botão Novo Bolo */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-pink-100 shadow-xs mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Campo de Busca */}
          <div className="relative w-full md:w-80">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              type="text"
              placeholder="Buscar bolo ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-stone-800 text-sm"
            />
          </div>

          {/* Filtros de Status */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                statusFilter === "all"
                  ? "bg-pink-500 text-white shadow-xs"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              Todos ({cakes.length})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                statusFilter === "active"
                  ? "bg-emerald-500 text-white shadow-xs"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              Ativos ({stats.active})
            </button>
            <button
              onClick={() => setStatusFilter("inactive")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                statusFilter === "inactive"
                  ? "bg-stone-600 text-white shadow-xs"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              Inativos ({stats.total - stats.active})
            </button>
          </div>

          {/* Botão Novo Bolo */}
          <button
            onClick={handleOpenAddModal}
            className="w-full md:w-auto px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-sm font-bold shadow-md shadow-pink-200 flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
          >
            <Plus size={18} />
            <span>Adicionar Bolo</span>
          </button>
        </div>

        {/* Tabela / Cards de Bolos */}
        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-pink-100 shadow-xs">
            <Loader2 className="w-10 h-10 text-pink-500 animate-spin mx-auto mb-3" />
            <p className="text-stone-500 font-medium text-sm">
              Carregando catálogo do Supabase...
            </p>
          </div>
        ) : filteredCakes.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-pink-100 shadow-xs">
            <Cake size={48} className="text-pink-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-700 mb-1">
              Nenhum bolo encontrado
            </h3>
            <p className="text-stone-400 text-sm mb-6">
              {searchTerm
                ? "Não encontramos nenhum bolo com esse termo."
                : "Você ainda não possui bolos cadastrados com esse filtro."}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl"
              >
                Limpar Busca
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCakes.map((cake) => (
              <div
                key={cake.id}
                className={`bg-white rounded-3xl p-5 border transition-all flex flex-col justify-between shadow-xs hover:shadow-md ${
                  cake.ativo
                    ? "border-pink-100"
                    : "border-stone-200 bg-stone-50/60 opacity-80"
                }`}
              >
                <div>
                  {/* Topo do Card com Imagem e Badges */}
                  <div className="relative aspect-video rounded-2xl bg-pink-50 overflow-hidden mb-4 border border-pink-100">
                    <img
                      src={
                        cake.imagem_url ||
                        `/bolos/${cake.nome.toLowerCase().replace(/\s/g, "-")}.jpeg`
                      }
                      alt={cake.nome}
                      onError={(e) => {
                        e.target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=${cake.id}&backgroundColor=fbcfe8`;
                      }}
                      className="w-full h-full object-cover"
                    />

                    {/* Badge de Categoria */}
                    <span className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-pink-600 border border-pink-100 shadow-xs">
                      {cake.categoria}
                    </span>

                    {/* Badge de Status Ativo/Inativo */}
                    <span
                      className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs ${
                        cake.ativo
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-stone-200 text-stone-600"
                      }`}
                    >
                      {cake.ativo ? (
                        <>
                          <CheckCircle2 size={10} /> No Cardápio
                        </>
                      ) : (
                        <>
                          <XCircle size={10} /> Pausado
                        </>
                      )}
                    </span>
                  </div>

                  {/* Nome e Descrição */}
                  <h3 className="text-lg font-bold text-stone-800 leading-snug">
                    {cake.nome}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2 italic mb-4">
                    {cake.descricao || "Gostoso abraço de vó em cada fatia."}
                  </p>
                </div>

                {/* Preços e Ações */}
                <div className="pt-3 border-t border-stone-100 space-y-3">
                  {/* Valores Médio e Grande */}
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-pink-50/50 p-2 rounded-xl border border-pink-100">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">
                        Médio
                      </span>
                      <span className="text-sm font-bold text-pink-600">
                        R$ {Number(cake.preco_medio).toFixed(2)}
                      </span>
                    </div>
                    <div className="bg-pink-50/50 p-2 rounded-xl border border-pink-100">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">
                        Grande
                      </span>
                      <span className="text-sm font-bold text-pink-600">
                        R$ {Number(cake.preco_grande).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Barra de Ações: Alternar Ativo, Editar e Excluir */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleToggleStatus(cake)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                        cake.ativo
                          ? "bg-stone-100 hover:bg-stone-200 text-stone-700"
                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                      }`}
                      title={cake.ativo ? "Pausar vendas deste bolo" : "Reativar no cardápio"}
                    >
                      {cake.ativo ? (
                        <>
                          <EyeOff size={14} /> Pausar
                        </>
                      ) : (
                        <>
                          <Eye size={14} /> Ativar
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(cake)}
                      className="p-2 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-xl transition-colors"
                      title="Editar bolo e preços"
                    >
                      <Edit2 size={16} />
                    </button>

                    <button
                      onClick={() => handleDeleteCake(cake)}
                      disabled={deletingId === cake.id}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl transition-colors disabled:opacity-50"
                      title="Excluir bolo permanentemente"
                    >
                      {deletingId === cake.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de Adição/Edição de Bolo */}
      <AdminCakeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cake={selectedCake}
        onSaved={() => {
          fetchUserAndCakes();
          showNotification(
            selectedCake ? "Bolo atualizado com sucesso!" : "Novo bolo cadastrado com sucesso!"
          );
        }}
      />
    </div>
  );
};

export default AdminDashboard;
