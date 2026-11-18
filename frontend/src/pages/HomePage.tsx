import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../api/products';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { ArrowRight, Sparkles, ShieldCheck, Zap, Server } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [prodRes, catRes] = await Promise.all([
          productApi.getProducts({ size: 8, sortBy: 'createdAt', sortDir: 'desc' }),
          productApi.getCategories(),
        ]);
        setFeaturedProducts(prodRes.content);
        setCategories(catRes);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to connect to backend services. Ensure Gateway and services are running.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white py-16 md:py-24 rounded-2xl shadow-xl px-6 md:px-12 my-6">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles size={14} /> Production-Grade Microservices
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Discover Quality Products on <span className="text-indigo-400">ShopSphere</span>
          </h1>
          <p className="mt-4 text-base md:text-lg text-indigo-100 max-w-2xl leading-relaxed">
            Engineered with modern microservices architecture — Spring Boot 3.3.5, PostgreSQL, Spring Cloud Gateway, and React 19.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition duration-200"
            >
              Explore Products <ArrowRight size={18} />
            </Link>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl backdrop-blur-sm border border-white/20 transition duration-200"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-12 pt-8 border-t border-indigo-700/50 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div className="flex items-center gap-3 text-indigo-200">
            <ShieldCheck size={20} className="text-indigo-400" />
            <span>JWT Role Authorization</span>
          </div>
          <div className="flex items-center gap-3 text-indigo-200">
            <Zap size={20} className="text-indigo-400" />
            <span>Atomic Stock Reservation</span>
          </div>
          <div className="flex items-center gap-3 text-indigo-200">
            <Server size={20} className="text-indigo-400" />
            <span>5 Decoupled Services</span>
          </div>
        </div>
      </section>

      {/* Categories Bar */}
      {categories.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Popular Categories</h2>
            <Link to="/products" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              View All
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <Link
                key={cat}
                to={`/products?category=${encodeURIComponent(cat)}`}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-indigo-500 hover:text-indigo-600 shadow-sm shrink-0 transition"
              >
                {cat}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            <p className="text-sm text-gray-500 mt-0.5">Explore our top catalog selections</p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            All Products <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">No products available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
