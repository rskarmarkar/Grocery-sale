import React from 'react';
import { Search, SlidersHorizontal, Leaf, Check } from 'lucide-react';

interface ProduceFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  inStockOnly: boolean;
  onToggleInStockOnly: () => void;
  totalCount: number;
}

export const ProduceFilter: React.FC<ProduceFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  inStockOnly,
  onToggleInStockOnly,
  totalCount
}) => {
  return (
    <div className="bg-[#fffefc] rounded-2xl border border-[#dfd7c9] p-4 sm:p-5 shadow-xs mb-8">
      {/* Top row: Search & Quick In-Stock Toggle */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between pb-4 border-b border-[#f1ece2]">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d887f]" />
          <input
            id="produce-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tomatoes, kale, apples, basil..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#faf8f4] border border-[#d8d1c3] text-sm text-[#242b26] placeholder-[#8a958c] focus:outline-none focus:ring-2 focus:ring-[#2d4734] focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7d887f] hover:text-[#242b26] font-semibold"
            >
              Clear
            </button>
          )}
        </div>

        {/* In-Stock Toggle */}
        <div className="flex items-center justify-between sm:justify-end gap-4">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              id="filter-in-stock-only-toggle"
              type="checkbox"
              checked={inStockOnly}
              onChange={onToggleInStockOnly}
              className="sr-only"
            />
            <div
              className={`w-9 h-5 rounded-full transition-colors relative ${
                inStockOnly ? 'bg-[#2d4734]' : 'bg-[#d5cdc0]'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-transform ${
                  inStockOnly ? 'translate-x-4.5' : 'translate-x-1'
                }`}
              />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-[#48534a]">
              In Stock Only
            </span>
          </label>

          <span className="text-xs text-[#7a867c] font-medium hidden sm:inline">
            {totalCount} {totalCount === 1 ? 'item' : 'items'} available
          </span>
        </div>
      </div>

      {/* Bottom row: Category Chips */}
      <div className="pt-3.5 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              id={`filter-category-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              onClick={() => onSelectCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap shrink-0 flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-[#2d4734] text-white border-[#2d4734] shadow-xs'
                  : 'bg-[#faf8f4] text-[#556358] border-[#dfd7c9] hover:bg-[#ede7dc] hover:text-[#242b26]'
              }`}
            >
              {cat === 'All' && <Leaf className="w-3.5 h-3.5" />}
              <span>{cat}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
