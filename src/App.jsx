import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicCatalog from "./pages/PublicCatalog";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Vitrine Pública (Cardápio dinâmico, Sobre nós e Pedidos WhatsApp) */}
        <Route path="/" element={<PublicCatalog />} />

        {/* Login de Acesso Administrativo com Supabase Auth */}
        <Route path="/login" element={<Login />} />

        {/* Painel Administrativo Protegido (CRUD Completo de Bolos) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Redirecionamento padrão para rotas não encontradas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
