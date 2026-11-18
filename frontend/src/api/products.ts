import { apiClient } from './client';
import { PageResponse, Product } from '../types';

export interface ProductFilters {
  search?: string;
  category?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
  showAll?: boolean;
}

export const productApi = {
  getProducts: async (filters: ProductFilters = {}): Promise<PageResponse<Product>> => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size !== undefined) params.append('size', filters.size.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDir) params.append('sortDir', filters.sortDir);
    if (filters.showAll) params.append('showAll', 'true');

    const res = await apiClient.get<PageResponse<Product>>(`/products?${params.toString()}`);
    return res.data;
  },

  getProductById: async (id: number): Promise<Product> => {
    const res = await apiClient.get<Product>(`/products/${id}`);
    return res.data;
  },

  getCategories: async (): Promise<string[]> => {
    const res = await apiClient.get<string[]>('/products/categories');
    return res.data;
  },

  createProduct: async (product: Partial<Product>): Promise<Product> => {
    const res = await apiClient.post<Product>('/products', product);
    return res.data;
  },

  updateProduct: async (id: number, product: Partial<Product>): Promise<Product> => {
    const res = await apiClient.put<Product>(`/products/${id}`, product);
    return res.data;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },
};
