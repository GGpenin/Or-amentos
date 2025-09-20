
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
}

export interface QuoteItem {
  productId: string;
  quantity: number;
}

export interface Quote {
  id: string;
  name: string;
  items: QuoteItem[];
  discount: number;
  discountType: 'percentage' | 'fixed';
  taxRate: number;
  createdAt: string;
}

export type Theme = 'claro' | 'escuro' | 'corporativo';
