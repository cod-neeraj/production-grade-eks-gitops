import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderApi } from '../api/orders';
import { ShieldCheck, ArrowLeft, Truck, AlertCircle } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { items, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-gray-900">Your Cart is Empty</h2>
        <p className="mt-2 text-sm text-gray-500">Add some products before proceeding to checkout.</p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl"
        >
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      setError('Please provide a complete shipping address.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        shippingAddress: shippingAddress.trim(),
        notes: notes.trim() || undefined,
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
      };

      const order = await orderApi.createOrder(payload);
      clearCart();
      navigate(`/orders/${order.id}`, { replace: true });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to place order. A product might be out of stock or inventory reservation failed.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-8 max-w-5xl mx-auto space-y-6">
      <Link
        to="/cart"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-indigo-600 transition"
      >
        <ArrowLeft size={16} /> Back to Cart
      </Link>

      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          <p className="text-sm text-gray-500 mt-0.5">Complete your delivery and order details</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <ShieldCheck size={16} /> Secure Checkout
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-800 text-sm">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Order Failed</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Shipping Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Truck size={20} className="text-indigo-600" /> Shipping Information
            </h2>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Full Shipping Address *
              </label>
              <textarea
                rows={3}
                required
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="123 Tech Avenue, Suite 400, San Francisco, CA 94107"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Delivery Instructions / Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Leave with front desk / gate code #1234"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Payment Method Notice */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-xs text-indigo-900">
            <span className="font-bold">Payment Simulator:</span> Cash on Delivery / Direct Invoice is enabled for local development. Clicking &quot;Confirm &amp; Place Order&quot; immediately authorizes inventory reservation.
          </div>
        </div>

        {/* Right: Review Items & Submit */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit space-y-4">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
            Review Items ({items.length})
          </h2>

          <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-gray-100">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="pt-2 first:pt-0 flex justify-between text-xs">
                <div>
                  <p className="font-semibold text-gray-800 line-clamp-1">{product.name}</p>
                  <p className="text-gray-400">Qty: {quantity} × ${product.price.toFixed(2)}</p>
                </div>
                <p className="font-bold text-gray-900">
                  ${(product.price * quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className="text-emerald-600 font-semibold">Free</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
              <span>Total Due</span>
              <span className="text-xl font-black text-indigo-600">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-4 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
          >
            {submitting ? 'Reserving Inventory & Creating Order...' : 'Confirm & Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
};
