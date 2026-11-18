import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';

export const CartPage: React.FC = () => {
  const { items, updateQuantity, removeFromCart, clearCart, totalAmount, totalItems } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Your Cart is Empty</h2>
        <p className="mt-2 text-sm text-gray-500">
          Looks like you haven't added any products to your shopping cart yet.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition shadow-sm"
        >
          <ArrowLeft size={16} /> Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-sm text-gray-500 mt-0.5">{totalItems} items in your order</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center gap-4 shadow-sm"
            >
              {/* Product Thumbnail */}
              <Link
                to={`/products/${product.id}`}
                className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0 block"
              >
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    No image
                  </div>
                )}
              </Link>

              {/* Item Info */}
              <div className="flex-1 text-center sm:text-left">
                <Link
                  to={`/products/${product.id}`}
                  className="font-semibold text-gray-900 hover:text-indigo-600 transition text-sm"
                >
                  {product.name}
                </Link>
                <p className="text-xs text-gray-400 mt-0.5">SKU: {product.sku}</p>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  ${product.price.toFixed(2)}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 font-bold text-sm"
                >
                  -
                </button>
                <span className="px-3 py-1 text-sm font-bold text-gray-800">
                  {quantity}
                </span>
                <button
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 font-bold text-sm"
                >
                  +
                </button>
              </div>

              {/* Subtotal */}
              <div className="text-right min-w-[5rem]">
                <p className="text-sm font-bold text-gray-900">
                  ${(product.price * quantity).toFixed(2)}
                </p>
              </div>

              {/* Remove */}
              <button
                onClick={() => removeFromCart(product.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Remove item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 pt-2"
          >
            <ArrowLeft size={16} /> Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit space-y-4">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
            Order Summary
          </h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Estimated Shipping</span>
              <span className="text-emerald-600 font-semibold">Free</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Estimated Tax</span>
              <span className="text-gray-400">$0.00</span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
            <span className="text-base font-bold text-gray-900">Total</span>
            <span className="text-2xl font-black text-indigo-600">
              ${totalAmount.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition"
          >
            Proceed to Checkout <ArrowRight size={18} />
          </button>

          {!isAuthenticated && (
            <p className="text-center text-xs text-gray-500">
              You will be prompted to log in before completing your order.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
