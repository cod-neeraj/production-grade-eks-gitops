import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../api/orders';
import { Order, PageResponse } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { Package, ArrowRight, Clock, CheckCircle2, XCircle, ShoppingBag } from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const [pageData, setPageData] = useState<PageResponse<Order> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await orderApi.getMyOrders(page, 10);
        setPageData(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load your orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [page]);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            <Clock size={12} /> Confirmed
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 size={12} /> Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
            <XCircle size={12} /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <Clock size={12} /> Pending
          </span>
        );
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  if (!pageData || pageData.content.length === 0) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">No Orders Yet</h2>
        <p className="mt-2 text-sm text-gray-500">
          When you place orders, they will appear here with real-time status tracking.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
        >
          <ShoppingBag size={16} /> Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track and view your previous purchases</p>
      </div>

      <div className="space-y-4">
        {pageData.content.map((order) => (
          <div
            key={order.id}
            className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-indigo-300 transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div>
                <span className="text-xs font-mono text-gray-400">Order #{order.id}</span>
                <p className="text-sm text-gray-500 mt-0.5">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>{getStatusBadge(order.status)}</div>
            </div>

            {/* Items snippet */}
            <div className="py-4 space-y-2 text-sm">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <span className="font-medium text-gray-800">
                    {item.quantity}x {item.productName}
                  </span>
                  <span className="text-gray-500 font-mono">
                    ${item.subtotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400">Order Total</span>
                <p className="text-base font-bold text-gray-900">
                  ${order.totalAmount.toFixed(2)}
                </p>
              </div>

              <Link
                to={`/orders/${order.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition"
              >
                View Details <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {pageData.totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={pageData.first}
            className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm font-semibold text-gray-600">
            Page {page + 1} of {pageData.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pageData.totalPages - 1, p + 1))}
            disabled={pageData.last}
            className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
