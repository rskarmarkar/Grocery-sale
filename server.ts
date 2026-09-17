import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

let genAI: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!genAI) {
    genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAI;
}

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
  category: 'Vegetable' | 'Fruits' | 'Herbs' | 'Roots' | 'Pantry & Eggs';
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
    category: 'Vegetable',
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
    category: 'Vegetable',
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
    category: 'Vegetable',
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
    imageUrl: 'https://images.unsplash.com/photo-1776257217010-1c2e92207f2a?w=800&auto=format&fit=crop&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1660224286794-fc173fa9295c?w=800&auto=format&fit=crop&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&auto=format&fit=crop&q=80',
    badge: 'Raw & Pure',
    status: 'available',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-9',
    name: 'Sugar Snap Peas',
    category: 'Vegetable',
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
      const parsed: DatabaseSchema = JSON.parse(data);
      if (parsed.produce) {
        parsed.produce = parsed.produce.map((p: any) => ({
          ...p,
          category: p.category === 'Vegetables' ? 'Vegetable' : p.category
        }));
      }
      return parsed;
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

// Built-in Farm Recipes Fallback Generator
interface FarmRecipeTemplate {
  title: string;
  matchKeys: string[];
  prepTime: string;
  cookTime: string;
  servings: string;
  difficulty: 'Easy' | 'Medium' | 'Culinary';
  description: string;
  pantryStaples: string[];
  instructions: string[];
  chefTip: string;
  tags: string[];
}

