import { ProduceItem, Order, InventoryStats } from '../types';
import { INITIAL_PRODUCE } from '../data/initialProduce';

// Local storage key for fallback if backend is momentarily offline
const LOCAL_STORAGE_PRODUCE_KEY = 'farm_local_produce';
const LOCAL_STORAGE_ORDERS_KEY = 'farm_local_orders';

export async function fetchProduce(): Promise<ProduceItem[]> {
  try {
    const res = await fetch('/api/produce');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    localStorage.setItem(LOCAL_STORAGE_PRODUCE_KEY, JSON.stringify(data));
    return data;
  } catch (err) {
    console.warn('Falling back to cached or default produce', err);
    const cached = localStorage.getItem(LOCAL_STORAGE_PRODUCE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // ignore
      }
    }
    return INITIAL_PRODUCE;
  }
}

export async function createProduce(produceData: Partial<ProduceItem>): Promise<ProduceItem> {
  const res = await fetch('/api/produce', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(produceData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create produce item');
  }
  return res.json();
}

export async function updateProduce(id: string, updates: Partial<ProduceItem>): Promise<ProduceItem> {
  const res = await fetch(`/api/produce/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update produce item');
  }
  return res.json();
}

export async function deleteProduce(id: string): Promise<void> {
  const res = await fetch(`/api/produce/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to delete produce item');
  }
}

export async function createOrder(orderPayload: {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  fulfillmentType: 'pickup' | 'delivery';
  pickupTime?: string;
  deliveryAddress?: string;
  notes?: string;
  items: { produceId: string; quantity: number }[];
}): Promise<{ order: Order; produce: ProduceItem[] }> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to submit order');
  }
  return res.json();
}

export async function fetchOrders(): Promise<Order[]> {
  try {
    const res = await fetch('/api/orders');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(data));
    return data;
  } catch (err) {
    console.warn('Falling back to local orders', err);
    const cached = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    return cached ? JSON.parse(cached) : [];
  }
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
  const res = await fetch(`/api/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update order status');
  }
  return res.json();
}

export async function fetchInventoryStats(): Promise<InventoryStats> {
  try {
    const res = await fetch('/api/inventory/stats');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  } catch (err) {
    console.warn('Could not fetch remote stats, calculating fallback', err);
    return {
      totalProduceCount: 0,
      totalUnitsInStock: 0,
      lowStockItemsCount: 0,
      soldOutItemsCount: 0,
      totalOrders: 0,
      totalRevenue: 0
    };
  }
}

export async function resetDemoDatabase(): Promise<void> {
  await fetch('/api/reset-demo', { method: 'POST' });
}
