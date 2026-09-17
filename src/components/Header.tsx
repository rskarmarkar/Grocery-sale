import React from 'react';
import { Sprout, ShoppingBag, LayoutDashboard, Store, CloudCheck, Sparkles, ChefHat } from 'lucide-react';
import { ViewMode, CartItem } from '../types';

interface HeaderProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  cart: CartItem[];
  onOpenCart: () => void;
  onOpenRecipes?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onViewChange,
  cart,
  onOpenCart,
  onOpenRecipes
}) => {
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.produce.price * item.quantity, 0);

  return (
    <header className="sticky top-0 z-30 bg-[#faf8f4]/95 backdrop-blur-md border-b border-[#e2dcce]">
      {/* Organic top badge bar */}
      <div className="bg-[#2d4734] text-[#e8f0eb] px-4 py-1.5 text-xs font-medium tracking-wide">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#82c99b] animate-pulse"></span>
            <span>Harvest Season Open • Picked Fresh Daily on Willow Creek Farm</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[#cfdfd4] text-xs">
            <span className="flex items-center gap-1">
              <CloudCheck className="w-3.5 h-3.5 text-[#a1d7b3]" />
              Cloud Inventory & Order Sync Active
            </span>
            <span>•</span>
            <span>Same-Day Farm Stand Pickup</span>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:h-20 sm:py-0 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        {/* Farm Logo & Title */}
        <div
          id="farm-brand-logo"
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0"
          onClick={() => onViewChange('market')}
        >
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-[#2d4734] text-[#faf8f4] flex items-center justify-center shadow-sm border border-[#3e5e47] group-hover:scale-105 transition-transform duration-200 shrink-0">
            <Sprout className="w-5 h-5 sm:w-7 sm:h-7 text-[#9dd6b1]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-base sm:text-2xl font-bold tracking-tight text-[#242b26] whitespace-nowrap">
                Willow Creek Farm
              </h1>
              <span className="hidden md:inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#e8efe9] text-[#2c5339] border border-[#cbdccd]">
                100% Organic
              </span>
            </div>
            <p className="hidden sm:flex text-xs text-[#6e7870] items-center gap-1 font-medium">
              <span>Fresh Farm Stand & Sale List</span>
              <span className="text-[#a49a88]">•</span>
              <span className="text-[#8c5a3c] font-semibold">Local Harvest</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mode Switcher Tabs */}
          <div className="bg-[#ede8de] p-1 rounded-xl flex items-center border border-[#dfd7c9]">
            <button
              id="view-mode-market-btn"
              onClick={() => onViewChange('market')}
              title="Produce Market"
              className={`flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                viewMode === 'market'
                  ? 'bg-[#2d4734] text-[#faf8f4] shadow-sm'
                  : 'text-[#566057] hover:text-[#242b26]'
              }`}
            >
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">Produce Market</span>
            </button>
            <button
              id="view-mode-farmer-btn"
              onClick={() => onViewChange('farmer')}
              title="Farmer Manager"
              className={`flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                viewMode === 'farmer'
                  ? 'bg-[#6d4c41] text-[#faf8f4] shadow-sm'
                  : 'text-[#566057] hover:text-[#242b26]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Farmer Manager</span>
              <span className="hidden md:inline text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/20 ml-1">
                Sale List
              </span>
            </button>
          </div>

          {/* Recipes from Cart Button */}
          {onOpenRecipes && (
            <button
              id="header-open-recipes-btn"
              onClick={onOpenRecipes}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border ${
                totalCartItems > 0
                  ? 'bg-[#eaf4ed] text-[#22482c] border-[#bddcc4] hover:bg-[#d8edd9] shadow-2xs'
                  : 'bg-[#faf8f4] text-[#606d63] border-[#e2dcce] hover:text-[#242b26]'
              }`}
              title={totalCartItems > 0 ? `Get recipes from ${totalCartItems} cart items` : 'View farm recipes'}
            >
              <ChefHat className="w-4 h-4 text-[#2d4734]" />
              <span className="hidden sm:inline">Recipes</span>
              {totalCartItems > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#2d4734] text-white text-[10px] font-bold">
                  {cart.length}
                </span>
              )}
            </button>
          )}

          {/* Instant Cart Button */}
          <button
            id="open-cart-drawer-btn"
            onClick={onOpenCart}
            className="relative flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#2d4734] hover:bg-[#233829] active:scale-95 text-[#faf8f4] shadow-sm transition-all duration-200 border border-[#3c5d45]"
            title="Open Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5 text-[#9dd6b1]" />
            <div className="flex flex-col items-start leading-tight">
              <span className="hidden sm:block text-[11px] font-medium text-[#cbe0d3] uppercase tracking-wider">
                Instant Total
              </span>
              <span className="text-sm font-bold tracking-tight text-white">
                ${cartSubtotal.toFixed(2)}
              </span>
            </div>

            {totalCartItems > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-[#c47d4e] text-white text-xs font-bold flex items-center justify-center shadow-sm">
                {totalCartItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
