import React, { useState } from 'react';
import { 
  Plus, Edit, Trash2, Package, CheckCircle2, Clock, AlertTriangle, 
  Search, RefreshCw, DollarSign, TrendingUp, Sparkles, Filter, 
  Phone, MapPin, ChevronRight, X, Leaf, Save, Cloud
} from 'lucide-react';
import { ProduceItem, Order, InventoryStats } from '../types';

interface FarmerDashboardProps {
  produceList: ProduceItem[];
  orders: Order[];
  stats: InventoryStats;
  onAddProduce: (produce: Partial<ProduceItem>) => Promise<void>;
  onUpdateProduce: (id: string, updates: Partial<ProduceItem>) => Promise<void>;
  onDeleteProduce: (id: string) => Promise<void>;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  onRefreshData: () => Promise<void>;
}

// Preset photo selections for easy farmer produce setup
const PHOTO_PRESETS = [
  { label: 'Tomatoes', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80' },
  { label: 'Kale / Greens', url: 'https://images.unsplash.com/photo-1524179091875-bf99a9a6fa57?w=800&auto=format&fit=crop&q=80' },
  { label: 'Apples', url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&auto=format&fit=crop&q=80' },
  { label: 'Carrots', url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c717?w=800&auto=format&fit=crop&q=80' },
  { label: 'Corn', url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&auto=format&fit=crop&q=80' },
  { label: 'Basil / Herbs', url: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=800&auto=format&fit=crop&q=80' },
  { label: 'Farm Eggs', url: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&auto=format&fit=crop&q=80' },
  { label: 'Honey', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80' },
  { label: 'Berries', url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&auto=format&fit=crop&q=80' },
  { label: 'Snap Peas', url: 'https://images.unsplash.com/photo-1592394533824-9440e5d68530?w=800&auto=format&fit=crop&q=80' },
];

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  produceList,
  orders,
  stats,
  onAddProduce,
  onUpdateProduce,
  onDeleteProduce,
  onUpdateOrderStatus,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<'sale_list' | 'orders' | 'inventory'>('sale_list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduce, setEditingProduce] = useState<ProduceItem | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [produceSearch, setProduceSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Form Fields for Add / Edit Produce
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ProduceItem['category']>('Vegetables');
  const [formPrice, setFormPrice] = useState('3.50');
  const [formUnit, setFormUnit] = useState('lb');
  const [formStock, setFormStock] = useState('25');
  const [formOrganic, setFormOrganic] = useState(true);
  const [formHarvestNote, setFormHarvestNote] = useState('Picked fresh this morning');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState(PHOTO_PRESETS[0].url);
  const [formBadge, setFormBadge] = useState('Fresh Harvest');

  const openAddModal = () => {
    setEditingProduce(null);
    setFormName('');
    setFormCategory('Vegetables');
    setFormPrice('3.50');
    setFormUnit('lb');
    setFormStock('30');
    setFormOrganic(true);
    setFormHarvestNote('Picked fresh this morning');
    setFormDescription('Naturally grown with organic compost, crisp and full of flavor.');
    setFormImageUrl(PHOTO_PRESETS[0].url);
    setFormBadge('Picked Today');
    setIsModalOpen(true);
  };

  const openEditModal = (produce: ProduceItem) => {
    setEditingProduce(produce);
    setFormName(produce.name);
    setFormCategory(produce.category);
    setFormPrice(produce.price.toString());
    setFormUnit(produce.unit);
    setFormStock(produce.stock.toString());
    setFormOrganic(produce.organic);
    setFormHarvestNote(produce.harvestNote || '');
    setFormDescription(produce.description || '');
    setFormImageUrl(produce.imageUrl || PHOTO_PRESETS[0].url);
    setFormBadge(produce.badge || '');
    setIsModalOpen(true);
  };

  const handleSaveProduce = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice || !formStock) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: formName.trim(),
        category: formCategory,
        price: parseFloat(formPrice) || 0,
        unit: formUnit.trim(),
        stock: parseInt(formStock, 10) || 0,
        organic: formOrganic,
        harvestNote: formHarvestNote.trim(),
        description: formDescription.trim(),
        imageUrl: formImageUrl,
        badge: formBadge.trim() || undefined,
        status: (parseInt(formStock, 10) > 0 ? 'available' : 'sold_out') as ProduceItem['status']
      };

      if (editingProduce) {
        await onUpdateProduce(editingProduce.id, payload);
      } else {
        await onAddProduce(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Could not save produce item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickRestock = async (produce: ProduceItem, delta: number) => {
    const newStock = Math.max(0, produce.stock + delta);
    await onUpdateProduce(produce.id, {
      stock: newStock,
      status: newStock > 0 ? 'available' : 'sold_out'
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshData();
    setIsRefreshing(false);
  };

  const filteredProduce = produceList.filter(item => 
    item.name.toLowerCase().includes(produceSearch.toLowerCase()) ||
    item.category.toLowerCase().includes(produceSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(order => {
    if (orderStatusFilter === 'all') return true;
    return order.status === orderStatusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner & Title */}
      <div className="bg-[#2d4734] text-white rounded-3xl p-6 sm:p-8 shadow-sm mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-[#3d5e46] rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#c8e2d2] mb-3">
              <Cloud className="w-3.5 h-3.5 text-[#8fe0a8]" />
              <span>Cloud Storage Active • Real-time Order & Inventory Tracking</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Farmer Stand Management
            </h2>
            <p className="text-sm text-[#d0dfd5] mt-1 max-w-xl">
              Put up your produce sale list, set stock and prices, and fulfill customer harvest orders synced in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors"
              title="Refresh cloud data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Sync Cloud</span>
            </button>

            <button
              id="add-new-produce-btn"
              onClick={openAddModal}
              className="px-5 py-2.5 rounded-xl bg-[#c47d4e] hover:bg-[#b36f42] active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm border border-[#d28b5e]"
            >
              <Plus className="w-4 h-4" />
              <span>Put Up New Produce</span>
            </button>
          </div>
        </div>

        {/* Quick Inventory Stat Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/15">
          <div className="bg-white/10 p-3 rounded-xl">
            <span className="text-[11px] text-[#c6dbcd] uppercase font-semibold block">Produce Items</span>
            <span className="text-xl sm:text-2xl font-bold font-display text-white">{stats.totalProduceCount || produceList.length}</span>
          </div>
          <div className="bg-white/10 p-3 rounded-xl">
            <span className="text-[11px] text-[#c6dbcd] uppercase font-semibold block">Units in Stock</span>
            <span className="text-xl sm:text-2xl font-bold font-display text-white">{stats.totalUnitsInStock}</span>
          </div>
          <div className="bg-white/10 p-3 rounded-xl">
            <span className="text-[11px] text-[#c6dbcd] uppercase font-semibold block">Customer Orders</span>
            <span className="text-xl sm:text-2xl font-bold font-display text-white">{orders.length}</span>
          </div>
          <div className="bg-white/10 p-3 rounded-xl">
            <span className="text-[11px] text-[#c6dbcd] uppercase font-semibold block">Sales Revenue</span>
            <span className="text-xl sm:text-2xl font-bold font-display text-[#98e6b3]">${stats.totalRevenue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center justify-between border-b border-[#dfd7c9] mb-6">
        <div className="flex items-center gap-2">
          <button
            id="tab-produce-sale-list"
            onClick={() => setActiveTab('sale_list')}
            className={`pb-3 px-3 font-semibold text-sm transition-all border-b-2 ${
              activeTab === 'sale_list'
                ? 'border-[#2d4734] text-[#2d4734]'
                : 'border-transparent text-[#6e7870] hover:text-[#242b26]'
            }`}
          >
            <span>Produce Sale List ({produceList.length})</span>
          </button>

          <button
            id="tab-cloud-orders"
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'border-[#2d4734] text-[#2d4734]'
                : 'border-transparent text-[#6e7870] hover:text-[#242b26]'
            }`}
          >
            <span>Customer Cloud Orders</span>
            {orders.filter(o => o.status === 'new').length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#c47d4e] text-white">
                {orders.filter(o => o.status === 'new').length} New
              </span>
            )}
          </button>

          <button
            id="tab-inventory-tracking"
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 px-3 font-semibold text-sm transition-all border-b-2 ${
              activeTab === 'inventory'
                ? 'border-[#2d4734] text-[#2d4734]'
                : 'border-transparent text-[#6e7870] hover:text-[#242b26]'
            }`}
          >
            <span>Inventory Tracking</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PRODUCE SALE LIST MANAGEMENT */}
      {activeTab === 'sale_list' && (
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7e8c81]" />
              <input
                type="text"
                value={produceSearch}
                onChange={(e) => setProduceSearch(e.target.value)}
                placeholder="Filter produce list..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#dfd7c9] text-xs sm:text-sm text-[#242b26]"
              />
            </div>

            <span className="text-xs text-[#6e7870] font-medium self-end sm:self-center">
              Showing {filteredProduce.length} of {produceList.length} items
            </span>
          </div>

          {/* Produce Table / Grid */}
          <div className="bg-white rounded-2xl border border-[#dfd7c9] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#f7f5ef] border-b border-[#dfd7c9] text-[#556358] font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Produce</th>
                    <th className="py-3.5 px-3">Category</th>
                    <th className="py-3.5 px-3">Price</th>
                    <th className="py-3.5 px-3">Current Stock</th>
                    <th className="py-3.5 px-3">Quick Restock</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eee8dc]">
                  {filteredProduce.map((item) => {
                    const isSoldOut = item.stock <= 0;
                    const isLow = item.stock > 0 && item.stock <= 10;

                    return (
                      <tr key={item.id} className="hover:bg-[#faf8f4] transition-colors">
                        {/* Produce info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-[#ebe5dc] overflow-hidden shrink-0 border border-[#dfd7c9]">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#526055]">
                                  <Leaf className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-[#242b26] block">
                                {item.name}
                              </span>
                              <span className="text-xs text-[#6e7870] flex items-center gap-1.5">
                                {item.organic && (
                                  <span className="text-[#2d4734] font-semibold">Organic</span>
                                )}
                                <span>•</span>
                                <span>{item.harvestNote || 'Fresh harvest'}</span>
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-3 text-[#556358]">
                          <span className="px-2 py-0.5 rounded-md bg-[#f0ede6] text-xs font-medium">
                            {item.category}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-3 font-semibold text-[#242b26]">
                          ${item.price.toFixed(2)} <span className="text-xs font-normal text-[#6e7870]">/ {item.unit}</span>
                        </td>

                        {/* Stock */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-bold ${isSoldOut ? 'text-[#a34426]' : isLow ? 'text-[#c47d4e]' : 'text-[#2d4734]'}`}>
                              {item.stock} {item.unit}s
                            </span>
                            {isLow && (
                              <span className="w-2 h-2 rounded-full bg-[#c47d4e] inline-block" title="Low stock"></span>
                            )}
                          </div>
                        </td>

                        {/* Quick Restock Buttons */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleQuickRestock(item, 5)}
                              className="px-2 py-1 rounded bg-[#f0f6f2] hover:bg-[#dfeee3] text-[#2d4734] text-xs font-bold transition-colors"
                              title="Harvest +5 more"
                            >
                              +5
                            </button>
                            <button
                              onClick={() => handleQuickRestock(item, 15)}
                              className="px-2 py-1 rounded bg-[#f0f6f2] hover:bg-[#dfeee3] text-[#2d4734] text-xs font-bold transition-colors"
                              title="Harvest +15 more"
                            >
                              +15
                            </button>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-3">
                          {isSoldOut ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#fceeed] text-[#9c3924]">
                              Sold Out
                            </span>
                          ) : isLow ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#fff4eb] text-[#b36729]">
                              Low Stock
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#edf7f0] text-[#2c613c]">
                              Available
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              id={`edit-produce-btn-${item.id}`}
                              onClick={() => openEditModal(item)}
                              className="p-1.5 rounded-lg text-[#556358] hover:text-[#2d4734] hover:bg-[#f0ede6] transition-colors"
                              title="Edit produce"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              id={`delete-produce-btn-${item.id}`}
                              onClick={() => {
                                if (confirm(`Remove ${item.name} from sale list?`)) {
                                  onDeleteProduce(item.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-[#8f8578] hover:text-[#a83232] hover:bg-[#fceeed] transition-colors"
                              title="Delete produce"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLOUD ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Order Status Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 bg-[#f0ede6] p-1 rounded-xl">
              {['all', 'new', 'packing', 'ready', 'completed'].map((status) => (
                <button
                  key={status}
                  id={`order-filter-${status}`}
                  onClick={() => setOrderStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    orderStatusFilter === status
                      ? 'bg-[#2d4734] text-white shadow-xs'
                      : 'text-[#556358] hover:text-[#242b26]'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <span className="text-xs text-[#6e7870] font-medium">
              {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} found
            </span>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#dfd7c9] p-10 text-center">
              <Package className="w-12 h-12 mx-auto text-[#8c978e] mb-3 stroke-[1.5]" />
              <h3 className="font-display font-bold text-lg text-[#242b26] mb-1">
                No Orders in this category
              </h3>
              <p className="text-xs text-[#6e7870]">
                Customer orders placed in the Produce Market will show up here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                return (
                  <div
                    key={order.id}
                    id={`farmer-order-${order.id}`}
                    className="bg-white rounded-2xl border border-[#dfd7c9] p-5 shadow-xs hover:border-[#b4c9b8] transition-all"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#f1ece2] gap-3">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-sm text-[#2d4734]">
                            {order.id}
                          </span>
                          <span className="text-xs text-[#78857a]">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            order.status === 'new' 
                              ? 'bg-[#ffebe0] text-[#b35324] border border-[#f5ccb5]'
                              : order.status === 'packing'
                              ? 'bg-[#fef8e7] text-[#94691e]'
                              : order.status === 'ready'
                              ? 'bg-[#e8f5ec] text-[#2c613c]'
                              : 'bg-[#edeae4] text-[#636b65]'
                          }`}>
                            {order.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-[#4c574e] mt-1 font-medium">
                          <span className="font-bold text-[#242b26]">{order.customerName}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[#8a5d3b]" />
                            {order.customerPhone}
                          </span>
                          <span>•</span>
                          <span className="capitalize">
                            {order.fulfillmentType === 'pickup' ? `Pickup: ${order.pickupTime}` : `Delivery: ${order.deliveryAddress}`}
                          </span>
                        </div>
                      </div>

                      {/* Instant Total & Status Changer */}
                      <div className="flex items-center gap-4 self-end sm:self-center">
                        <div className="text-right">
                          <span className="text-[11px] uppercase tracking-wider text-[#7a867c] block">Instant Total</span>
                          <span className="font-display font-bold text-lg text-[#2d4734]">
                            ${order.total.toFixed(2)}
                          </span>
                        </div>

                        {/* Status dropdown */}
                        <select
                          id={`order-status-select-${order.id}`}
                          value={order.status}
                          onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                          className="px-3 py-1.5 rounded-xl bg-[#faf8f4] border border-[#d6cec0] text-xs font-semibold text-[#242b26] focus:outline-none focus:ring-2 focus:ring-[#2d4734]"
                        >
                          <option value="new">New</option>
                          <option value="packing">Packing</option>
                          <option value="ready">Ready for Pickup</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="pt-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-[#faf8f4] p-2 rounded-lg border border-[#e8e2d5] text-xs flex justify-between items-center"
                          >
                            <span className="font-semibold text-[#242b26]">
                              {item.quantity} {item.unit} × {item.name}
                            </span>
                            <span className="font-bold text-[#556358]">
                              ${item.subtotal.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {order.notes && (
                        <p className="text-xs text-[#738075] italic mt-2.5">
                          Farmer Note: "{order.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: INVENTORY TRACKING & HARVEST ALERTS */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Low Stock Alerts */}
            <div className="bg-white rounded-2xl border border-[#dfd7c9] p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-[#c47d4e]" />
                <h3 className="font-display font-bold text-base text-[#242b26]">
                  Harvest & Restock Alerts
                </h3>
              </div>

              {produceList.filter(p => p.stock <= 10).length === 0 ? (
                <div className="p-4 rounded-xl bg-[#f2f8f4] border border-[#cbe1d1] text-xs text-[#2d5038]">
                  All produce items are well stocked for the harvest!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {produceList.filter(p => p.stock <= 10).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#fffaf5] border border-[#f5dece] text-xs"
                    >
                      <div>
                        <span className="font-bold text-[#242b26] block">{item.name}</span>
                        <span className="text-[#a65329] font-semibold">
                          {item.stock === 0 ? 'SOLD OUT' : `Only ${item.stock} ${item.unit} left`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleQuickRestock(item, 10)}
                          className="px-3 py-1.5 rounded-lg bg-[#2d4734] hover:bg-[#233829] text-white text-xs font-bold transition-colors"
                        >
                          Harvest +10 {item.unit}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cloud Storage & Backup Details */}
            <div className="bg-white rounded-2xl border border-[#dfd7c9] p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <Cloud className="w-5 h-5 text-[#2d4734]" />
                <h3 className="font-display font-bold text-base text-[#242b26]">
                  Cloud Inventory Sync Status
                </h3>
              </div>

              <div className="space-y-3 text-xs text-[#4f5b51]">
                <div className="p-3 rounded-xl bg-[#faf8f4] border border-[#e2dbcd] flex items-center justify-between">
                  <span>Cloud Database State</span>
                  <span className="font-bold text-[#2d4734] flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-[#72b888]" />
                    Synchronized
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#faf8f4] border border-[#e2dbcd] flex items-center justify-between">
                  <span>Automatic Stock Decrement</span>
                  <span className="font-semibold text-[#242b26]">Enabled on Order</span>
                </div>

                <div className="p-3 rounded-xl bg-[#faf8f4] border border-[#e2dbcd] flex items-center justify-between">
                  <span>Total Order Volume</span>
                  <span className="font-bold text-[#242b26]">{orders.length} orders recorded</span>
                </div>

                <div className="p-3 rounded-xl bg-[#faf8f4] border border-[#e2dbcd] flex items-center justify-between">
                  <span>Gross Produce Sales</span>
                  <span className="font-bold text-[#2d4734]">${stats.totalRevenue.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-3xl border border-[#dfd7c9] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="p-5 bg-[#2d4734] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-[#9dd6b1]" />
                <h3 className="font-display font-bold text-lg">
                  {editingProduce ? 'Edit Produce Item' : 'Put Up New Produce for Sale'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveProduce} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#3c463f] mb-1">
                    Produce Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., Sweet Bi-Color Butter Corn"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#faf8f4] border border-[#d6cec0] text-sm text-[#242b26] focus:outline-none focus:ring-2 focus:ring-[#2d4734]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3c463f] mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#faf8f4] border border-[#d6cec0] text-sm text-[#242b26] focus:outline-none focus:ring-2 focus:ring-[#2d4734]"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Herbs">Herbs</option>
                    <option value="Roots">Roots</option>
                    <option value="Pantry & Eggs">Pantry & Eggs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3c463f] mb-1">
                    Unit Type *
                  </label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#faf8f4] border border-[#d6cec0] text-sm text-[#242b26] focus:outline-none focus:ring-2 focus:ring-[#2d4734]"
                  >
                    <option value="lb">lb (pound)</option>
                    <option value="bunch">bunch</option>
                    <option value="pint">pint</option>
                    <option value="dozen">dozen</option>
                    <option value="ear">ear</option>
                    <option value="head">head</option>
                    <option value="jar (12oz)">jar (12oz)</option>
                    <option value="bag">bag</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3c463f] mb-1">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="3.50"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#faf8f4] border border-[#d6cec0] text-sm text-[#242b26] focus:outline-none focus:ring-2 focus:ring-[#2d4734]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3c463f] mb-1">
                    Available Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    placeholder="30"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#faf8f4] border border-[#d6cec0] text-sm text-[#242b26] focus:outline-none focus:ring-2 focus:ring-[#2d4734]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#3c463f] mb-1">
                    Harvest Freshness Note
                  </label>
                  <input
                    type="text"
                    value={formHarvestNote}
                    onChange={(e) => setFormHarvestNote(e.target.value)}
                    placeholder="e.g., Vine-ripened, picked this morning"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#faf8f4] border border-[#d6cec0] text-sm text-[#242b26] focus:outline-none focus:ring-2 focus:ring-[#2d4734]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#3c463f] mb-1">
                    Description & Flavor Profile
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Describe taste, cooking ideas, or farm field origin..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[#faf8f4] border border-[#d6cec0] text-sm text-[#242b26] focus:outline-none focus:ring-2 focus:ring-[#2d4734]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3c463f] mb-1">
                    Badge Tag (optional)
                  </label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="e.g., Just Picked, Farmer's Pick"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#faf8f4] border border-[#d6cec0] text-sm text-[#242b26] focus:outline-none focus:ring-2 focus:ring-[#2d4734]"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formOrganic}
                      onChange={(e) => setFormOrganic(e.target.checked)}
                      className="w-4 h-4 rounded text-[#2d4734] focus:ring-[#2d4734]"
                    />
                    <span className="text-xs font-bold text-[#3c463f]">
                      100% Organically Grown
                    </span>
                  </label>
                </div>

                {/* Photo Preset Selection */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#3c463f] mb-2">
                    Produce Photo Preset
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {PHOTO_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setFormImageUrl(preset.url)}
                        className={`group relative rounded-lg overflow-hidden border aspect-square ${
                          formImageUrl === preset.url
                            ? 'ring-2 ring-[#2d4734] border-transparent'
                            : 'border-[#dfd7c9] opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] truncate px-1 text-center">
                          {preset.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-[#dfd7c9] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#faf8f4] border border-[#d6cec0] text-[#556358] font-semibold text-xs hover:bg-[#ede7dc]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#2d4734] hover:bg-[#233829] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingProduce ? 'Save Produce Changes' : 'Put Up on Sale List'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
