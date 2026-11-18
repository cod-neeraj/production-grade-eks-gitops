import { apiClient } from './client';
import { Order, PageResponse } from '../types';

export interface CreateOrderPayload {
  shippingAddress: string;
  notes?: string;
  items: {
    productId: number;
    quantity: number;
  }[];
}

export const orderApi = {
  createOrder: async (data: CreateOrderPayload): Promise<Order> => {
    const res = await apiClient.post<Order>('/orders', data);
    return res.data;
  },

  getMyOrders: async (page = 0, size = 10): Promise<PageResponse<Order>> => {
    const res = await apiClient.get<PageResponse<Order>>(`/orders?page=${page}&size=${size}`);
    return res.data;
  },

  getOrderById: async (id: number): Promise<Order> => {
    const res = await apiClient.get<Order>(`/orders/${id}`);
    return res.data;
  },

  getAllOrdersAdmin: async (page = 0, size = 15): Promise<PageResponse<Order>> => {
    const res = await apiClient.get<PageResponse<Order>>(`/orders/admin/all?page=${page}&size=${size}`);
    return res.data;
  },

  updateOrderStatus: async (id: number, status: string): Promise<Order> => {
    const res = await apiClient.put<Order>(`/orders/${id}/status`, { status });
    return res.data;
  },
};
