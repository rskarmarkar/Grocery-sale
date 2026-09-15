import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Cloud Database File Path (persisted in container filesystem)
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'farm_database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface ProduceRecord {
  id: string;
  name: string;
  category: 'Vegetables' | 'Fruits' | 'Herbs' | 'Roots' | 'Pantry & Eggs';
  price: number;
  unit: string;
  stock: number;
  organic: boolean;
  harvestNote: string;
  description: string;
  imageUrl?: string;
  badge?: string;
  status: 'available' | 'sold_out' | 'hidden';
  createdAt: string;
  updatedAt: string;
}

interface OrderRecord {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  fulfillmentType: 'pickup' | 'delivery';
  pickupTime?: string;
  deliveryAddress?: string;
  notes?: string;
  items: {
    produceId: string;
    name: string;
    unit: string;
    price: number;
    quantity: number;
    subtotal: number;
  }[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  status: 'new' | 'packing' | 'ready' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface DatabaseSchema {
  produce: ProduceRecord[];
  orders: OrderRecord[];
}

const DEFAULT_PRODUCE: ProduceRecord[] = [
  {
    id: 'prod-1',
    name: 'Heirloom Brandywine Tomatoes',
    category: 'Vegetables',
    price: 4.50,
    unit: 'lb',
    stock: 35,
    organic: true,
    harvestNote: 'Vine-ripened, picked this morning',
    description: 'Deep pink, rich sweet-tart flavor, intensely aromatic with dense, juicy flesh. Ideal for slicing and salads.',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
    badge: 'Picked Today',
    status: 'available',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-2',
    name: 'Tuscan Lacinato Kale',
    category: 'Vegetables',
    price: 3.25,
    unit: 'bunch',
    stock: 24,
    organic: true,
    harvestNote: 'Crisp morning harvest',
    description: 'Dark blue-green crinkled leaves with a mild, nutty earthy taste. Tender when massaged or sautéed with garlic.',
    imageUrl: 'https://images.unsplash.com/photo-1524179091875-bf99a9a6fa57?w=800&auto=format&fit=crop&q=80',
    badge: 'Organic Certified',
    status: 'available',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-3',
    name: 'Sweet Honeycrisp Apples',
    category: 'Fruits',
    price: 3.75,
    unit: 'lb',
    stock: 45,
    organic: true,
    harvestNote: 'Orchard fresh from the southern slope',
    description: 'Explosively crisp and juicy with a balanced honey-like sweetness. Great for snacking, baking, and cider.',
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&auto=format&fit=crop&q=80',
    badge: "Farmer's Pick",
    status: 'available',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-4',
    name: 'Rainbow French Carrots',
    category: 'Roots',
    price: 3.80,
    unit: 'bunch',
    stock: 18,
    organic: true,
    harvestNote: 'Freshly pulled & washed with greens attached',
    description: 'Vibrant mix of purple, golden, and classic orange baby carrots. Sweet, crunchy, and loaded with antioxidants.',
    imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c717?w=800&auto=format&fit=crop&q=80',
    badge: 'Sweet & Crunchy',
    status: 'available',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-5',
    name: 'Sweet Bi-Color Butter Corn',
    category: 'Vegetables',
    price: 1.25,
    unit: 'ear',
    stock: 50,
    organic: true,
    harvestNote: 'Harvested at dawn for peak sugar levels',
    description: 'Plump golden and white kernels that pop with natural milky sweetness. Perfect for grilling or boiling with butter.',
    imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&auto=format&fit=crop&q=80',
    badge: 'Just Picked',
    status: 'available',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-6',
    name: 'Italian Genovese Basil',
    category: 'Herbs',
    price: 2.75,
    unit: 'bunch',
    stock: 12,
    organic: true,
    harvestNote: 'Cut fresh with aromatic floral oils',
    description: 'Broad aromatic leaves with deep sweet clove & anise notes. Perfect for handmade pesto and tomato caprese.',
    imageUrl: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=800&auto=format&fit=crop&q=80',
    badge: 'Aromatic',
    status: 'available',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-7',
    name: 'Pasture-Raised Farm Eggs',
    category: 'Pantry & Eggs',
    price: 6.50,
    unit: 'dozen',
    stock: 15,
    organic: true,
    harvestNote: 'Collected daily from free-roaming hens',
    description: 'Rich amber yolks with thick whites from heritage hens foraging on organic green clover and pasture bugs.',
    imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&auto=format&fit=crop&q=80',
    badge: 'Pasture Raised',
    status: 'available',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-8',
    name: 'Raw Wildflower Honeycomb Honey',
    category: 'Pantry & Eggs',
    price: 11.00,
    unit: 'jar (12oz)',
    stock: 8,
    organic: true,
    harvestNote: 'Cold extracted from on-farm apiary',
    description: 'Unfiltered, unpasteurized honey made by bees foraging on our summer clover, blackberry, and apple blossoms.',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80',
    badge: 'Raw & Pure',
    status: 'available',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-9',
    name: 'Sugar Snap Peas',
    category: 'Vegetables',
    price: 4.20,
    unit: 'lb',
    stock: 14,
    organic: true,
    harvestNote: 'Plump pods harvested early morning',
    description: 'Tender, sweet, edible pods with juicy green peas inside. Delicious raw with dip or quick stir-fry.',
    imageUrl: 'https://images.unsplash.com/photo-1592394533824-9440e5d68530?w=800&auto=format&fit=crop&q=80',
    badge: 'Sweet Crunch',
    status: 'available',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-10',
    name: 'Organic Strawberries',
    category: 'Fruits',
    price: 5.50,
    unit: 'pint',
    stock: 6,
    organic: true,
    harvestNote: 'Red-ripe, fragrant & sweet',
    description: 'Naturally sun-sweetened berries bursting with fragrance and deep strawberry flavor. No synthetic sprays.',
    imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&auto=format&fit=crop&q=80',
    badge: 'Low Stock',
    status: 'available',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading database file, using fallback', e);
  }

  const initialData: DatabaseSchema = {
    produce: DEFAULT_PRODUCE,
    orders: [
      {
        id: 'ORD-1001',
        customerName: 'Eleanor Vance',
        customerPhone: '(555) 234-8901',
        customerEmail: 'eleanor.vance@example.com',
        fulfillmentType: 'pickup',
        pickupTime: 'Today 3:30 PM',
        notes: 'Please pack in reusable cardboard box if possible.',
        items: [
          {
            produceId: 'prod-1',
            name: 'Heirloom Brandywine Tomatoes',
            unit: 'lb',
            price: 4.50,
            quantity: 3,
            subtotal: 13.50
          },
          {
            produceId: 'prod-6',
            name: 'Italian Genovese Basil',
            unit: 'bunch',
            price: 2.75,
            quantity: 2,
            subtotal: 5.50
          }
        ],
        subtotal: 19.00,
        tax: 0,
        deliveryFee: 0,
        total: 19.00,
        status: 'ready',
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ]
  };
  saveDatabase(initialData);
  return initialData;
}

function saveDatabase(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing database file', e);
  }
}

// In-memory reference that stays synchronized with disk
let db = loadDatabase();

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// Produce List
app.get('/api/produce', (req, res) => {
  res.json(db.produce);
});

// Add new produce item (Farmer)
app.post('/api/produce', (req, res) => {
  const { name, category, price, unit, stock, organic, harvestNote, description, imageUrl, badge } = req.body;
  if (!name || price == null || stock == null) {
    res.status(400).json({ error: 'Name, price, and stock are required' });
    return;
  }

  const newProduce: ProduceRecord = {
    id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: String(name).trim(),
    category: category || 'Vegetables',
    price: Number(price),
    unit: unit || 'lb',
    stock: Math.max(0, Number(stock)),
    organic: Boolean(organic),
    harvestNote: harvestNote ? String(harvestNote).trim() : 'Freshly harvested',
    description: description ? String(description).trim() : '',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&auto=format&fit=crop&q=80',
    badge: badge ? String(badge).trim() : undefined,
    status: Number(stock) > 0 ? 'available' : 'sold_out',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.produce.unshift(newProduce);
  saveDatabase(db);
  res.status(201).json(newProduce);
});

// Update produce item (Farmer)
app.put('/api/produce/:id', (req, res) => {
  const { id } = req.params;
  const index = db.produce.findIndex(p => p.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Produce item not found' });
    return;
  }

  const existing = db.produce[index];
  const updated: ProduceRecord = {
    ...existing,
    ...req.body,
    id: existing.id, // Preserve ID
    updatedAt: new Date().toISOString()
  };

  // Adjust status based on stock
  if (updated.stock <= 0 && updated.status === 'available') {
    updated.status = 'sold_out';
  } else if (updated.stock > 0 && updated.status === 'sold_out') {
    updated.status = 'available';
  }

  db.produce[index] = updated;
  saveDatabase(db);
  res.json(updated);
});

// Delete produce item (Farmer)
app.delete('/api/produce/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = db.produce.length;
  db.produce = db.produce.filter(p => p.id !== id);
  if (db.produce.length === initialLength) {
    res.status(404).json({ error: 'Produce item not found' });
    return;
  }
  saveDatabase(db);
  res.json({ success: true, id });
});

// Customer Places Order (Automatic Cloud Inventory Tracking)
app.post('/api/orders', (req, res) => {
  const { customerName, customerPhone, customerEmail, fulfillmentType, pickupTime, deliveryAddress, notes, items } = req.body;

  if (!customerName || !customerPhone || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Customer name, phone, and at least one item are required' });
    return;
  }

  // Stock verification & inventory deduction
  const validatedItems: OrderRecord['items'] = [];
  let subtotal = 0;

  for (const requestedItem of items) {
    const produce = db.produce.find(p => p.id === requestedItem.produceId);
    if (!produce) {
      res.status(400).json({ error: `Item ${requestedItem.produceId} is no longer in our catalog` });
      return;
    }

    const requestedQty = Math.max(1, Number(requestedItem.quantity) || 1);
    if (produce.stock < requestedQty) {
      res.status(400).json({
        error: `Insufficient stock for ${produce.name}. Only ${produce.stock} ${produce.unit} available.`
      });
      return;
    }

    const itemSubtotal = Math.round(produce.price * requestedQty * 100) / 100;
    subtotal += itemSubtotal;

    validatedItems.push({
      produceId: produce.id,
      name: produce.name,
      unit: produce.unit,
      price: produce.price,
      quantity: requestedQty,
      subtotal: itemSubtotal
    });
  }

  // Deduct inventory in cloud database
  for (const item of validatedItems) {
    const produce = db.produce.find(p => p.id === item.produceId);
    if (produce) {
      produce.stock = Math.max(0, produce.stock - item.quantity);
      if (produce.stock === 0) {
        produce.status = 'sold_out';
      }
      produce.updatedAt = new Date().toISOString();
    }
  }

  subtotal = Math.round(subtotal * 100) / 100;
  const deliveryFee = fulfillmentType === 'delivery' ? 5.00 : 0.00;
  const tax = 0; // Raw agricultural produce is tax-exempt
  const total = Math.round((subtotal + deliveryFee + tax) * 100) / 100;

  const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

  const newOrder: OrderRecord = {
    id: orderId,
    customerName: String(customerName).trim(),
    customerPhone: String(customerPhone).trim(),
    customerEmail: customerEmail ? String(customerEmail).trim() : undefined,
    fulfillmentType: fulfillmentType === 'delivery' ? 'delivery' : 'pickup',
    pickupTime: pickupTime ? String(pickupTime).trim() : 'Next available window',
    deliveryAddress: deliveryAddress ? String(deliveryAddress).trim() : undefined,
    notes: notes ? String(notes).trim() : undefined,
    items: validatedItems,
    subtotal,
    tax,
    deliveryFee,
    total,
    status: 'new',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.orders.unshift(newOrder);
  saveDatabase(db);

  res.status(201).json({
    order: newOrder,
    produce: db.produce // Return updated stock levels
  });
});

// List all orders (Farmer)
app.get('/api/orders', (req, res) => {
  res.json(db.orders);
});

// Update order status (Farmer)
app.patch('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const order = db.orders.find(o => o.id === id);

  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const validStatuses = ['new', 'packing', 'ready', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    return;
  }

  order.status = status;
  order.updatedAt = new Date().toISOString();
  saveDatabase(db);

  res.json(order);
});

// Inventory Statistics (Farmer)
app.get('/api/inventory/stats', (req, res) => {
  const totalProduceCount = db.produce.length;
  const totalUnitsInStock = db.produce.reduce((acc, item) => acc + item.stock, 0);
  const lowStockItemsCount = db.produce.filter(item => item.stock > 0 && item.stock <= 10).length;
  const soldOutItemsCount = db.produce.filter(item => item.stock === 0).length;
  const totalOrders = db.orders.length;
  const totalRevenue = db.orders
    .filter(o => o.status !== 'cancelled')
    .reduce((acc, o) => acc + o.total, 0);

  res.json({
    totalProduceCount,
    totalUnitsInStock,
    lowStockItemsCount,
    soldOutItemsCount,
    totalOrders,
    totalRevenue: Math.round(totalRevenue * 100) / 100
  });
});

// Reset demo database to fresh catalog
app.post('/api/reset-demo', (req, res) => {
  db = {
    produce: JSON.parse(JSON.stringify(DEFAULT_PRODUCE)),
    orders: []
  };
  saveDatabase(db);
  res.json({ success: true, message: 'Database reset to harvest seed state' });
});

// Start server with Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Farm Stand Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
