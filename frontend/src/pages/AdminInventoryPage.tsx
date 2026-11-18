import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { inventoryApi } from '../api/inventory';
import { productApi } from '../api/products';
import { InventoryItem, PageResponse, Product } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import {
  ArrowLeft,
  Layers,
  AlertTriangle,
  Sliders,
  CheckCircle,
  X,
  Plus,
} from 'lucide-react';

export const AdminInventoryPage: React.FC = () => {
  const [pageData, setPageData] = useState<PageResponse<InventoryItem> | null>(null);
  const [productsMap, setProductsMap] = useState<Record<number, Product>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [page, setPage] = useState(0);

  // Adjust Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [newQuantity, setNewQuantity] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // New Record Modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newProductId, setNewProductId] = useState<number>(1);
  const [initialQty, setInitialQty] = useState<number>(50);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [invData, prodData] = await Promise.all([
        inventoryApi.getAll(page, 15),
        productApi.getProducts({ size: 100, showAll: true }).catch(() => null),
      ]);

      setPageData(invData);

      if (prodData) {
        const map: Record<number, Product> = {};
        prodData.content.forEach((p) => {
          map[p.id] = p;
        });
        setProductsMap(map);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load inventory records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page]);

  const openAdjust = (item: InventoryItem) => {
    setSelectedItem(item);
    setNewQuantity(item.quantity);
    setNotes('Manual stock audit adjustment');
    setIsModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      setSubmitting(true);
      setError(null);
      await inventoryApi.adjustStock(selectedItem.productId, newQuantity, notes);
      setSuccess(`Stock for Product #${selectedItem.productId} adjusted to ${newQuantity}.`);
      setIsModalOpen(false);
      loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await inventoryApi.createInventory(newProductId, initialQty);
      setSuccess(`Inventory record for Product #${newProductId} created.`);
      setIsNewModalOpen(false);
      loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create inventory record');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-indigo-600 mb-1"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-black text-gray-900">Inventory &amp; Stock Levels</h1>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm transition"
        >
          <Plus size={16} /> Track New Product Stock
        </button>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold p-4 rounded-xl flex items-center gap-2">
          <CheckCircle size={18} /> {success}
        </div>
      )}

      {error && <ErrorMessage message={error} />}

      {/* Inventory Table */}
      {loading ? (
        <LoadingSpinner />
      ) : !pageData || pageData.content.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-500 text-sm">
          No inventory records tracked.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4 text-center">Total In Stock</th>
                  <th className="py-3 px-4 text-center">Reserved</th>
                  <th className="py-3 px-4 text-center">Available</th>
                  <th className="py-3 px-4">Threshold / Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageData.content.map((item) => {
                  const product = productsMap[item.productId];
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-gray-900">
                          {product ? product.name : `Product ID #${item.productId}`}
                        </p>
                        <p className="text-xs font-mono text-gray-400">
                          {product?.sku ? `SKU: ${product.sku}` : `ID: ${item.productId}`}
                        </p>
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-gray-800">
                        {item.quantity}
                      </td>

                      <td className="py-3 px-4 text-center text-amber-600 font-semibold">
                        {item.reservedQuantity}
                      </td>

                      <td className="py-3 px-4 text-center font-black">
                        <span
                          className={
                            item.availableQuantity <= 0
                              ? 'text-red-600'
                              : item.lowStock
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }
                        >
                          {item.availableQuantity}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {item.availableQuantity <= 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                            <AlertTriangle size={12} /> Out of Stock
                          </span>
                        ) : item.lowStock ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <AlertTriangle size={12} /> Low Stock (≤{item.lowStockThreshold})
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500 font-medium">Optimal</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openAdjust(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-xs font-bold transition"
                        >
                          <Sliders size={14} /> Adjust Stock
                        </button>
                      </td>
                    </tr>
                  );
                })}
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

      {/* Adjust Stock Modal */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                Adjust Stock for Product #{selectedItem.productId}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  New Total Stock Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Currently: {selectedItem.quantity} total ({selectedItem.reservedQuantity} reserved)
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Adjustment Reason / Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Restock shipment from supplier"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Save Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Inventory Record Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Track Product Inventory</h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateInventory} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Product ID *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newProductId}
                  onChange={(e) => setNewProductId(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Initial Stock Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={initialQty}
                  onChange={(e) => setInitialQty(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Initialize Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
