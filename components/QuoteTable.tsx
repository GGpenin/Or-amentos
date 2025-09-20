import React, { useMemo } from 'react';
import { Quote, Product } from '../types';
import { TrashIcon } from './Icons';

interface QuoteTableProps {
  quote: Quote;
  products: Product[];
  dispatch: React.Dispatch<any>; // Simplified for demonstration
}

const QuoteTable: React.FC<QuoteTableProps> = ({ quote, products, dispatch }) => {
  const productsMap = useMemo(() => {
    return new Map(products.map(p => [p.id, p]));
  }, [products]);

  const subtotal = useMemo(() => {
    return quote.items.reduce((acc, item) => {
      const product = productsMap.get(item.productId);
      return acc + (product ? product.price * item.quantity : 0);
    }, 0);
  }, [quote.items, productsMap]);

  const discountAmount = useMemo(() => {
    if (quote.discountType === 'fixed') {
      return quote.discount;
    }
    return subtotal * (quote.discount / 100);
  }, [subtotal, quote.discount, quote.discountType]);

  const totalAfterDiscount = subtotal - discountAmount;

  const taxAmount = useMemo(() => {
    return totalAfterDiscount * (quote.taxRate / 100);
  }, [totalAfterDiscount, quote.taxRate]);

  const grandTotal = totalAfterDiscount + taxAmount;
  
  const formatCurrency = (amount: number) => `R$${amount.toFixed(2).replace('.', ',')}`;

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity >= 1) {
      dispatch({ type: 'UPDATE_ITEM_QUANTITY', payload: { productId, quantity } });
    }
  };

  const handleRemoveItem = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  };
  
  const handleDiscountChange = (value: number) => {
      dispatch({ type: 'SET_DISCOUNT', payload: { value, type: quote.discountType } });
  }

  const handleDiscountTypeChange = (type: 'percentage' | 'fixed') => {
      dispatch({ type: 'SET_DISCOUNT', payload: { value: quote.discount, type } });
  }

  return (
    <div className="bg-[var(--bg-secondary)] p-6 rounded-lg shadow-lg border border-[var(--border-primary)]">
      <div className="mb-4">
        <label htmlFor="quoteName" className="block text-sm font-medium text-[var(--text-secondary)]">Nome do Orçamento</label>
        <input
          type="text"
          id="quoteName"
          value={quote.name}
          onChange={(e) => dispatch({ type: 'SET_NAME', payload: e.target.value })}
          className="mt-1 block w-full md:w-1/2 px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-secondary)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--ring-accent)] focus:border-[var(--ring-accent)]"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[var(--bg-tertiary)] border-b border-[var(--border-primary)]">
            <tr>
              <th className="p-4 font-semibold text-[var(--text-primary)]">Produto</th>
              <th className="p-4 font-semibold text-[var(--text-primary)] text-right">Preço</th>
              <th className="p-4 font-semibold text-[var(--text-primary)] text-center">Quantidade</th>
              <th className="p-4 font-semibold text-[var(--text-primary)] text-right">Subtotal</th>
              <th className="p-4 font-semibold text-[var(--text-primary)] text-center"></th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map(item => {
              const product = productsMap.get(item.productId);
              if (!product) return null;
              return (
                <tr key={item.productId} className="border-b border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)]">
                  <td className="p-4 text-[var(--text-primary)]">{product.name}</td>
                  <td className="p-4 text-right text-[var(--text-secondary)]">{formatCurrency(product.price)}</td>
                  <td className="p-4 text-center">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={e => handleQuantityChange(item.productId, parseInt(e.target.value))}
                      min="1"
                      className="w-20 text-center bg-[var(--bg-primary)] border-[var(--border-secondary)] rounded-md shadow-sm focus:ring-[var(--ring-accent)] focus:border-[var(--ring-accent)]"
                    />
                  </td>
                  <td className="p-4 text-right font-medium text-[var(--text-primary)]">{formatCurrency(product.price * item.quantity)}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => handleRemoveItem(item.productId)} className="text-[var(--text-danger)] hover:opacity-80">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
             {quote.items.length === 0 && (
                <tr>
                    <td colSpan={5} className="text-center text-[var(--text-secondary)] py-8">Nenhum item neste orçamento ainda.</td>
                </tr>
             )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 flex flex-col md:flex-row justify-between gap-8">
        <div className="w-full md:w-1/2 space-y-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Ajustes</h3>
            <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Desconto</label>
                <input 
                    type="number"
                    value={quote.discount}
                    onChange={(e) => handleDiscountChange(parseFloat(e.target.value) || 0)}
                    className="w-24 px-2 py-1 bg-[var(--bg-primary)] border border-[var(--border-secondary)] rounded-md"
                />
                <select 
                    value={quote.discountType} 
                    onChange={(e) => handleDiscountTypeChange(e.target.value as 'percentage' | 'fixed')}
                    className="px-2 py-1 border border-[var(--border-secondary)] rounded-md bg-[var(--bg-primary)]"
                >
                    <option value="percentage">%</option>
                    <option value="fixed">R$</option>
                </select>
            </div>
            <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Taxa (%)</label>
                <input 
                    type="number"
                    value={quote.taxRate}
                    onChange={(e) => dispatch({ type: 'SET_TAX_RATE', payload: parseFloat(e.target.value) || 0 })}
                    className="w-24 px-2 py-1 bg-[var(--bg-primary)] border border-[var(--border-secondary)] rounded-md"
                />
            </div>
        </div>
        <div className="w-full md:w-1/3 space-y-2">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Resumo</h3>
            <div className="flex justify-between text-[var(--text-secondary)]"><span>Subtotal:</span> <span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between text-[var(--text-danger)]"><span>Desconto:</span> <span>-{formatCurrency(discountAmount)}</span></div>
            <hr className='border-[var(--border-primary)]'/>
            <div className="flex justify-between font-medium"><span>Total antes da Taxa:</span> <span>{formatCurrency(totalAfterDiscount)}</span></div>
            <div className="flex justify-between text-[var(--text-secondary)]"><span>Taxa ({quote.taxRate}%):</span> <span>+{formatCurrency(taxAmount)}</span></div>
            <div className="flex justify-between text-2xl font-bold text-[var(--text-primary)] mt-2 p-2 bg-[var(--bg-tertiary)] rounded-md">
                <span>Total Geral:</span> 
                <span>{formatCurrency(grandTotal)}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteTable;
