import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../api/orders';
import { Order, PageResponse } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import {
  ArrowLeft,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  CheckCircle2,
} from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  const [pageData, setPageData] = useState<PageResponse<Order> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderApi.getAllOrdersAdmin(page, 15);
      setPageData(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load platform orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [page]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      setError(null);
      await orderApi.updateOrderStatus(id, newStatus);
      setSuccess(`Order #${id} status updated to ${newStatus}.`);
      loadOrders();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update order status');
    }
  };

  return (
    <div className="py-8 space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-indigo-600 mb-1"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-black text-gray-900">All Platform Orders</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage customer orders and dispatch statuses</p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold p-4 rounded-xl flex items-center gap-2">
          <CheckCircle size={18} /> {success}
        </div>
      )}

      {error && <ErrorMessage message={error} />}

      {/* Orders Table */}
      {loading ? (
        <LoadingSpinner />
      ) : !pageData || pageData.content.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-500 text-sm">
          No orders on record.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageData.content.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-bold text-gray-900">
                      <Link
                        to={`/orders/${order.id}`}
                        className="text-indigo-600 hover:underline"
                      >
                        #{order.id}
                      </Link>
                    </td>

                    <td className="py-3 px-4 text-xs font-mono text-gray-600">
                      User #{order.userId}
                    </td>

                    <td className="py-3 px-4 text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-xs text-gray-600">
                      {order.items?.length || 0} product(s)
                    </td>

                    <td className="py-3 px-4 font-bold text-gray-900">
                      ${order.totalAmount.toFixed(2)}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          order.status === 'CONFIRMED'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : order.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : order.status === 'CANCELLED'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pageData.totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex justify-between items-center text-xs">
              <span className="text-gray-500">
                Page {page + 1} of {pageData.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={pageData.first}
                  className="px-3 py-1.5 border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pageData.totalPages - 1, p + 1))}
                  disabled={pageData.last}
                  className="px-3 py-1.5 border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
