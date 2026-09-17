export interface ProduceItem {
  id: string;
  name: string;
  category: 'Vegetable' | 'Fruits' | 'Herbs' | 'Roots' | 'Pantry & Eggs';
  price: number;
  unit: string; // 'lb', 'bunch', 'pint', 'dozen', 'head', 'bag'
  stock: number;
  organic: boolean;
  harvestNote: string;
  description: string;
  imageUrl?: string;
  badge?: string; // e.g., "Picked Today", "Farmer's Favorite", "Sweet & Crisp"
  status: 'available' | 'sold_out' | 'hidden';
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  produce: ProduceItem;
  quantity: number;
}

export interface OrderItem {
  produceId: string;
  name: string;
  unit: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  fulfillmentType: 'pickup' | 'delivery';
  pickupTime?: string;
  deliveryAddress?: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  status: 'new' | 'packing' | 'ready' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface InventoryStats {
  totalProduceCount: number;
  totalUnitsInStock: number;
  lowStockItemsCount: number;
  soldOutItemsCount: number;
  totalOrders: number;
  totalRevenue: number;
}

export type ViewMode = 'market' | 'farmer';

export interface Recipe {
  id: string;
  title: string;
  prepTime: string;
  cookTime: string;
  servings: string;
  difficulty: 'Easy' | 'Medium' | 'Culinary';
  description: string;
  usedCartIngredients: string[];
  pantryStaplesNeeded: string[];
  instructions: string[];
  chefTip?: string;
  tags?: string[];
}
