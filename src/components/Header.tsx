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
    <header className="sticky top-0 z-30 bg-cream/95 backdrop-blur-md border-b border-border-soft">
      {/* Organic top badge bar */}
      <div className="bg-sprout-900 text-pale px-4 py-1.5 text-xs font-medium tracking-wide">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-sprout-600 animate-pulse"></span>
            <span>Harvest Season Open • Picked Fresh Daily on Willow Creek Farm</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-border-soft text-xs">
            <span className="flex items-center gap-1">
              <CloudCheck className="w-3.5 h-3.5 text-mint" />
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
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-sprout-900 text-cream flex items-center justify-center shadow-sm border border-sprout-700 group-hover:scale-105 transition-transform duration-200 shrink-0">
            <Sprout className="w-5 h-5 sm:w-7 sm:h-7 text-mint" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-base sm:text-2xl font-bold tracking-tight text-ink whitespace-nowrap">
                Willow Creek Farm
              </h1>
              <span className="hidden md:inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-pale text-sprout-700 border border-success-soft">
                100% Organic
              </span>
            </div>
            <p className="hidden sm:flex text-xs text-muted items-center gap-1 font-medium">
              <span>Fresh Farm Stand & Sale List</span>
              <span className="text-border">•</span>
              <span className="text-terracotta font-semibold">Local Harvest</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mode Switcher Tabs */}
          <div className="bg-pale p-1 rounded-xl flex items-center border border-border">
            <button
              id="view-mode-market-btn"
              onClick={() => onViewChange('market')}
              title="Produce Market"
              className={`flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                viewMode === 'market'
                  ? 'bg-sprout-900 text-cream shadow-sm'
                  : 'text-muted hover:text-ink'
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
                  ? 'bg-clay text-cream shadow-sm'
                  : 'text-muted hover:text-ink'
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
                  ? 'bg-pale text-sprout-900 border-border-soft hover:bg-pale shadow-2xs'
                  : 'bg-cream text-muted border-border-soft hover:text-ink'
              }`}
              title={totalCartItems > 0 ? `Get recipes from ${totalCartItems} cart items` : 'View farm recipes'}
            >
              <ChefHat className="w-4 h-4 text-sprout-900" />
              <span className="hidden sm:inline">Recipes</span>
              {totalCartItems > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-sprout-900 text-white text-[10px] font-bold">
                  {cart.length}
                </span>
              )}
            </button>
          )}

          {/* Instant Cart Button */}
          <button
            id="open-cart-drawer-btn"
            onClick={onOpenCart}
            className="relative flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-sprout-900 hover:bg-sprout-700 active:scale-95 text-cream shadow-sm transition-all duration-200 border border-sprout-700"
            title="Open Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5 text-mint" />
            <div className="flex flex-col items-start leading-tight">
              <span className="hidden sm:block text-[11px] font-medium text-border-soft uppercase tracking-wider">
                Instant Total
              </span>
              <span className="text-sm font-bold tracking-tight text-white">
                ${cartSubtotal.toFixed(2)}
              </span>
            </div>

            {totalCartItems > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-terracotta text-white text-xs font-bold flex items-center justify-center shadow-sm">
                {totalCartItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
