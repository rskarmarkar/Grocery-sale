import React, { useState, useEffect, useCallback } from 'react';
import { ViewMode, ProduceItem, CartItem, Order, InventoryStats } from './types';
import { 
  fetchProduce, createProduce, updateProduce, deleteProduce, 
  fetchOrders, updateOrderStatus, fetchInventoryStats 
} from './services/api';
import { INITIAL_PRODUCE } from './data/initialProduce';
import { Header } from './components/Header';
import { ProduceMarket } from './components/ProduceMarket';
import { FarmerDashboard } from './components/FarmerDashboard';
import { CartDrawer } from './components/CartDrawer';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { RecipeModal } from './components/RecipeModal';

const CART_STORAGE_KEY = 'willow_farm_cart_items';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('market');
  const [produceList, setProduceList] = useState<ProduceItem[]>(INITIAL_PRODUCE);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalProduceCount: INITIAL_PRODUCE.length,
    totalUnitsInStock: INITIAL_PRODUCE.reduce((s, p) => s + p.stock, 0),
    lowStockItemsCount: INITIAL_PRODUCE.filter(p => p.stock > 0 && p.stock <= 10).length,
    soldOutItemsCount: 0,
    totalOrders: 0,
    totalRevenue: 0
  });

  // Cart State (stored locally in browser for shopper convenience)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Show temporary toast banner
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Sync cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to persist cart', e);
    }
  }, [cart]);

  // Load cloud data from server
  const loadCloudData = useCallback(async () => {
    try {
      const [remoteProduce, remoteOrders, remoteStats] = await Promise.all([
        fetchProduce(),
        fetchOrders(),
        fetchInventoryStats()
      ]);

      if (remoteProduce && remoteProduce.length > 0) {
        setProduceList(remoteProduce);
      }
      if (remoteOrders) {
        setOrders(remoteOrders);
      }
      if (remoteStats) {
        setStats(remoteStats);
      }
    } catch (err) {
      console.error('Error fetching cloud data', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCloudData();
  }, [loadCloudData]);

  // Recalculate stats when produce or orders change locally
  const refreshStats = (currentProduce: ProduceItem[], currentOrders: Order[]) => {
    const totalUnits = currentProduce.reduce((acc, item) => acc + item.stock, 0);
    const lowStock = currentProduce.filter(item => item.stock > 0 && item.stock <= 10).length;
    const soldOut = currentProduce.filter(item => item.stock === 0).length;
    const revenue = currentOrders
      .filter(o => o.status !== 'cancelled')
      .reduce((acc, o) => acc + o.total, 0);

    setStats({
      totalProduceCount: currentProduce.length,
      totalUnitsInStock: totalUnits,
      lowStockItemsCount: lowStock,
      soldOutItemsCount: soldOut,
      totalOrders: currentOrders.length,
      totalRevenue: Math.round(revenue * 100) / 100
    });
  };

  // Cart operations
  const handleAddToCart = (produce: ProduceItem, quantity = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find(item => item.produce.id === produce.id);
      if (existing) {
        const newQty = Math.min(produce.stock, existing.quantity + quantity);
        return prevCart.map(item =>
          item.produce.id === produce.id ? { ...item, quantity: newQty } : item
        );
      }
      const initialQty = Math.min(produce.stock, quantity);
      return [...prevCart, { produce, quantity: initialQty }];
    });
    showToast(`Added ${produce.name} to cart`);
  };

  const handleUpdateCartQuantity = (produceId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.produce.id === produceId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            // Respect stock limit
            const produce = produceList.find(p => p.id === produceId);
            const maxStock = produce ? produce.stock : item.produce.stock;
            return {
              ...item,
              quantity: Math.min(maxStock, nextQty)
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveCartItem = (produceId: string) => {
    setCart(prev => prev.filter(item => item.produce.id !== produceId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Farmer operations
  const handleAddProduce = async (produceData: Partial<ProduceItem>) => {
    try {
      const created = await createProduce(produceData);
      const updatedList = [created, ...produceList];
      setProduceList(updatedList);
      refreshStats(updatedList, orders);
      showToast(`Added "${created.name}" to sale list!`);
    } catch (err: any) {
      alert(err.message || 'Failed to add produce');
    }
  };

  const handleUpdateProduce = async (id: string, updates: Partial<ProduceItem>) => {
    try {
      const updated = await updateProduce(id, updates);
      const updatedList = produceList.map(p => p.id === id ? updated : p);
      setProduceList(updatedList);

      // Also keep cart item produce info up to date
      setCart(prevCart =>
        prevCart.map(item =>
          item.produce.id === id
            ? {
                ...item,
                produce: updated,
                quantity: Math.min(updated.stock, item.quantity)
              }
            : item
        ).filter(item => item.quantity > 0)
      );

      refreshStats(updatedList, orders);
      showToast(`Updated "${updated.name}"`);
    } catch (err: any) {
      alert(err.message || 'Failed to update produce');
    }
  };

  const handleDeleteProduce = async (id: string) => {
    try {
      await deleteProduce(id);
      const updatedList = produceList.filter(p => p.id !== id);
      setProduceList(updatedList);
      setCart(prev => prev.filter(item => item.produce.id !== id));
      refreshStats(updatedList, orders);
      showToast('Produce item removed from sale list');
    } catch (err: any) {
      alert(err.message || 'Failed to delete produce');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const updated = await updateOrderStatus(orderId, status);
      const updatedOrders = orders.map(o => o.id === orderId ? updated : o);
      setOrders(updatedOrders);
      refreshStats(produceList, updatedOrders);
      showToast(`Order ${orderId} updated to "${status}"`);
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  // Order placed callback from CartDrawer
  const handleOrderPlaced = (order: Order, updatedProduce: ProduceItem[]) => {
    if (updatedProduce && updatedProduce.length > 0) {
      setProduceList(updatedProduce);
    }
    const updatedOrders = [order, ...orders];
    setOrders(updatedOrders);
    refreshStats(updatedProduce || produceList, updatedOrders);
    setConfirmedOrder(order);
    showToast(`Order ${order.id} placed and recorded in cloud!`);
  };

  return (
    <div className="min-h-screen bg-[#faf8f4] text-[#242b26] flex flex-col selection:bg-[#c9decb] selection:text-[#183522]">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-24 right-4 z-50 bg-[#2d4734] text-white px-4 py-2.5 rounded-xl shadow-lg border border-[#446b4e] text-xs font-semibold animate-in slide-in-from-top-2 duration-200">
          {toastMessage}
        </div>
      )}

      {/* Main Header with Navigation & Cart Total */}
      <Header
        viewMode={viewMode}
        onViewChange={setViewMode}
        cart={cart}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenRecipes={() => setIsRecipeModalOpen(true)}
      />

      {/* View router */}
      <main className="flex-1">
        {viewMode === 'market' ? (
          <ProduceMarket
            produceList={produceList}
            cart={cart}
            onAddToCart={handleAddToCart}
            onUpdateCartQuantity={handleUpdateCartQuantity}
            onOpenCart={() => setIsCartOpen(true)}
            onOpenRecipes={() => setIsRecipeModalOpen(true)}
          />
        ) : (
          <FarmerDashboard
            produceList={produceList}
            orders={orders}
            stats={stats}
            onAddProduce={handleAddProduce}
            onUpdateProduce={handleUpdateProduce}
            onDeleteProduce={handleDeleteProduce}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onRefreshData={loadCloudData}
          />
        )}
      </main>

      {/* Instant Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onOrderPlaced={handleOrderPlaced}
        onOpenRecipes={() => {
          setIsCartOpen(false);
          setIsRecipeModalOpen(true);
        }}
      />

      {/* Farm Basket Recipe Modal */}
      <RecipeModal
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
        cart={cart}
        onOpenCart={() => {
          setIsRecipeModalOpen(false);
          setIsCartOpen(true);
        }}
      />

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        onViewInFarmerDashboard={() => {
          setConfirmedOrder(null);
          setViewMode('farmer');
        }}
      />
    </div>
  );
}
