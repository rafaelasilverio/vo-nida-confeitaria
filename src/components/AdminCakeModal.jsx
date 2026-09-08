import React, { useState, useEffect } from "react";
import { X, Upload, Loader2, Image as ImageIcon, AlertCircle } from "lucide-react";
import { supabase, uploadCakeImage } from "../lib/supabase";

export const AdminCakeModal = ({ isOpen, onClose, cake, onSaved }) => {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("Simples");
  const [precoMedio, setPrecoMedio] = useState("");
  const [precoGrande, setPrecoGrande] = useState("");
  const [ativo, setAtivo] = useState(true);
  
  // Imagem
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  
  // Estados de controle
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Preenche os campos caso seja edição ou limpa caso seja novo
  useEffect(() => {
    if (cake) {
      setNome(cake.nome || "");
      setDescricao(cake.descricao || "Gostoso abraço de vó em cada fatia.");
      setCategoria(cake.categoria || "Simples");
      setPrecoMedio(cake.preco_medio !== undefined ? cake.preco_medio.toString() : "");
      setPrecoGrande(cake.preco_grande !== undefined ? cake.preco_grande.toString() : "");
      setAtivo(cake.ativo !== undefined ? cake.ativo : true);
      setCurrentImageUrl(cake.imagem_url || "");
      setImagePreview(cake.imagem_url || "");
      setImageFile(null);
    } else {
      setNome("");
      setDescricao("Gostoso abraço de vó em cada fatia.");
      setCategoria("Simples");
      setPrecoMedio("22.00");
      setPrecoGrande("37.00");
      setAtivo(true);
      setCurrentImageUrl("");
      setImagePreview("");
      setImageFile(null);
    }
    setErrorMessage("");
  }, [cake, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação de tipo de arquivo
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Por favor, selecione um arquivo de imagem válido (JPG, PNG, WEBP).");
      return;
    }

    // Limite de tamanho: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("A imagem deve ter no máximo 5MB.");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!nome.trim()) {
      setErrorMessage("Por favor, informe o nome do bolo.");
      return;
    }

    const numMedio = parseFloat(precoMedio.replace(",", "."));
    const numGrande = parseFloat(precoGrande.replace(",", "."));

    if (isNaN(numMedio) || numMedio < 0 || isNaN(numGrande) || numGrande < 0) {
      setErrorMessage("Por favor, informe preços válidos para os tamanhos Médio e Grande.");
      return;
    }

    setLoading(true);

    try {
      let finalImageUrl = currentImageUrl;

      // Se o usuário selecionou uma nova imagem, faz o upload para o Supabase Storage
      if (imageFile) {
        finalImageUrl = await uploadCakeImage(imageFile);
      }

      const cakeData = {
        nome: nome.trim(),
        descricao: descricao.trim(),
        categoria: categoria.trim(),
        preco_medio: numMedio,
        preco_grande: numGrande,
        imagem_url: finalImageUrl || null,
        ativo: ativo,
      };

      if (cake?.id) {
        // Operação de EDIÇÃO (UPDATE)
        const { error } = await supabase
          .from("bolos")
          .update(cakeData)
          .eq("id", cake.id);

        if (error) throw error;
      } else {
        // Operação de CADASTRO (INSERT)
        const { error } = await supabase
          .from("bolos")
          .insert([cakeData]);

        if (error) throw error;
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error("Erro ao salvar bolo:", err);
      setErrorMessage(
        err.message?.includes("bucket") 
          ? "Erro no Storage: certifique-se de executar o script SQL para criar o bucket 'bolos'."
          : `Erro ao salvar: ${err.message || "Tente novamente mais tarde."}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-8 border border-pink-100 animate-in fade-in zoom-in duration-200">
        {/* Cabeçalho do Modal */}
        <div className="flex justify-between items-center pb-4 border-b border-pink-100 mb-6">
          <div>
            <h3 className="text-xl font-serif font-bold text-stone-800">
              {cake ? "Editar Bolo" : "Adicionar Novo Bolo"}
            </h3>
            <p className="text-xs text-stone-500">
              {cake ? "Atualize os dados e preços do cardápio" : "Cadastre uma nova receita deliciosa"}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mensagem de Erro */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
              Nome do Bolo *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Cenoura com Chocolate"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-stone-800 text-sm"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
              Descrição Afetiva
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Gostoso abraço de vó em cada fatia."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-stone-800 text-sm resize-none"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
              Categoria
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCategoria("Simples")}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  categoria === "Simples"
                    ? "bg-pink-1000 border-pink-400 text-pink-700 font-bold bg-pink-50"
                    : "border-stone-200 text-stone-600 hover:bg-stone-50"
                }`}
              >
                Simples
              </button>
              <button
                type="button"
                onClick={() => setCategoria("Especiais")}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  categoria === "Especiais"
                    ? "bg-pink-1000 border-pink-400 text-pink-700 font-bold bg-pink-50"
                    : "border-stone-200 text-stone-600 hover:bg-stone-50"
                }`}
              >
                Especiais
              </button>
            </div>
          </div>

          {/* Preços (Médio e Grande) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Preço Médio (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-bold">
                  R$
                </span>
                <input
                  type="number"
                  step="0.50"
                  min="0"
                  required
                  placeholder="22.00"
                  value={precoMedio}
                  onChange={(e) => setPrecoMedio(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-stone-800 text-sm font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Preço Grande (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-bold">
                  R$
                </span>
                <input
                  type="number"
                  step="0.50"
                  min="0"
                  required
                  placeholder="37.00"
                  value={precoGrande}
                  onChange={(e) => setPrecoGrande(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-stone-800 text-sm font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Upload de Imagem (Supabase Storage) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
              Foto do Bolo
            </label>
            
            <div className="flex items-center gap-4">
              {/* Preview da foto */}
              <div className="w-20 h-20 rounded-2xl bg-pink-50 border border-pink-200 overflow-hidden flex items-center justify-center shrink-0">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Pré-visualização"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon size={28} className="text-pink-300" />
                )}
              </div>

              {/* Botão de escolha */}
              <div className="flex-1">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-pink-300 bg-pink-50/50 hover:bg-pink-100/50 text-pink-600 text-xs font-bold transition-all">
                  <Upload size={16} />
                  <span>{imageFile ? "Trocar imagem selecionada" : "Selecionar foto do computador"}</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
                <p className="text-[11px] text-stone-400 mt-1">
                  Formatos aceitos: JPG, PNG ou WEBP (até 5MB).
                </p>
              </div>
            </div>
          </div>

          {/* Disponibilidade (Status Ativo/Inativo) */}
          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={ativo}
                onChange={(e) => setAtivo(e.target.checked)}
                className="w-4 h-4 text-pink-600 rounded focus:ring-pink-400 accent-pink-500"
              />
              <span className="text-sm font-medium text-stone-700">
                Bolo ativo (visível no cardápio para os clientes)
              </span>
            </label>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 font-medium text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold text-sm shadow-md shadow-pink-200 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Salvando no Supabase...</span>
                </>
              ) : (
                <span>{cake ? "Atualizar Bolo" : "Cadastrar Bolo"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCakeModal;
