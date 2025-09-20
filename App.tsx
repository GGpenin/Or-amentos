import React, { useState, useCallback, useEffect } from 'react';
import { Product, Quote, Theme } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import ProductManager from './components/ProductManager';
import QuoteCreator from './components/QuoteCreator';
import SavedQuotes from './components/SavedQuotes';
import Calculator from './components/Calculator';
import ThemeSwitcher from './components/ThemeSwitcher';
import { PlusCircleIcon, DocumentTextIcon, ArchiveBoxIcon } from './components/Icons';

type View = 'quote' | 'products' | 'saved';

const App: React.FC = () => {
  const [products, setProducts] = useLocalStorage<Product[]>('products', []);
  const [quotes, setQuotes] = useLocalStorage<Quote[]>('quotes', []);
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'claro');
  const [activeQuote, setActiveQuote] = useState<Quote | null>(null);
  const [currentView, setCurrentView] = useState<View>('quote');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleSaveQuote = (quote: Quote) => {
    const existingIndex = quotes.findIndex(q => q.id === quote.id);
    if (existingIndex > -1) {
      const updatedQuotes = [...quotes];
      updatedQuotes[existingIndex] = quote;
      setQuotes(updatedQuotes);
    } else {
      setQuotes([...quotes, quote]);
    }
    setActiveQuote(null); // Clear active quote after saving
  };

  const handleLoadQuote = useCallback((quote: Quote) => {
    setActiveQuote(quote);
    setCurrentView('quote');
  }, []);

  const handleDeleteQuote = (quoteId: string) => {
    setQuotes(quotes.filter(q => q.id !== quoteId));
  };

  const createNewQuote = () => {
    setActiveQuote(null);
    setCurrentView('quote');
  };

  const renderView = () => {
    switch (currentView) {
      case 'products':
        return <ProductManager products={products} setProducts={setProducts} quotes={quotes} />;
      case 'saved':
        return <SavedQuotes quotes={quotes} onLoad={handleLoadQuote} onDelete={handleDeleteQuote} />;
      case 'quote':
      default:
        return <QuoteCreator 
                  products={products} 
                  onSave={handleSaveQuote} 
                  initialQuote={activeQuote}
                  key={activeQuote?.id || 'new'} 
                />;
    }
  };

  const NavButton: React.FC<{ view: View; label: string; icon: React.ReactNode }> = ({ view, label, icon }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
        currentView === view
          ? 'bg-[var(--bg-accent)] text-[var(--text-inverted)] shadow-md'
          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen font-sans text-[var(--text-primary)] transition-colors duration-300">
      <header className="bg-[var(--bg-secondary)] shadow-md sticky top-0 z-20 border-b border-[var(--border-primary)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <DocumentTextIcon className="w-8 h-8 text-[var(--text-accent)]" />
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Gerador de Orçamentos Pro</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-2">
              <ThemeSwitcher currentTheme={theme} setTheme={setTheme} />
              <button
                onClick={createNewQuote}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
              >
                <PlusCircleIcon className="w-5 h-5" />
                <span>Novo Orçamento</span>
              </button>
              <NavButton view="saved" label="Orçamentos Salvos" icon={<ArchiveBoxIcon className="w-5 h-5" />} />
              <NavButton view="products" label="Gerenciar Produtos" icon={<DocumentTextIcon className="w-5 h-5" />} />
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderView()}
      </main>
      
      <Calculator />

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--bg-secondary)] border-t border-[var(--border-primary)] md:hidden z-20">
        <div className="flex justify-around items-center h-16">
           <button onClick={createNewQuote} className="flex flex-col items-center text-[var(--text-secondary)] hover:text-[var(--text-accent)]">
             <PlusCircleIcon className="w-6 h-6 mb-1"/>
             <span className="text-xs">Novo</span>
           </button>
           <button onClick={() => setCurrentView('saved')} className={`flex flex-col items-center hover:text-[var(--text-accent)] ${currentView === 'saved' ? 'text-[var(--text-accent)]' : 'text-[var(--text-secondary)]'}`}>
             <ArchiveBoxIcon className="w-6 h-6 mb-1"/>
             <span className="text-xs">Salvos</span>
           </button>
           <button onClick={() => setCurrentView('products')} className={`flex flex-col items-center hover:text-[var(--text-accent)] ${currentView === 'products' ? 'text-[var(--text-accent)]' : 'text-[var(--text-secondary)]'}`}>
             <DocumentTextIcon className="w-6 h-6 mb-1"/>
             <span className="text-xs">Produtos</span>
           </button>
        </div>
      </div>
    </div>
  );
};

export default App;