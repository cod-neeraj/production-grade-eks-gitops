import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Check, ImageOff } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group">
      {/* Product Image */}
      <Link to={`/products/${product.id}`} className="block relative aspect-square bg-gray-100 overflow-hidden">
        {product.imageUrl && !imgError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <ImageOff size={32} />
            <span className="text-xs mt-1">No Image</span>
          </div>
        )}

        <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-gray-800 text-[11px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
          {product.category}
        </span>

        {!product.available && (
          <span className="absolute top-2 right-2 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            Unavailable
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col">
        <Link
          to={`/products/${product.id}`}
          className="font-semibold text-gray-900 group-hover:text-indigo-600 transition line-clamp-1 text-base mb-1"
          title={product.name}
        >
          {product.name}
        </Link>

        <p className="text-gray-500 text-xs line-clamp-2 mb-3 flex-1">
          {product.description || 'No description available.'}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto">
          <div>
            <span className="text-xs text-gray-400">Price</span>
            <p className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</p>
          </div>

          <button
            onClick={handleAdd}
            disabled={!product.available}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              !product.available
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : added
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
            }`}
          >
            {added ? (
              <>
                <Check size={14} /> Added
              </>
            ) : (
              <>
                <ShoppingCart size={14} /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
