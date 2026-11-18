import React from 'react';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-10 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-indigo-600 text-white font-black text-sm px-2 py-0.5 rounded">SS</span>
              <span className="font-bold text-white text-lg">ShopSphere</span>
            </div>
            <p className="text-sm text-slate-400">
              Modern full-stack microservices e-commerce application built with Spring Boot and React 19.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Services</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>API Gateway (:8080)</li>
              <li>Auth Service (:8081)</li>
              <li>Product Service (:8082)</li>
              <li>Order Service (:8083)</li>
              <li>Inventory Service (:8084)</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Quick Links</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li><a href="/products" className="hover:text-white transition">Catalog</a></li>
              <li><a href="/cart" className="hover:text-white transition">Shopping Cart</a></li>
              <li><a href="/orders" className="hover:text-white transition">Order History</a></li>
              <li><a href="/login" className="hover:text-white transition">Account Login</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Architecture</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Decoupled PostgreSQL databases, JWT security, Spring Cloud Gateway routing, and transactional inventory reservations.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ShopSphere Microservices. All rights reserved.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Engineered with <Heart size={14} className="text-red-500 fill-red-500" /> for DevOps & Cloud Mastery
          </p>
        </div>
      </div>
    </footer>
  );
};
