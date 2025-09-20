import React, { useState, useEffect } from 'react';
import { Product, Quote } from '../types';
import Modal from './Modal';
import { PencilIcon, TrashIcon, PlusCircleIcon } from './Icons';

interface ProductManagerProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  quotes: Quote[];
}

const ProductManager: React.FC<ProductManagerProps> = ({ products, setProducts, quotes }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const openModalForNew = () => {
    setCurrentProduct({});
    setIsModalOpen(true);
  };

  const openModalForEdit = (product: Product) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct || !currentProduct.name || !currentProduct.price) return;

    if (currentProduct.id) {
      setProducts(products.map(p => (p.id === currentProduct.id ? currentProduct as Product : p)));
    } else {
      setProducts([...products, { ...currentProduct, id: new Date().toISOString() } as Product]);
    }
    closeModal();
  };

  const handleDelete = (productId: string) => {
    const isProductInUse = quotes.some(quote => 
      quote.items.some(item => item.productId === productId)
    );

    if (isProductInUse) {
      alert('Este produto não pode ser excluído, pois está associado a um ou mais orçamentos. Remova-o dos orçamentos antes de excluir.');
      return;
    }

    if (window.confirm('Você tem certeza que deseja excluir este produto? A ação não pode ser desfeita.')) {
        setProducts(products.filter(p => p.id !== productId));
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-[var(--bg-secondary)] p-6 rounded-lg shadow-lg border border-[var(--border-primary)]">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Catálogo de Produtos</h2>
        <div className='flex items-center gap-4'>
            <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-secondary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ring-accent)]"
            />
            <button onClick={openModalForNew} className="flex items-center justify-center gap-2 bg-[var(--bg-accent)] text-[var(--text-inverted)] px-4 py-2 rounded-lg hover:bg-[var(--bg-accent-hover)] transition-colors shadow-sm">
              <PlusCircleIcon className="w-5 h-5"/>
              <span>Adicionar Produto</span>
            </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[var(--bg-tertiary)] border-b border-[var(--border-primary)]">
            <tr>
              <th className="p-4 font-semibold text-[var(--text-primary)]">Nome</th>
              <th className="p-4 font-semibold text-[var(--text-primary)]">Categoria</th>
              <th className="p-4 font-semibold text-[var(--text-primary)]">Preço</th>
              <th className="p-4 font-semibold text-[var(--text-primary)] text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product.id} className="border-b border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)]">
                <td className="p-4">
                  <div className='font-medium text-[var(--text-primary)]'>{product.name}</div>
                  <div className='text-sm text-[var(--text-secondary)]'>{product.description}</div>
                </td>
                <td className="p-4 text-[var(--text-secondary)]">{product.category}</td>
                <td className="p-4 text-[var(--text-secondary)]">R${product.price.toFixed(2).replace('.', ',')}</td>
                <td className="p-4 text-right">
                  <button onClick={() => openModalForEdit(product)} className="text-[var(--text-accent)] hover:opacity-80 p-2">
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="text-[var(--text-danger)] hover:opacity-80 p-2">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && <p className="text-center text-[var(--text-secondary)] py-8">Nenhum produto encontrado. Adicione um para começar!</p>}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={currentProduct?.id ? 'Editar Produto' : 'Adicionar Novo Produto'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Nome do Produto</label>
            <input type="text" value={currentProduct?.name || ''} onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })} required className="mt-1 block w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-secondary)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--ring-accent)] focus:border-[var(--ring-accent)]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Descrição (Opcional)</label>
            <textarea value={currentProduct?.description || ''} onChange={e => setCurrentProduct({ ...currentProduct, description: e.target.value })} className="mt-1 block w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-secondary)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--ring-accent)] focus:border-[var(--ring-accent)]" rows={3}></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Categoria</label>
            <input type="text" value={currentProduct?.category || ''} onChange={e => setCurrentProduct({ ...currentProduct, category: e.target.value })} required className="mt-1 block w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-secondary)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--ring-accent)] focus:border-[var(--ring-accent)]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Preço Unitário</label>
            <input type="number" step="0.01" value={currentProduct?.price || ''} onChange={e => setCurrentProduct({ ...currentProduct, price: parseFloat(e.target.value) || 0 })} required className="mt-1 block w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-secondary)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--ring-accent)] focus:border-[var(--ring-accent)]" />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={closeModal} className="px-4 py-2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-md hover:opacity-90">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-[var(--bg-accent)] text-[var(--text-inverted)] rounded-md hover:bg-[var(--bg-accent-hover)]">Salvar Produto</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductManager;