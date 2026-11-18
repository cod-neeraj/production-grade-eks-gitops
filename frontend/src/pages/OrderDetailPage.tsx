import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderApi } from '../api/orders';
import { Order } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { ArrowLeft, Package, MapPin, Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        if (id) {
          const data = await orderApi.getOrderById(Number(id));
          setOrder(data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Order not found');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error || !order) return <ErrorMessage message={error || 'Order not found'} />;

  return (
    <div className="py-8 max-w-4xl mx-auto space-y-6">
      <Link
        to="/orders"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-indigo-600 transition"
      >
        <ArrowLeft size={16} /> Back to My Orders
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <Package className="text-indigo-600" size={24} />
              <h1 className="text-2xl font-black text-gray-900">Order #{order.id}</h1>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
              <span className="flex items-center gap-1">
                <Calendar size={14} /> Placed {new Date(order.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center">
            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                order.status === 'CONFIRMED'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : order.status === 'COMPLETED'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : order.status === 'CANCELLED'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              Status: {order.status}
            </span>
          </div>
        </div>

        {/* Shipping details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl text-sm">
          <div>
            <h3 className="text-xs font-bold uppercase text-gray-500 mb-1 flex items-center gap-1">
              <MapPin size={14} /> Shipping Destination
            </h3>
            <p className="text-gray-800 font-medium whitespace-pre-line">
              {order.shippingAddress || 'No shipping address specified'}
            </p>
          </div>
          {order.notes && (
            <div>
              <h3 className="text-xs font-bold uppercase text-gray-500 mb-1">Customer Notes</h3>
              <p className="text-gray-600 italic">&ldquo;{order.notes}&rdquo;</p>
            </div>
          )}
        </div>

        {/* Order items table */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Purchased Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items?.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-semibold text-gray-800">
                      {item.productName}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">{item.quantity}</td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-gray-900">
                      ${item.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-gray-200">
                <tr>
                  <td colSpan={3} className="py-3 px-4 text-right font-bold text-gray-800">
                    Grand Total
                  </td>
                  <td className="py-3 px-4 text-right text-lg font-black text-indigo-600">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
