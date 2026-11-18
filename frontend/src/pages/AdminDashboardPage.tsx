import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../api/products';
import { inventoryApi } from '../api/inventory';
import { orderApi } from '../api/orders';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Shield, Package, Layers, ShoppingBag, ArrowRight } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    products: 0,
    inventoryRecords: 0,
    orders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [prodRes, invRes, ordRes] = await Promise.all([
          productApi.getProducts({ size: 1, showAll: true }).catch(() => null),
          inventoryApi.getAll(0, 1).catch(() => null),
          orderApi.getAllOrdersAdmin(0, 1).catch(() => null),
        ]);

        setStats({
          products: prodRes?.totalElements || 0,
          inventoryRecords: invRes?.totalElements || 0,
          orders: ordRes?.totalElements || 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-8 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Shield size={16} /> Admin Management Console
        </div>
        <h1 className="text-3xl font-black">ShopSphere Administration</h1>
        <p className="text-slate-300 text-sm mt-1">
          Monitor microservices, maintain the product catalog, adjust warehouse stock, and fulfill customer orders.
        </p>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Total Products</p>
              <p className="text-3xl font-black text-gray-900 mt-1">{stats.products}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Package size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Tracked SKUs</p>
              <p className="text-3xl font-black text-gray-900 mt-1">{stats.inventoryRecords}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <Layers size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Platform Orders</p>
              <p className="text-3xl font-black text-gray-900 mt-1">{stats.orders}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <ShoppingBag size={24} />
            </div>
          </div>
        </div>
      )}

      {/* Admin Modules Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/products"
          className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-indigo-500 shadow-sm transition group"
        >
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition">
            <Package size={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Product Management</h2>
          <p className="text-xs text-gray-500 mt-1">
            Create new items, edit descriptions, adjust pricing, update SKUs, and toggle listing visibility.
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition">
            Manage Products <ArrowRight size={14} />
          </div>
        </Link>

        <Link
          to="/admin/inventory"
          className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-emerald-500 shadow-sm transition group"
        >
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition">
            <Layers size={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Inventory & Stock</h2>
          <p className="text-xs text-gray-500 mt-1">
            Real-time stock quantities, reserved counts, low-stock alerts, and manual inventory adjustments.
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition">
            Manage Inventory <ArrowRight size={14} />
          </div>
        </Link>

        <Link
          to="/admin/orders"
          className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-amber-500 shadow-sm transition group"
        >
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition">
            <ShoppingBag size={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Order Fulfillment</h2>
          <p className="text-xs text-gray-500 mt-1">
            View all incoming customer orders, review reserved inventory items, and update order statuses.
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-amber-600 group-hover:translate-x-1 transition">
            Manage Orders <ArrowRight size={14} />
          </div>
        </Link>
      </div>
    </div>
  );
};
