import React from 'react';
import { Quote } from '../types';
import { TrashIcon } from './Icons';

interface SavedQuotesProps {
  quotes: Quote[];
  onLoad: (quote: Quote) => void;
  onDelete: (quoteId: string) => void;
}

const SavedQuotes: React.FC<SavedQuotesProps> = ({ quotes, onLoad, onDelete }) => {

  const handleDelete = (e: React.MouseEvent, quoteId: string) => {
    e.stopPropagation();
    if (window.confirm('Você tem certeza que deseja excluir este orçamento?')) {
      onDelete(quoteId);
    }
  };

  return (
    <div className="bg-[var(--bg-secondary)] p-6 rounded-lg shadow-lg border border-[var(--border-primary)]">
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Orçamentos Salvos</h2>
      {quotes.length > 0 ? (
        <div className="space-y-4">
          {quotes.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(quote => (
            <div
              key={quote.id}
              onClick={() => onLoad(quote)}
              className="flex justify-between items-center p-4 border border-[var(--border-primary)] rounded-lg cursor-pointer hover:bg-[var(--bg-tertiary)] hover:shadow-md transition-all"
            >
              <div>
                <p className="font-semibold text-[var(--text-accent)]">{quote.name}</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  Criado em: {new Date(quote.createdAt).toLocaleDateString('pt-BR')} - {quote.items.length} item(ns)
                </p>
              </div>
              <div className='flex items-center gap-2'>
                <button
                    onClick={(e) => handleDelete(e, quote.id)}
                    className="text-[var(--text-danger)] hover:bg-[var(--bg-danger-subtle)] p-2 rounded-full"
                    aria-label="Excluir orçamento"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-[var(--text-secondary)] py-8">Você não tem orçamentos salvos.</p>
      )}
    </div>
  );
};

export default SavedQuotes;
