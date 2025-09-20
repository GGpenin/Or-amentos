import React, { useState, useReducer, useMemo } from 'react';
import { Product, Quote, QuoteItem } from '../types';
import QuoteTable from './QuoteTable';
import { exportToCSV, exportToPDF, exportToDOC } from '../utils/export';

interface QuoteCreatorProps {
  products: Product[];
  onSave: (quote: Quote) => void;
  initialQuote?: Quote | null;
}

type QuoteAction =
  | { type: 'ADD_ITEM'; payload: QuoteItem }
  | { type: 'UPDATE_ITEM_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'SET_DISCOUNT'; payload: { value: number; type: 'percentage' | 'fixed' } }
  | { type: 'SET_TAX_RATE'; payload: number }
  | { type: 'SET_NAME'; payload: string }
  | { type: 'RESET'; payload: Quote };

const initialQuoteState: Quote = {
  id: '',
  name: '',
  items: [],
  discount: 0,
  discountType: 'percentage',
  taxRate: 0,
  createdAt: ''
};

function quoteReducer(state: Quote, action: QuoteAction): Quote {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.productId === action.payload.productId);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.productId === action.payload.productId
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      }
      return { ...state, items: [...state.items, action.payload] };
    case 'UPDATE_ITEM_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.productId === action.payload.productId ? { ...item, quantity: action.payload.quantity } : item
        ),
      };
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(item => item.productId !== action.payload) };
    case 'SET_DISCOUNT':
      return { ...state, discount: action.payload.value, discountType: action.payload.type };
    case 'SET_TAX_RATE':
      return { ...state, taxRate: action.payload };
    case 'SET_NAME':
        return { ...state, name: action.payload };
    case 'RESET':
        return action.payload;
    default:
      return state;
  }
}

const QuoteCreator: React.FC<QuoteCreatorProps> = ({ products, onSave, initialQuote }) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  const getInitialState = () => {
    if (initialQuote) return initialQuote;
    const date = new Date();
    return { ...initialQuoteState, id: date.toISOString(), createdAt: date.toISOString(), name: `Orçamento ${date.toLocaleDateString('pt-BR')}`};
  }

  const [quote, dispatch] = useReducer(quoteReducer, getInitialState());

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProductId && quantity > 0) {
      dispatch({ type: 'ADD_ITEM', payload: { productId: selectedProductId, quantity } });
      setSelectedProductId('');
      setQuantity(1);
    }
  };

  const handleSaveQuote = () => {
    if (quote.items.length === 0) {
      alert("Por favor, adicione pelo menos um item ao orçamento.");
      return;
    }
    onSave(quote);
  };
  
  const productOptions = useMemo(() => {
    const itemsInQuote = new Set(quote.items.map(item => item.productId));
    return products.filter(p => !itemsInQuote.has(p.id));
  }, [products, quote.items]);

  return (
    <div className="space-y-8">
       <div className="bg-[var(--bg-secondary)] p-6 rounded-lg shadow-lg border border-[var(--border-primary)]">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Criar Novo Orçamento</h2>
          <p className="text-[var(--text-secondary)] mb-6">Adicione produtos do seu catálogo para montar um orçamento.</p>
          <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2">
                  <label htmlFor="product" className="block text-sm font-medium text-[var(--text-secondary)]">Produto</label>
                  <select
                      id="product"
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-[var(--bg-primary)] border-[var(--border-secondary)] focus:outline-none focus:ring-[var(--ring-accent)] focus:border-[var(--ring-accent)] sm:text-sm rounded-md"
                  >
                      <option value="">Selecione um produto</option>
                      {productOptions.map(p => (
                          <option key={p.id} value={p.id}>{p.name} - R${p.price.toFixed(2).replace('.', ',')}</option>
                      ))}
                  </select>
              </div>
              <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-[var(--text-secondary)]">Quantidade</label>
                  <input
                      type="number"
                      id="quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      min="1"
                      className="mt-1 block w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-secondary)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--ring-accent)] focus:border-[var(--ring-accent)]"
                  />
              </div>
              <button
                  type="submit"
                  disabled={!selectedProductId}
                  className="w-full bg-[var(--bg-accent)] text-[var(--text-inverted)] px-4 py-2 rounded-lg hover:bg-[var(--bg-accent-hover)] transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                  Adicionar Item
              </button>
          </form>
      </div>

      <QuoteTable 
        quote={quote} 
        products={products} 
        dispatch={dispatch} 
      />

      <div className="bg-[var(--bg-secondary)] p-6 rounded-lg shadow-lg flex flex-col md:flex-row justify-between items-center gap-4 border border-[var(--border-primary)]">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Ações</h2>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button onClick={() => exportToCSV(quote, products)} className="bg-[var(--bg-success)] text-white px-4 py-2 rounded-lg hover:bg-[var(--bg-success-hover)] transition-colors shadow-sm">Exportar CSV</button>
          <button onClick={() => exportToPDF(quote, products)} className="bg-[var(--bg-danger)] text-white px-4 py-2 rounded-lg hover:bg-[var(--bg-danger-hover)] transition-colors shadow-sm">Exportar PDF</button>
          <button onClick={() => exportToDOC(quote, products)} className="bg-[var(--bg-info)] text-white px-4 py-2 rounded-lg hover:bg-[var(--bg-info-hover)] transition-colors shadow-sm">Exportar DOC</button>
          <button onClick={handleSaveQuote} className="bg-[var(--bg-accent)] text-[var(--text-inverted)] px-4 py-2 rounded-lg hover:bg-[var(--bg-accent-hover)] transition-colors shadow-sm">Salvar Orçamento</button>
        </div>
      </div>
    </div>
  );
};

export default QuoteCreator;
