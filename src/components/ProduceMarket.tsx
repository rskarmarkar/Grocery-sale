import React, { useState } from 'react';
import { 
  Sprout, Sparkles, MapPin, Clock, ShieldCheck, ShoppingBag, 
  ArrowRight, Phone, Heart, CheckCircle2, Leaf, ChefHat, Utensils
} from 'lucide-react';
import { ProduceItem, CartItem } from '../types';
import { ProduceCard } from './ProduceCard';
import { ProduceFilter } from './ProduceFilter';

interface ProduceMarketProps {
  produceList: ProduceItem[];
  cart: CartItem[];
  onAddToCart: (produce: ProduceItem, quantity: number) => void;
  onUpdateCartQuantity: (produceId: string, delta: number) => void;
  onOpenCart: () => void;
  onOpenRecipes: () => void;
}

const CATEGORIES = ['All', 'Vegetable', 'Fruits', 'Herbs', 'Roots', 'Pantry & Eggs'];

export const ProduceMarket: React.FC<ProduceMarketProps> = ({
  produceList,
  cart,
  onAddToCart,
  onUpdateCartQuantity,
  onOpenCart,
  onOpenRecipes
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Cart total calculations
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.produce.price * item.quantity, 0);

  // Filter produce
  const filteredProduce = produceList.filter((item) => {
    if (selectedCategory !== 'All') {
      const matchCategory = item.category === selectedCategory || 
        (selectedCategory === 'Vegetable' && (item.category as string) === 'Vegetables');
      if (!matchCategory) return false;
    }
    if (inStockOnly && item.stock <= 0) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchHarvest = item.harvestNote?.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchHarvest) return false;
    }
    return item.status !== 'hidden';
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Organic Hero Section */}
      <section className="relative rounded-3xl bg-radial from-[#385b42] to-[#223929] text-white p-6 sm:p-10 lg:p-12 mb-10 overflow-hidden shadow-sm border border-[#3c6146]">
        {/* Soft background glow & organic leaf watermark */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-96 h-96 bg-[#4c7a59] rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#182a1e]/60 backdrop-blur-xs text-[#98e6b3] text-xs font-semibold mb-4 border border-[#487354]/60">
            <Leaf className="w-3.5 h-3.5" />
            <span>Today's Morning Harvest • Direct from Soil to Table</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight mb-4">
            Freshly Picked Organic Produce, Straight from Our Fields
          </h1>

          <p className="text-sm sm:text-base text-[#d8e6dc] leading-relaxed mb-6 max-w-2xl">
            Select what you want from our daily sale list below. Your cart calculates your total instantly, and your order is stored securely in our cloud system for same-day stand pickup or local delivery.
          </p>

          {/* Quick Farm Feature Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/15 text-xs text-[#e0ece3]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5 text-[#98e6b3]" />
              </div>
              <div>
                <span className="font-bold text-white block">Stand Pickup</span>
                <span className="text-[11px] text-[#b8d1c0]">Ready within 2 hours</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-[#98e6b3]" />
              </div>
              <div>
                <span className="font-bold text-white block">100% Organic Soil</span>
                <span className="text-[11px] text-[#b8d1c0]">Non-GMO & spray-free</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5 text-[#98e6b3]" />
              </div>
              <div>
                <span className="font-bold text-white block">Valley Stand</span>
                <span className="text-[11px] text-[#b8d1c0]">4800 Willow Creek Rd</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Produce Filter Controls */}
      <ProduceFilter
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        inStockOnly={inStockOnly}
        onToggleInStockOnly={() => setInStockOnly(!inStockOnly)}
        totalCount={filteredProduce.length}
      />

      {/* Cart Recipe Inspiration Banner */}
      {totalCartItems > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-radial from-[#edf6f0] to-[#e4eee7] border border-[#c4e0ce] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2d4734] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <ChefHat className="w-5 h-5 text-[#9dd6b1]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm text-[#1e3c27]">
                  Farm Recipes Ready for Your Cart
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#2d4734] text-white text-[10px] font-bold">
                  {cart.length} {cart.length === 1 ? 'produce item' : 'produce items'}
                </span>
              </div>
              <p className="text-xs text-[#486350] leading-snug">
                Discover personalized farm-to-table dishes featuring {cart.slice(0, 2).map(c => c.produce.name).join(', ')}{cart.length > 2 ? ` and ${cart.length - 2} more` : ''}.
              </p>
            </div>
          </div>
          <button
            id="market-banner-open-recipes-btn"
            onClick={onOpenRecipes}
            className="px-4 py-2 rounded-xl bg-[#2d4734] hover:bg-[#203627] text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#9dd6b1]" />
            <span>Get Recipes from Cart</span>
          </button>
        </div>
      )}

      {/* Produce Grid */}
      {filteredProduce.length === 0 ? (
        <div className="bg-[#fffefc] rounded-2xl border border-[#dfd7c9] p-12 text-center my-6">
          <div className="w-16 h-16 rounded-full bg-[#f1ede6] text-[#738075] flex items-center justify-center mx-auto mb-3">
            <Sprout className="w-8 h-8" />
          </div>
          <h3 className="font-display font-bold text-lg text-[#242b26] mb-1">
            No produce found
          </h3>
          <p className="text-xs sm:text-sm text-[#6e7870] max-w-sm mx-auto mb-4">
            We couldn't find any produce matching your current search or category filter.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
              setInStockOnly(false);
            }}
            className="px-4 py-2 rounded-xl bg-[#2d4734] text-white text-xs font-semibold hover:bg-[#223929]"
          >
            Clear Filters & View All Harvest
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProduce.map((produce) => {
            const cartItem = cart.find((item) => item.produce.id === produce.id);
            return (
              <ProduceCard
                key={produce.id}
                produce={produce}
                cartItem={cartItem}
                onAddToCart={onAddToCart}
                onUpdateCartQuantity={onUpdateCartQuantity}
              />
            );
          })}
        </div>
      )}

      {/* STICKY BOTTOM INSTANT CART SUMMARY BAR FOR SHOPPERS */}
      {totalCartItems > 0 && (
        <div className="sticky bottom-6 z-20 mt-8">
          <div className="max-w-2xl mx-auto bg-[#2d4734] text-white p-4 rounded-2xl shadow-xl border border-[#3e6047] flex items-center justify-between gap-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3f6349] flex items-center justify-center text-white shrink-0">
                <ShoppingBag className="w-5 h-5 text-[#9dd6b1]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#c7dfd0] uppercase tracking-wider">
                    Instant Cart Total
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#c47d4e] text-[10px] font-bold text-white">
                    {totalCartItems} {totalCartItems === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <div className="font-display font-bold text-xl text-white">
                  ${cartSubtotal.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                id="sticky-recipes-btn"
                onClick={onOpenRecipes}
                className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-[#3f6349] hover:bg-[#4d7858] active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm border border-[#52805f]"
                title="Get recipes from your selected produce"
              >
                <ChefHat className="w-4 h-4 text-[#9dd6b1]" />
                <span>Recipes</span>
              </button>

              <button
                id="sticky-checkout-btn"
                onClick={onOpenCart}
                className="px-4 sm:px-5 py-2.5 rounded-xl bg-white hover:bg-[#f2efe9] active:scale-95 text-[#2d4734] font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm"
              >
                <span>View Cart & Order</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Farm Stand Footer / Info */}
      <footer className="mt-16 pt-12 border-t border-[#dfd7c9] pb-12 text-xs text-[#6e7870]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 text-[#242b26] font-display font-bold text-base mb-2">
              <Sprout className="w-5 h-5 text-[#2d4734]" />
              <span>Willow Creek Organic Farm</span>
            </div>
            <p className="text-[#556358] leading-relaxed">
              Family-owned sustainable agriculture. All produce is pesticide-free, harvested at peak sweetness, and sold directly to our community neighbors.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-[#242b26] uppercase tracking-wider text-[11px] mb-2">
              Farm Stand Hours & Pickup
            </h4>
            <p className="space-y-1 text-[#556358]">
              <span className="block">Monday – Friday: 10:00 AM – 6:00 PM</span>
              <span className="block">Saturday – Sunday: 8:00 AM – 4:00 PM</span>
              <span className="block text-[#8a5d3b] font-medium mt-1">Local deliveries leave daily at 5:00 PM</span>
            </p>
          </div>

          <div>
            <h4 className="font-bold text-[#242b26] uppercase tracking-wider text-[11px] mb-2">
              Instant Total & Cloud Guarantee
            </h4>
            <p className="text-[#556358] leading-relaxed">
              Cart totals are calculated live without hidden fees. Orders are synchronized immediately to our cloud inventory to ensure fresh packing.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-[#ede7dc] text-center text-[#8d9890]">
          © {new Date().getFullYear()} Willow Creek Farm • Fresh Harvest Direct to Consumer
        </div>
      </footer>
    </div>
  );
};
