import React, { useState } from 'react';
import { Plus, Minus, Check, AlertCircle, Sparkles, Leaf } from 'lucide-react';
import { ProduceItem, CartItem } from '../types';

interface ProduceCardProps {
  produce: ProduceItem;
  cartItem?: CartItem;
  onAddToCart: (produce: ProduceItem, quantity: number) => void;
  onUpdateCartQuantity: (produceId: string, delta: number) => void;
}

export const ProduceCard: React.FC<ProduceCardProps> = ({
  produce,
  cartItem,
  onAddToCart,
  onUpdateCartQuantity
}) => {
  const [justAdded, setJustAdded] = useState(false);
  const isSoldOut = produce.stock <= 0 || produce.status === 'sold_out';
  const isLowStock = produce.stock > 0 && produce.stock <= 10;
  const currentCartQty = cartItem?.quantity || 0;
  const maxCanAdd = Math.max(0, produce.stock - currentCartQty);

  const handleAdd = () => {
    if (isSoldOut || maxCanAdd <= 0) return;
    onAddToCart(produce, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 900);
  };

  return (
    <div 
      id={`produce-card-${produce.id}`}
      className={`group relative flex flex-col bg-[#fffefc] rounded-2xl border transition-all duration-300 overflow-hidden shadow-xs hover:shadow-md ${
        isSoldOut 
          ? 'border-[#e0dcd3] opacity-75' 
          : 'border-[#dfd8cc] hover:border-[#7c9e85]'
      }`}
    >
      {/* Produce Image with Organic Badges */}
      <div className="relative w-full aspect-4/3 overflow-hidden bg-[#ebe6dc]">
        {produce.imageUrl ? (
          <img
            src={produce.imageUrl}
            alt={produce.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#e4dfd5] text-[#556358]">
            <Leaf className="w-12 h-12 stroke-[1.5]" />
          </div>
        )}

        {/* Gradient overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>

        {/* Badges Top Left */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
          {produce.organic && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#2d4734]/90 backdrop-blur-xs text-[#e8f5ec] shadow-xs flex items-center gap-1 border border-[#3e5f48]/50">
              <Leaf className="w-3 h-3 text-[#92d6a7]" />
              <span>Organic</span>
            </span>
          )}

          {produce.badge && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#8a5d3b]/90 backdrop-blur-xs text-[#fff5ee] shadow-xs border border-[#a6744d]/50">
              {produce.badge}
            </span>
          )}
        </div>

        {/* Stock Status Top Right */}
        <div className="absolute top-3 right-3">
          {isSoldOut ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#504642]/90 text-[#f5ebe6] backdrop-blur-xs shadow-xs">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#c47d4e]/95 text-white backdrop-blur-xs shadow-xs animate-pulse">
              Only {produce.stock} {produce.unit}s left!
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/40 text-white backdrop-blur-xs">
              {produce.stock} {produce.unit}s in stock
            </span>
          )}
        </div>

        {/* Harvest Tag Bottom Left */}
        {produce.harvestNote && (
          <div className="absolute bottom-2.5 left-3 right-3">
            <p className="text-[12px] font-medium text-white/95 drop-shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#f2e69d] shrink-0" />
              <span className="truncate">{produce.harvestNote}</span>
            </p>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6d796f]">
              {produce.category}
            </span>
            <div className="text-right">
              <span className="text-xl font-bold font-display text-[#242b26]">
                ${produce.price.toFixed(2)}
              </span>
              <span className="text-xs text-[#6e7870] font-medium ml-1">
                / {produce.unit}
              </span>
            </div>
          </div>

          <h3 className="font-display font-bold text-lg text-[#242b26] leading-snug mb-2 group-hover:text-[#2d4734] transition-colors">
            {produce.name}
          </h3>

          <p className="text-xs sm:text-[13px] text-[#556358] line-clamp-2 leading-relaxed mb-4">
            {produce.description}
          </p>
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t border-[#f0ece4] mt-auto">
          {isSoldOut ? (
            <button
              disabled
              className="w-full py-2.5 rounded-xl bg-[#ece7df] text-[#8c948e] font-semibold text-xs sm:text-sm cursor-not-allowed text-center"
            >
              Out of Harvest Stock
            </button>
          ) : currentCartQty > 0 ? (
            <div className="flex items-center justify-between bg-[#f2f7f3] border border-[#cbdccd] rounded-xl p-1.5">
              <div className="flex items-center gap-1">
                <button
                  id={`decrement-cart-${produce.id}`}
                  onClick={() => onUpdateCartQuantity(produce.id, -1)}
                  className="w-8 h-8 rounded-lg bg-white hover:bg-[#e2ede4] active:scale-95 text-[#2d4734] font-bold flex items-center justify-center transition-colors shadow-2xs border border-[#cfdfd2]"
                  title="Remove one"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="px-3 text-center">
                  <span className="text-sm font-bold text-[#2d4734]">
                    {currentCartQty} {produce.unit}
                  </span>
                  <p className="text-[10px] text-[#5c7a65] font-medium leading-none">
                    ${(produce.price * currentCartQty).toFixed(2)}
                  </p>
                </div>
                <button
                  id={`increment-cart-${produce.id}`}
                  onClick={() => onUpdateCartQuantity(produce.id, 1)}
                  disabled={currentCartQty >= produce.stock}
                  className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center transition-colors shadow-2xs ${
                    currentCartQty >= produce.stock
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-[#2d4734] hover:bg-[#223929] active:scale-95 text-white'
                  }`}
                  title={currentCartQty >= produce.stock ? 'Max available reached' : 'Add one more'}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="pr-2 text-right">
                <span className="text-[11px] font-semibold text-[#3b6348] block">
                  In Cart
                </span>
                {currentCartQty >= produce.stock && (
                  <span className="text-[10px] text-[#b86228] font-bold block">
                    Max stock
                  </span>
                )}
              </div>
            </div>
          ) : (
            <button
              id={`add-to-cart-btn-${produce.id}`}
              onClick={handleAdd}
              className="w-full py-2.5 px-4 rounded-xl bg-[#2d4734] hover:bg-[#233a2a] active:scale-98 text-white text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-xs border border-[#3b5d44]"
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4 text-[#8fe0a8]" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-[#a3d9b5]" />
                  <span>Add to Cart • ${(produce.price).toFixed(2)}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
