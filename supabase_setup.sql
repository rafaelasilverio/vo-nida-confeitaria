-- ==============================================================================
-- SCRIPT DE CONFIGURAÇÃO DO SUPABASE - VÓ NIDA CONFEITARIA
-- 100% Compatível com o Plano Gratuito (Free Tier)
-- ==============================================================================
-- Instruções:
-- 1. Acesse o painel do seu projeto no Supabase (https://supabase.com/dashboard)
-- 2. No menu lateral esquerdo, clique no ícone "SQL Editor"
-- 3. Clique em "+ New query"
-- 4. Cole todo o conteúdo deste arquivo e clique no botão "RUN" (ou Ctrl + Enter)
-- ==============================================================================

-- 1. CRIAÇÃO DA TABELA DE BOLOS / PRODUTOS
CREATE TABLE IF NOT EXISTS public.bolos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT DEFAULT 'Gostoso abraço de vó em cada fatia.',
    categoria TEXT NOT NULL DEFAULT 'Simples',
    preco_medio NUMERIC(10,2) NOT NULL DEFAULT 22.00,
    preco_grande NUMERIC(10,2) NOT NULL DEFAULT 37.00,
    imagem_url TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.bolos ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS DE SEGURANÇA (RLS) PARA A TABELA BOLOS
-- Remove políticas anteriores caso existam (para evitar duplicidade)
DROP POLICY IF EXISTS "Permitir leitura pública de bolos" ON public.bolos;
DROP POLICY IF EXISTS "Permitir inserção apenas para autenticados" ON public.bolos;
DROP POLICY IF EXISTS "Permitir atualização apenas para autenticados" ON public.bolos;
DROP POLICY IF EXISTS "Permitir exclusão apenas para autenticados" ON public.bolos;

-- Leitura pública: qualquer visitante do site pode visualizar os bolos
CREATE POLICY "Permitir leitura pública de bolos" 
ON public.bolos 
FOR SELECT 
USING (true);

-- Inserção: apenas administradores logados podem cadastrar novos bolos
CREATE POLICY "Permitir inserção apenas para autenticados" 
ON public.bolos 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Atualização: apenas administradores logados podem editar bolos existentes
CREATE POLICY "Permitir atualização apenas para autenticados" 
ON public.bolos 
FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

-- Exclusão: apenas administradores logados podem remover bolos
CREATE POLICY "Permitir exclusão apenas para autenticados" 
ON public.bolos 
FOR DELETE 
TO authenticated 
USING (true);


-- 4. CRIAÇÃO DO BUCKET DE STORAGE PARA FOTOS DOS BOLOS
-- Cria o bucket público "bolos" caso ele não exista
INSERT INTO storage.buckets (id, name, public)
VALUES ('bolos', 'bolos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 5. POLÍTICAS DE SEGURANÇA (RLS) PARA O STORAGE (storage.objects)
DROP POLICY IF EXISTS "Visualização pública de fotos de bolos" ON storage.objects;
DROP POLICY IF EXISTS "Upload de fotos apenas para autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Atualização de fotos apenas para autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Remoção de fotos apenas para autenticados" ON storage.objects;

-- Visualização pública: qualquer pessoa pode carregar as fotos na vitrine
CREATE POLICY "Visualização pública de fotos de bolos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'bolos');

-- Upload: apenas a dona/admin logada pode enviar fotos
CREATE POLICY "Upload de fotos apenas para autenticados" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'bolos');

-- Atualização de fotos: apenas usuários logados
CREATE POLICY "Atualização de fotos apenas para autenticados" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'bolos');

-- Exclusão de fotos: apenas usuários logados
CREATE POLICY "Remoção de fotos apenas para autenticados" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'bolos');