const BUILTIN_RECIPES: FarmRecipeTemplate[] = [
  {
    title: 'Blistered Farm Tomato & Basil Rustic Skillet Pasta',
    matchKeys: ['tomato', 'basil', 'garlic', 'onion'],
    prepTime: '10 mins',
    cookTime: '15 mins',
    servings: '3-4 servings',
    difficulty: 'Easy',
    description: 'Sweet, juicy farm tomatoes burst in hot olive oil with fresh torn basil, garlic, and tender pasta.',
    pantryStaples: ['8 oz Pasta (penne, linguine, or rigatoni)', '3 tbsp Extra Virgin Olive Oil', '2 cloves Garlic (minced)', 'Salt & coarse black pepper', 'Parmesan cheese to finish'],
    instructions: [
      'Bring a large pot of heavily salted water to a rolling boil and cook pasta until al dente.',
      'Heat olive oil in a wide cast iron or stainless skillet over medium heat. Sauté minced garlic until fragrant (about 60 seconds).',
      'Tumble in whole or halved farm tomatoes. Cook undisturbed for 4 minutes until skins blister, then gently crush with a wooden spoon to create a silky sauce.',
      'Transfer drained pasta directly into the sauce along with 2 tablespoons of starchy pasta cooking water.',
      'Remove from heat, gently fold in torn fresh basil leaves, and season with sea salt, cracked black pepper, and shaved parmesan.'
    ],
    chefTip: 'Never chop basil with a knife far in advance—hand-tear it directly over the hot pasta right before serving to keep the aromatics vibrant.',
    tags: ['Dinner', 'Vegetarian', 'Quick (< 25 min)']
  },
  {
    title: 'Sautéed Garlic Lacinato Kale & Pasture Farm Egg Skillet',
    matchKeys: ['kale', 'egg', 'onion', 'pepper', 'spinach'],
    prepTime: '8 mins',
    cookTime: '10 mins',
    servings: '2 servings',
    difficulty: 'Easy',
    description: 'Crisp-tender ribboned Tuscan kale flash-sautéed with garlic and crowned with sunny farm eggs with golden runny yolks.',
    pantryStaples: ['2 tbsp Olive oil or butter', '2 cloves Garlic (thinly sliced)', 'Pinch of crushed red pepper flakes', 'Flaky sea salt & coarse black pepper', 'Toasted crusty bread (optional)'],
    instructions: [
      'Strip kale leaves from woody stems and slice into 1-inch ribbons. Rinse and dry thoroughly.',
      'Warm olive oil in a medium skillet over medium heat. Add sliced garlic and red pepper flakes, cooking until barely golden.',
      'Toss in the kale in batches with tongs until bright green and slightly wilted with charred edges (about 3-4 minutes). Season with salt and plate.',
      'In the same pan, melt a pat of butter and crack farm eggs. Fry sunny-side up until whites are crisp at edges and yolks remain silky.',
      'Slide hot eggs onto the kale beds. Break yolks open so they coat the greens as a rich, savory dressing.'
    ],
    chefTip: 'Massaging tough winter or hearty summer kale with a drop of olive oil and pinch of salt relaxes the fibers for tender bite.',
    tags: ['Breakfast & Brunch', 'Vegetarian', 'Gluten-Free', 'Quick (< 25 min)']
  },
  {
    title: 'Sweet Summer Corn & Snap Pea Skillet Succotash',
    matchKeys: ['corn', 'pea', 'pepper', 'onion', 'basil', 'squash'],
    prepTime: '12 mins',
    cookTime: '8 mins',
    servings: '4 servings',
    difficulty: 'Easy',
    description: 'Crisp sweet corn freshly sliced off the cob sautéed with tender sugar snap peas and aromatic herbs.',
    pantryStaples: ['2 tbsp Butter or olive oil', '1 small Shallot or red onion (diced)', 'Salt & freshly cracked black pepper', 'Zest of 1/2 fresh lemon'],
    instructions: [
      'Stand corn upright in a shallow bowl and slice kernels cleanly off the cob with a chef knife.',
      'Trim snap peas and cut diagonally into bite-sized pieces.',
      'Melt butter in a skillet over medium-high heat. Sauté diced shallots for 2 minutes until sweet and translucent.',
      'Add fresh sweet corn and snap peas. Cook briskly for 4-5 minutes, allowing light caramelization while keeping the crisp pop.',
      'Stir in lemon zest, fresh herbs, sea salt, and black pepper. Serve warm straight from the pan.'
    ],
    chefTip: 'Use the blunt backside of your knife to scrape the cob after cutting the kernels—this extracts the sweetest corn milk into your pan!',
    tags: ['Dinner', 'Vegetarian', 'Quick (< 25 min)', 'Gluten-Free']
  },
  {
    title: 'Pan-Seared Summer Squash with Herb & Lemon Vinaigrette',
    matchKeys: ['squash', 'zucchini', 'mint', 'herb', 'pepper'],
    prepTime: '10 mins',
    cookTime: '10 mins',
    servings: '3-4 servings',
    difficulty: 'Easy',
    description: 'Tender caramelized squash disks dressed warm in a bright lemon-mint vinaigrette with garden herbs.',
    pantryStaples: ['3 tbsp Extra virgin olive oil', '1 tbsp Lemon juice', '1/2 tsp Honey', 'Coarse sea salt & black pepper', 'Crumbled goat or feta cheese (optional)'],
    instructions: [
      'Slice squash into 1/3-inch rounds on a slight diagonal.',
      'Whisk lemon juice, olive oil, honey, salt, and pepper in a small bowl until emulsified.',
      'Heat 1 tbsp oil in a skillet or grill pan over medium-high heat. Sear squash in a single layer for 3-4 minutes per side until nicely browned.',
      'Transfer browned squash to a serving platter and spoon vinaigrette over the hot slices immediately.',
      'Scatter fresh mint, torn herbs, and crumbled cheese over top before serving.'
    ],
    chefTip: 'Keep the pan hot and avoid crowding so the squash caramelizes quickly instead of steaming and turning watery.',
    tags: ['Lunch / Light Salad', 'Vegetarian', 'Vegan', 'Gluten-Free']
  },
  {
    title: 'Sweet Farm Strawberry & Mint Ricotta Toast',
    matchKeys: ['strawberr', 'mint', 'honey', 'egg', 'herb'],
    prepTime: '10 mins',
    cookTime: '5 mins',
    servings: '2-4 servings',
    difficulty: 'Easy',
    description: 'Fresh sliced strawberries tossed with mint and honey spooned over cool whipped ricotta on warm toasted sourdough.',
    pantryStaples: ['4 slices Artisan sourdough or brioche bread', '1 cup Whole-milk ricotta cheese', '2 tbsp Honey or maple syrup', 'Flaky sea salt & cracked black pepper'],
    instructions: [
      'Hull and slice farm strawberries into quarters. Gently toss with torn mint leaves and 1 tablespoon of honey in a small bowl.',
      'Toast sourdough slices in a toaster or lightly fry in butter until golden and crunchy.',
      'Whisk ricotta in a small bowl with a pinch of salt until smooth and spreadable.',
      'Spread a generous layer of creamy ricotta over each warm toast slice.',
      'Top with marinated strawberries, drizzle with remaining honey, and finish with a tiny pinch of flaky sea salt and cracked black pepper.'
    ],
    chefTip: 'Strawberries picked at room temperature are naturally sweeter and release more juice than cold refrigerated berries.',
    tags: ['Breakfast & Brunch', 'Vegetarian', 'Quick (< 25 min)']
  },
  {
    title: 'Herb-Roasted Rainbow Roots with Sweet Maple Glaze',
    matchKeys: ['carrot', 'radish', 'potato', 'beet', 'root', 'onion'],
    prepTime: '12 mins',
    cookTime: '25 mins',
    servings: '4 servings',
    difficulty: 'Easy',
    description: 'Crispy-sweet roasted carrots and root vegetables tossed with garden rosemary, thyme, and maple drizzle.',
    pantryStaples: ['2 tbsp Olive oil', '1 tbsp Pure maple syrup', '1 tsp Coarse sea salt', 'Black pepper', 'Fresh thyme or rosemary sprigs'],
    instructions: [
      'Preheat oven to 400°F (200°C). Scrub farm roots clean and cut into uniform 2-inch spears.',
      'Toss vegetables on a rimmed sheet pan with olive oil, maple syrup, salt, and fresh herbs.',
      'Arrange in a single layer with space between pieces so the edges can crisp.',
      'Roast for 22-25 minutes, tossing once halfway through, until fork-tender with caramelized blistered edges.',
      'Taste and finish with an extra sprinkle of coarse sea salt before serving.'
    ],
    chefTip: 'Roasting at 400°F concentrates the natural sugars in root vegetables without burning the delicate maple glaze.',
    tags: ['Dinner', 'Vegan', 'Vegetarian', 'Gluten-Free']
  }
];

