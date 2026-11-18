import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productApi } from '../api/products';
import { inventoryApi } from '../api/inventory';
import { Product, InventoryItem } from '../types';
import { useCart } from '../context/CartContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { ShoppingCart, Check, ImageOff, ShieldAlert, ArrowLeft, Layers } from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const [product, setProduct] = useState<Product | null>(null);
  const [inventory, setInventory] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const { addToCart } = useCart();

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const prod = await productApi.getProductById(productId);
        setProduct(prod);

        // Fetch stock info gracefully
        try {
          const inv = await inventoryApi.getByProductId(productId);
          setInventory(inv);
        } catch {
          // Inventory might not exist yet or service not answering
          setInventory(null);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadDetails();
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error || !product) return <ErrorMessage message={error || 'Product not found'} />;

  const availableStock = inventory ? inventory.availableQuantity : 99;
  const isOutOfStock = inventory ? inventory.availableQuantity <= 0 : false;

  return (
    <div className="py-8 max-w-6xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-indigo-600 transition"
      >
        <ArrowLeft size={16} /> Back to Catalog
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
        {/* Left: Product Image */}
        <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center">
          {product.imageUrl && !imgError ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <ImageOff size={48} />
              <span className="text-sm mt-2">No Image Available</span>
            </div>
          )}

          <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            {product.category}
          </span>
        </div>

        {/* Right: Details & Purchase */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400 uppercase">
            <span>SKU: {product.sku}</span>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mt-2">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-black text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-xs text-gray-500">Taxes calculated at checkout</span>
          </div>

          {/* Stock Availability Badge */}
          <div className="mt-4 flex items-center gap-2 text-sm">
            <Layers size={16} className="text-indigo-600" />
            <span className="font-medium text-gray-700">Stock Status:</span>
            {isOutOfStock ? (
              <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded text-xs">
                Out of Stock
              </span>
            ) : inventory ? (
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-xs">
                In Stock ({inventory.availableQuantity} units available)
              </span>
            ) : (
              <span className="text-gray-500 text-xs">Available</span>
            )}
          </div>

          <hr className="my-6 border-gray-200" />

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">
              Product Description
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
              {product.description || 'No description provided.'}
            </p>
          </div>

          {/* Quantity and Add to Cart */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-gray-50">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1 || isOutOfStock}
                className="px-4 py-2.5 text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition font-bold"
              >
                -
              </button>
              <span className="px-4 py-2 text-sm font-bold text-gray-900 min-w-[2.5rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => (availableStock ? Math.min(availableStock, q + 1) : q + 1))}
                disabled={isOutOfStock || (inventory ? quantity >= availableStock : false)}
                className="px-4 py-2.5 text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition font-bold"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || !product.available}
              className={`flex-1 w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold transition shadow-md ${
                isOutOfStock || !product.available
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  : added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {added ? (
                <>
                  <Check size={18} /> Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart size={18} /> Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
