import React, { useState, useMemo } from 'react';
import { Search, ShoppingCart, Plus, Minus, X, Instagram, Phone, MapPin, Heart, Trash2 } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('cardapio');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Dados dos bolos baseados na imagem do cardápio
  const cakeData = [
    // Grupo 1: Médio R$22,00 | Grande R$37,00
    ...['Amendoim', 'Banana com canela', 'Café', 'Canela', 'Coco', 'Formigueiro', 'Fubá', 'Fubá com goiabada', 'Laranja com calda', 'Limão com calda', 'Maracujá com calda', 'Milho', 'Tradicional'].map(name => ({
      id: name.toLowerCase().replace(/\s/g, '-'),
      name,
      prices: { medio: 22, grande: 37 },
      category: 'Simples'
    })),
    // Grupo 2: Médio R$27,00 | Grande R$48,00
    ...['Beijinho', 'Cenoura c/ brigadeiro', 'Churros', 'Chocolate c/ brigadeiro', 'Cocadinha', 'Limão cobertura mousse', 'Maracujá cobert. mousse', 'Pé de Moleque', 'Prestígio', 'Romeu e Julieta'].map(name => ({
      id: name.toLowerCase().replace(/\s/g, '-'),
      name,
      prices: { medio: 27, grande: 48 },
      category: 'Especiais'
    }))
  ];

  const filteredCakes = useMemo(() => {
    return cakeData.filter(cake => 
      cake.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Função para pegar a quantidade de um item específico no carrinho
  const getItemQuantity = (cakeId, size) => {
    const item = cart.find(i => i.cartId === `${cakeId}-${size}`);
    return item ? item.quantity : 0;
  };

  const addToCart = (cake, size) => {
    const cartId = `${cake.id}-${size}`;
    const existingItem = cart.find(item => item.cartId === cartId);

    if (existingItem) {
      setCart(cart.map(item => 
        item.cartId === cartId ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { 
        cartId, 
        id: cake.id, 
        name: cake.name, 
        size, 
        price: cake.prices[size], 
        quantity: 1 
      }]);
    }
  };

  const removeFromCart = (cakeId, size) => {
    const cartId = `${cakeId}-${size}`;
    const existingItem = cart.find(item => item.cartId === cartId);

    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(item => 
        item.cartId === cartId ? { ...item, quantity: item.quantity - 1 } : item
      ));
    } else {
      setCart(cart.filter(item => item.cartId !== cartId));
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const finalizePurchase = () => {
    const phoneNumber = "5514996746904";
    let message = "Olá, gostaria de realizar um pedido:\n\n";
    
    cart.forEach(item => {
      const sizeLabel = item.size === 'medio' ? 'Médio' : 'Grande';
      message += `- Bolo de ${item.name} (${sizeLabel}) x${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    });

    message += `\n*Total: R$ ${cartTotal.toFixed(2)}*`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-pink-50 text-stone-800 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col items-center sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3 mb-4 sm:mb-0">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-pink-200">
               <img src="https://api.dicebear.com/7.x/initials/svg?seed=VN&backgroundColor=f472b6" alt="Vó Nida Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-stone-700 leading-tight">Vó Nida</h1>
              <p className="text-xs uppercase tracking-widest text-pink-500 font-semibold">Confeitaria Artesanal</p>
            </div>
          </div>

          <nav className="flex bg-pink-100 rounded-full p-1">
            <button 
              onClick={() => setActiveTab('cardapio')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'cardapio' ? 'bg-white text-pink-600 shadow-sm' : 'text-stone-500 hover:text-pink-500'}`}
            >
              Cardápio
            </button>
            <button 
              onClick={() => setActiveTab('sobre')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'sobre' ? 'bg-white text-pink-600 shadow-sm' : 'text-stone-500 hover:text-pink-500'}`}
            >
              Sobre Nós
            </button>
          </nav>
        </div>
      </header>

      {/* Search Bar */}
      {activeTab === 'cardapio' && (
        <div className="max-w-5xl mx-auto px-4 mt-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-pink-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Qual bolo você deseja hoje?" 
              className="w-full pl-12 pr-4 py-4 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-pink-300 transition-all outline-none text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 pb-24">
        {activeTab === 'cardapio' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCakes.length > 0 ? (
              filteredCakes.map((cake) => (
                <div key={cake.id} className="bg-white rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow border border-pink-100 flex flex-col">
                  <div className="relative aspect-square bg-pink-50 rounded-2xl mb-4 overflow-hidden">
                    <img 
                      src={`https://api.dicebear.com/7.x/shapes/svg?seed=${cake.id}&backgroundColor=fbcfe8`} 
                      alt={cake.name}
                      className="w-full h-full object-cover opacity-80"
                    />
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-pink-600 border border-pink-100">
                      {cake.category}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-stone-700 mb-1">{cake.name}</h3>
                  <p className="text-sm text-stone-500 mb-4 flex-grow italic">Gostoso abraço de vó em cada fatia.</p>
                  
                  <div className="space-y-3">
                    {/* Botão Médio */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex justify-between items-center bg-stone-50 p-3 rounded-xl border border-stone-100">
                        <span className="text-xs font-bold uppercase text-stone-500">Médio</span>
                        <span className="text-pink-600 font-bold">R$ {cake.prices.medio},00</span>
                      </div>
                      <div className="flex items-center bg-white border border-pink-100 rounded-xl overflow-hidden shadow-sm">
                        {getItemQuantity(cake.id, 'medio') > 0 && (
                          <>
                            <button 
                              onClick={() => removeFromCart(cake.id, 'medio')}
                              className="p-3 text-pink-500 hover:bg-pink-50 transition-colors"
                            >
                              <Minus size={18} />
                            </button>
                            <span className="w-8 text-center font-bold text-stone-700">{getItemQuantity(cake.id, 'medio')}</span>
                          </>
                        )}
                        <button 
                          onClick={() => addToCart(cake, 'medio')}
                          className="p-3 bg-pink-500 text-white hover:bg-pink-600 transition-colors"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Botão Grande */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex justify-between items-center bg-stone-50 p-3 rounded-xl border border-stone-100">
                        <span className="text-xs font-bold uppercase text-stone-500">Grande</span>
                        <span className="text-pink-600 font-bold">R$ {cake.prices.grande},00</span>
                      </div>
                      <div className="flex items-center bg-white border border-pink-100 rounded-xl overflow-hidden shadow-sm">
                        {getItemQuantity(cake.id, 'grande') > 0 && (
                          <>
                            <button 
                              onClick={() => removeFromCart(cake.id, 'grande')}
                              className="p-3 text-pink-500 hover:bg-pink-50 transition-colors"
                            >
                              <Minus size={18} />
                            </button>
                            <span className="w-8 text-center font-bold text-stone-700">{getItemQuantity(cake.id, 'grande')}</span>
                          </>
                        )}
                        <button 
                          onClick={() => addToCart(cake, 'grande')}
                          className="p-3 bg-pink-500 text-white hover:bg-pink-600 transition-colors"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <p className="text-stone-400 text-lg italic">Nenhum bolo encontrado com esse nome...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm max-w-3xl mx-auto border border-pink-100">
            <div className="h-64 bg-pink-100 flex items-center justify-center">
               <span className="text-pink-300 font-serif italic text-2xl">[Imagem da Confeitaria / Vó Nida]</span>
            </div>
            <div className="p-8 md:p-12">
              <h2 className="text-3xl font-serif font-bold text-stone-700 mb-6 flex items-center gap-3">
                Nossa História <Heart className="text-pink-400 fill-pink-400" size={24} />
              </h2>
              <div className="space-y-4 text-stone-600 leading-relaxed text-lg">
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p>
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
                  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
                <div className="pt-6 border-t border-pink-50 mt-6 italic text-pink-500 font-serif text-xl text-center">
                  "O segredo é colocar amor em cada receita."
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <button 
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 bg-pink-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 flex items-center gap-2"
        >
          <div className="relative">
            <ShoppingCart size={28} />
            <span className="absolute -top-2 -right-2 bg-white text-pink-600 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-pink-500">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </div>
          <span className="hidden sm:inline font-bold pr-2">R$ {cartTotal.toFixed(2)}</span>
        </button>
      )}

      {/* Cart Sidebar Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[60] flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b flex justify-between items-center bg-pink-50/50">
              <h2 className="text-2xl font-serif font-bold text-stone-700">Seu Pedido</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.map((item) => (
                <div key={item.cartId} className="flex gap-4">
                  <div className="w-16 h-16 bg-pink-50 rounded-xl flex items-center justify-center text-pink-200 shrink-0 border border-pink-100 overflow-hidden">
                    <img 
                      src={`https://api.dicebear.com/7.x/shapes/svg?seed=${item.id}&backgroundColor=fbcfe8`} 
                      alt={item.name}
                      className="w-full h-full object-cover p-1"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-stone-700 leading-tight">Bolo de {item.name}</h4>
                      <button onClick={() => setCart(cart.filter(i => i.cartId !== item.cartId))} className="text-stone-300 hover:text-red-400 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <p className="text-xs text-stone-500 mt-1 uppercase tracking-wider">Tamanho: {item.size === 'medio' ? 'Médio' : 'Grande'}</p>
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center gap-1 bg-stone-50 rounded-lg p-1 border border-stone-100">
                        <button onClick={() => removeFromCart(item.id, item.size)} className="p-1 hover:bg-white rounded-md text-stone-500"><Minus size={14} /></button>
                        <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                        <button onClick={() => addToCart({id: item.id}, item.size)} className="p-1 hover:bg-white rounded-md text-stone-500"><Plus size={14} /></button>
                      </div>
                      <span className="font-bold text-pink-600">R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t bg-stone-50 space-y-4">
              <div className="flex justify-between items-center text-lg">
                <span className="text-stone-500 font-medium">Subtotal</span>
                <span className="font-bold text-stone-700 text-2xl">R$ {cartTotal.toFixed(2)}</span>
              </div>
              <button 
                onClick={finalizePurchase}
                className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-green-200 flex items-center justify-center gap-3 transition-all active:scale-95"
              >
                Finalizar no WhatsApp
              </button>
              <p className="text-center text-[10px] text-stone-400 uppercase tracking-widest font-semibold">
                Entregas a domicílio em Tupã - SP
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-stone-800 text-stone-300 py-12 px-4 text-center mt-12 border-t-8 border-pink-400">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-sm font-medium uppercase tracking-widest">
            <a href="tel:5514996746904" className="flex items-center gap-2 hover:text-pink-400 transition-colors">
              <Phone size={18} /> (14) 99674-6904
            </a>
            <span className="flex items-center gap-2">
              <MapPin size={18} /> Tupã - SP
            </span>
            <a href="https://instagram.com/vonidaconfeitaria" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-pink-400 transition-colors">
              <Instagram size={18} /> @vonidaconfeitaria
            </a>
          </div>
          
          <div className="h-px bg-stone-700 max-w-xs mx-auto"></div>
          
          <div className="space-y-2">
            <p className="text-stone-400 text-xs italic opacity-75">"Gostoso abraço de vó"</p>
            <p className="text-white font-serif italic text-lg flex items-center justify-center gap-2">
              Site feito com amor por Rafaela Petelin, neta da Vó Nida <Heart size={16} className="fill-pink-500 text-pink-500" />
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;