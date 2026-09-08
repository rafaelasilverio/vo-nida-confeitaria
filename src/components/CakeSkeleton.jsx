import React from "react";

export const CakeCardSkeleton = () => {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-pink-100 flex flex-col animate-pulse">
      {/* Imagem simulada */}
      <div className="relative aspect-square bg-pink-100/60 rounded-2xl mb-4 overflow-hidden">
        <div className="absolute top-3 left-3 bg-pink-200 h-5 w-20 rounded-full" />
      </div>

      {/* Título e Descrição */}
      <div className="h-6 bg-pink-100/80 rounded-md w-3/4 mb-2" />
      <div className="h-4 bg-stone-100 rounded-md w-full mb-4" />

      {/* Seção de Preços e Botões */}
      <div className="space-y-3 mt-auto">
        {/* Tamanho Médio */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex justify-between items-center bg-stone-50 p-3 rounded-xl border border-stone-100">
            <div className="h-3 bg-stone-200 rounded w-12" />
            <div className="h-4 bg-pink-200 rounded w-16" />
          </div>
          <div className="w-12 h-11 bg-pink-200 rounded-xl" />
        </div>

        {/* Tamanho Grande */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex justify-between items-center bg-stone-50 p-3 rounded-xl border border-stone-100">
            <div className="h-3 bg-stone-200 rounded w-12" />
            <div className="h-4 bg-pink-200 rounded w-16" />
          </div>
          <div className="w-12 h-11 bg-pink-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const CakeGridSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <CakeCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default CakeGridSkeleton;