-- 6. CARGA INICIAL DE DADOS (SEED) - CARDÁPIO ORIGINAL DA VÓ NIDA
-- Insere os bolos se a tabela estiver vazia
INSERT INTO public.bolos (nome, descricao, categoria, preco_medio, preco_grande, imagem_url, ativo)
SELECT * FROM (VALUES
  -- Categoria Simples (Médio R$ 22,00 | Grande R$ 37,00)
  ('Amendoim', 'Delicioso bolo caseiro de amendoim torrado e moído.', 'Simples', 22.00, 37.00, NULL, true),
  ('Banana com canela', 'Bolo fofinho de banana com toque especial de canela.', 'Simples', 22.00, 37.00, NULL, true),
  ('Café', 'Aroma marcante e sabor reconfortante para a hora do café.', 'Simples', 22.00, 37.00, NULL, true),
  ('Canela', 'Sabor tradicional e aconchegante da pura canela.', 'Simples', 22.00, 37.00, NULL, true),
  ('Coco', 'Massa macia e úmida com flocos de coco.', 'Simples', 22.00, 37.00, NULL, true),
  ('Formigueiro', 'Massa fofinha com granulado de chocolate crocante.', 'Simples', 22.00, 37.00, NULL, true),
  ('Fubá', 'O clássico bolo de fubá da vovó, perfeito com café quentinho.', 'Simples', 22.00, 37.00, NULL, true),
  ('Fubá com goiabada', 'Combinação irresistível de fubá fofinho com pedaços de goiabada.', 'Simples', 22.00, 37.00, NULL, true),
  ('Laranja com calda', 'Bolo aromático com calda cítrica e molhadinha de laranja.', 'Simples', 22.00, 37.00, '/bolos/laranja.jpeg', true),
  ('Limão com calda', 'Frescor e leveza com calda natural de limão.', 'Simples', 22.00, 37.00, '/bolos/limao.jpeg', true),
  ('Maracujá com calda', 'Sabor marcante com calda artesanal de maracujá da fruta.', 'Simples', 22.00, 37.00, NULL, true),
  ('Milho', 'Cremoso, feito com milho selecionado e sabor de fazenda.', 'Simples', 22.00, 37.00, NULL, true),
  ('Tradicional', 'Massa clássica, leve e douradinha, como abraço de vó.', 'Simples', 22.00, 37.00, NULL, true),

  -- Categoria Especiais (Médio R$ 27,00 | Grande R$ 48,00)
  ('Beijinho', 'Coberto com brigadeiro branco cremoso e coco ralado.', 'Especiais', 27.00, 48.00, '/bolos/beijinho.jpeg', true),
  ('Cenoura c/ brigadeiro', 'O queridinho: massa de cenoura com farta cobertura de brigadeiro.', 'Especiais', 27.00, 48.00, NULL, true),
  ('Churros', 'Massa aromática de canela recheada e coberta com doce de leite.', 'Especiais', 27.00, 48.00, '/bolos/churros.jpeg', true),
  ('Chocolate c/ brigadeiro', 'Para os apaixonados por cacau, pura intensidade e doçura.', 'Especiais', 27.00, 48.00, '/bolos/chocolate.jpeg', true),
  ('Cocadinha', 'Bolo com cobertura dourada e caramelizada de cocada.', 'Especiais', 27.00, 48.00, '/bolos/cocada.jpeg', true),
  ('Limão cobertura mousse', 'Refrescante massa com cobertura aveludada de mousse de limão.', 'Especiais', 27.00, 48.00, NULL, true),
  ('Maracujá cobert. mousse', 'Equilíbrio perfeito do azedinho do maracujá com textura cremosa.', 'Especiais', 27.00, 48.00, '/bolos/maracujacobert.mousse.jpeg', true),
  ('Pé de Moleque', 'Sabor de festa com amendoim crocante e caramelo suave.', 'Especiais', 27.00, 48.00, NULL, true),
  ('Prestígio', 'Chocolate com coco: uma das combinações mais amadas do Brasil.', 'Especiais', 27.00, 48.00, '/bolos/prestigio.jpeg', true),
  ('Romeu e Julieta', 'O casamento perfeito do queijo suave com a doçura da goiabada.', 'Especiais', 27.00, 48.00, NULL, true)
) AS v(nome, descricao, categoria, preco_medio, preco_grande, imagem_url, ativo)
WHERE NOT EXISTS (SELECT 1 FROM public.bolos LIMIT 1);