function generateFallbackRecipes(cartItems: any[], dietaryPreference?: string, mealType?: string) {
  const itemNames = cartItems.map(item => String(item.name || '').toLowerCase());

  // Score each recipe based on cart matching
  const scored = BUILTIN_RECIPES.map((recipe, index) => {
    let score = 0;
    const usedCartIngredients: string[] = [];

    cartItems.forEach(item => {
      const nameLower = String(item.name || '').toLowerCase();
      const match = recipe.matchKeys.some(key => nameLower.includes(key));
      if (match) {
        score += 3;
        usedCartIngredients.push(item.name);
      }
    });

    if (dietaryPreference && dietaryPreference !== 'All') {
      const matchDiet = recipe.tags.some(t => t.toLowerCase().includes(dietaryPreference.toLowerCase()));
      if (matchDiet) score += 2;
    }

    if (mealType && mealType !== 'Any') {
      const matchMeal = recipe.tags.some(t => t.toLowerCase().includes(mealType.toLowerCase()));
      if (matchMeal) score += 2;
    }

    return {
      id: `farm-rec-${index + 1}`,
      title: recipe.title,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      description: recipe.description,
      usedCartIngredients: usedCartIngredients.length > 0 ? Array.from(new Set(usedCartIngredients)) : [cartItems[0]?.name || 'Farm Fresh Produce'],
      pantryStaplesNeeded: recipe.pantryStaples,
      instructions: recipe.instructions,
      chefTip: recipe.chefTip,
      tags: recipe.tags,
      score
    };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map(({ score, ...recipe }) => recipe);
}

// Generate Recipes from Cart Produce (Gemini AI + Curated Fallback)
app.post('/api/recipes/from-cart', async (req, res) => {
  const { cartItems, dietaryPreference, mealType } = req.body;

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    res.status(400).json({ error: 'Please select at least one produce item in your cart to generate recipes.' });
    return;
  }

  const ai = getGenAI();

  if (ai) {
    try {
      const produceSummary = cartItems
        .map((item: any) => `- ${item.name} (${item.quantity} ${item.unit || 'unit'}${item.category ? `, Category: ${item.category}` : ''}${item.harvestNote ? `, Note: ${item.harvestNote}` : ''})`)
        .join('\n');

      const prompt = `You are the resident culinary chef at Willow Creek Organic Farm. A customer has selected the following freshly harvested produce items in their farm cart:
${produceSummary}

${dietaryPreference && dietaryPreference !== 'All' ? `Dietary Preference: ${dietaryPreference}` : ''}
${mealType && mealType !== 'Any' ? `Meal Type: ${mealType}` : ''}

Create 3 creative, seasonal, farm-to-table recipes that make these specific cart produce items the heroes of the dish.
Return a valid JSON array of 3 recipe objects with this exact structure:
[
  {
    "id": "recipe-1",
    "title": "Creative Dish Name",
    "prepTime": "10 mins",
    "cookTime": "15 mins",
    "servings": "3-4 servings",
    "difficulty": "Easy",
    "description": "Appetizing 1-2 sentence description of the dish highlighting the farm produce flavor.",
    "usedCartIngredients": ["Exact produce name from cart", "Another produce name from cart"],
    "pantryStaplesNeeded": ["Olive oil", "Garlic", "Kosher salt", "Pasta or rice"],
    "instructions": [
      "Step 1 with clear action",
      "Step 2 with clear action",
      "Step 3 with clear action",
      "Step 4 with clear action"
    ],
    "chefTip": "A specific practical cooking tip from a farmer/chef on handling or cooking these fresh ingredients.",
    "tags": ["Dinner", "Vegetarian", "Quick (< 25 min)"]
  }
]

Requirements:
- Only return the JSON array, no markdown formatting backticks if possible, or clean standard JSON.
- Every recipe MUST use at least one (preferably multiple) of the customer's cart produce items.
- Keep pantry staples realistic (salt, pepper, oil, butter, garlic, pasta, rice, flour, simple seasonings).
- Instructions should be easy to follow for home cooks.`;

      const modelsToTry = ['gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];
      let parsedRecipes: any = null;

      for (const modelName of modelsToTry) {
        try {
          const aiResponse = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: 'application/json'
            }
          });

          let responseText = aiResponse.text;
          if (responseText) {
            // Strip markdown code fences if model enclosed JSON
            responseText = responseText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
            const parsed = JSON.parse(responseText);
            if (Array.isArray(parsed) && parsed.length > 0) {
              parsedRecipes = parsed;
              break;
            }
          }
        } catch (err: any) {
          // If model is experiencing temporary capacity issues (503 / 429), try next model candidate
          const isCapacityOrBusy = 
            err?.status === 503 || 
            err?.status === 429 || 
            (typeof err?.message === 'string' && (err.message.includes('503') || err.message.includes('demand') || err.message.includes('UNAVAILABLE')));
          
          if (isCapacityOrBusy) {
            continue;
          }
          // For other errors, exit loop and use fallback recipes
          break;
        }
      }

      if (parsedRecipes && Array.isArray(parsedRecipes) && parsedRecipes.length > 0) {
        res.json({
          recipes: parsedRecipes,
          source: 'gemini',
          cartIngredientsCount: cartItems.length
        });
        return;
      }
    } catch {
      // Gracefully continue to curated farm kitchen fallback
    }
  }

  // Fallback to our curated farm recipe matching engine
  const fallback = generateFallbackRecipes(cartItems, dietaryPreference, mealType);
  res.json({
    recipes: fallback,
    source: 'farm_kitchen',
    cartIngredientsCount: cartItems.length
  });
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
