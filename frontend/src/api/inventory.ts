import { apiClient } from './client';
import { InventoryItem, PageResponse } from '../types';

export const inventoryApi = {
  getAll: async (page = 0, size = 20): Promise<PageResponse<InventoryItem>> => {
    const res = await apiClient.get<PageResponse<InventoryItem>>(`/inventory?page=${page}&size=${size}`);
    return res.data;
  },

  getByProductId: async (productId: number): Promise<InventoryItem> => {
    const res = await apiClient.get<InventoryItem>(`/inventory/product/${productId}`);
    return res.data;
  },

  checkAvailability: async (productId: number, quantity = 1): Promise<{ available: boolean; quantityRequested: number }> => {
    const res = await apiClient.get<{ available: boolean; quantityRequested: number }>(
      `/inventory/check/${productId}?quantity=${quantity}`
    );
    return res.data;
  },

  adjustStock: async (productId: number, quantity: number, notes?: string): Promise<InventoryItem> => {
    const res = await apiClient.put<InventoryItem>('/inventory/adjust', {
      productId,
      quantity,
      notes,
    });
    return res.data;
  },

  createInventory: async (productId: number, initialQuantity: number): Promise<InventoryItem> => {
    const res = await apiClient.post<InventoryItem>('/inventory', {
      productId,
      quantity: initialQuantity,
    });
    return res.data;
  },
};
