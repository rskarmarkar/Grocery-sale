import React, { useState, useEffect } from 'react';
import { 
  X, ChefHat, Sparkles, Clock, Flame, Utensils, CheckCircle2, 
  Copy, Check, Printer, RefreshCw, ShoppingBag, Leaf, BookOpen, AlertCircle
} from 'lucide-react';
import { CartItem, Recipe } from '../types';
import { fetchRecipesFromCart } from '../services/api';

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onOpenCart?: () => void;
}

const DIETARY_FILTERS = ['All', 'Quick (< 25 min)', 'Vegetarian', 'Vegan', 'Gluten-Free'];
const MEAL_TYPES = ['Any', 'Dinner', 'Breakfast & Brunch', 'Lunch / Light Salad'];

export const RecipeModal: React.FC<RecipeModalProps> = ({
  isOpen,
  onClose,
  cart,
  onOpenCart
}) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDiet, setSelectedDiet] = useState('All');
  const [selectedMeal, setSelectedMeal] = useState('Any');
  const [copiedRecipeId, setCopiedRecipeId] = useState<string | null>(null);
  const [activeRecipeTab, setActiveRecipeTab] = useState<number>(0);
  const [sourceBadge, setSourceBadge] = useState<string>('');

  // Load recipes whenever the modal opens or filters change
  const loadRecipes = async (diet = selectedDiet, meal = selectedMeal) => {
    if (cart.length === 0) {
      setRecipes([]);
      return;
    }

    setIsLoading(true);
    try {
      const result = await fetchRecipesFromCart(cart, diet, meal);
      setRecipes(result.recipes || []);
      setSourceBadge(
        result.source === 'gemini' 
          ? 'AI Farm Chef' 
          : 'Willow Creek Kitchen'
      );
      setActiveRecipeTab(0);
    } catch (err) {
      console.error('Failed to load recipes', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && cart.length > 0) {
      loadRecipes(selectedDiet, selectedMeal);
    }
  }, [isOpen, cart]);

  if (!isOpen) return null;

  const handleCopyRecipe = (recipe: Recipe) => {
    const text = `
=== ${recipe.title} ===
Willow Creek Farm Kitchen Recipe
Prep Time: ${recipe.prepTime} | Cook Time: ${recipe.cookTime} | Servings: ${recipe.servings} | Difficulty: ${recipe.difficulty}

${recipe.description}

FARM INGREDIENTS USED:
${recipe.usedCartIngredients.map(i => `• ${i}`).join('\n')}

PANTRY STAPLES NEEDED:
${recipe.pantryStaplesNeeded.map(i => `• ${i}`).join('\n')}

INSTRUCTIONS:
${recipe.instructions.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}

FARMER'S TIP:
${recipe.chefTip || 'Harvested fresh from Willow Creek Farm.'}
`.trim();

    navigator.clipboard.writeText(text).then(() => {
      setCopiedRecipeId(recipe.id);
      setTimeout(() => setCopiedRecipeId(null), 2500);
    }).catch(err => {
      console.error('Failed to copy', err);
    });
  };

  const handlePrintRecipe = (recipe: Recipe) => {
    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${recipe.title} - Willow Creek Farm</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: ink; line-height: 1.6; max-width: 700px; margin: 0 auto; }
                h1 { font-size: 26px; color: sprout-900; margin-bottom: 6px; }
                .meta { color: muted; font-size: 14px; margin-bottom: 20px; border-bottom: 2px solid border-soft; padding-bottom: 12px; }
                .meta span { margin-right: 18px; font-weight: 600; }
                h2 { font-size: 17px; color: sprout-900; margin-top: 24px; margin-bottom: 8px; border-bottom: 1px solid pale; padding-bottom: 4px; }
                ul, ol { padding-left: 22px; margin-bottom: 16px; }
                li { margin-bottom: 6px; font-size: 15px; }
                .tip { background: pale; border-left: 4px solid sprout-900; padding: 14px 18px; border-radius: 6px; margin-top: 24px; font-size: 14px; font-style: italic; }
                .footer { margin-top: 36px; padding-top: 14px; border-top: 1px dashed border; font-size: 12px; color: #888; text-align: center; }
              </style>
            </head>
            <body>
              <h1>${recipe.title}</h1>
              <div class="meta">
                <span>Prep: ${recipe.prepTime}</span>
                <span>Cook: ${recipe.cookTime}</span>
                <span>Servings: ${recipe.servings}</span>
                <span>Difficulty: ${recipe.difficulty}</span>
              </div>
              <p>${recipe.description}</p>
              
              <h2>Farm Basket Ingredients Used</h2>
              <ul>
                ${recipe.usedCartIngredients.map(i => `<li><strong>${i}</strong></li>`).join('')}
              </ul>

              <h2>Pantry Staples</h2>
              <ul>
                ${recipe.pantryStaplesNeeded.map(i => `<li>${i}</li>`).join('')}
              </ul>

              <h2>Instructions</h2>
              <ol>
                ${recipe.instructions.map(i => `<li>${i}</li>`).join('')}
              </ol>

              ${recipe.chefTip ? `<div class="tip"><strong>Farmer's Tip:</strong> ${recipe.chefTip}</div>` : ''}

              <div class="footer">
                Willow Creek Farm • Fresh Organic Harvest to Table
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 250);
        return;
      }
    } catch {
      // Fall back if popups/window.open is blocked by iframe sandbox
    }

    // Fallback: copy to clipboard
    handleCopyRecipe(recipe);
  };

  const activeRecipe = recipes[activeRecipeTab] || recipes[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative min-h-screen flex items-center justify-center p-3 sm:p-6">
        <div 
          id="recipe-modal-container"
          className="relative w-full max-w-4xl bg-cream rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header Banner */}
          <div className="p-5 sm:p-6 bg-radial from-sprout-900 to-sprout-900 text-white flex items-center justify-between shrink-0 relative overflow-hidden">
            {/* Soft decorative glow */}
            <div className="absolute right-0 top-0 w-64 h-64 bg-sprout-700 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

            <div className="relative z-10 flex items-center gap-3 sm:gap-4">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white shrink-0 border border-white/20">
                <ChefHat className="w-6 h-6 sm:w-7 sm:h-7 text-mint" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="font-display font-bold text-lg sm:text-2xl leading-tight text-white">
                    Farm Basket Recipes
                  </h2>
                  {sourceBadge && (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sprout-900 text-mint text-[11px] font-semibold border border-sprout-700">
                      <Sparkles className="w-3 h-3" />
                      {sourceBadge}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-pale">
                  Custom farm-to-table recipes created directly from the {cart.length} produce {cart.length === 1 ? 'item' : 'items'} in your cart.
                </p>
              </div>
            </div>

            <button
              id="close-recipe-modal-btn"
              onClick={onClose}
              className="relative z-10 w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Ingredients Chips Strip */}
          {cart.length > 0 && (
            <div className="px-5 py-3 bg-border-soft border-b border-border flex items-center gap-2 overflow-x-auto text-xs shrink-0">
              <span className="font-bold text-muted uppercase tracking-wider text-[10px] shrink-0 flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5 text-sprout-900" />
                Cart Produce:
              </span>
              <div className="flex items-center gap-1.5 flex-nowrap">
                {cart.map((item) => (
                  <span
                    key={item.produce.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white text-ink font-medium border border-border shrink-0 text-xs shadow-2xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-sprout-700"></span>
                    <span>{item.produce.name}</span>
                    <span className="text-[11px] text-muted font-normal">
                      ({item.quantity} {item.produce.unit})
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Filter & Refresh Controls */}
          {cart.length > 0 && (
            <div className="px-5 py-3 bg-cream border-b border-border-soft flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
                  Filter:
                </span>
                {DIETARY_FILTERS.map((diet) => (
                  <button
                    key={diet}
                    onClick={() => {
                      setSelectedDiet(diet);
                      loadRecipes(diet, selectedMeal);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      selectedDiet === diet
                        ? 'bg-sprout-900 text-white shadow-2xs'
                        : 'bg-border-soft hover:bg-border-soft text-muted'
                    }`}
                  >
                    {diet}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedMeal}
                  onChange={(e) => {
                    const meal = e.target.value;
                    setSelectedMeal(meal);
                    loadRecipes(selectedDiet, meal);
                  }}
                  className="px-3 py-1 rounded-xl bg-white border border-border text-xs text-ink font-medium focus:outline-none focus:ring-1 focus:ring-sprout-900"
                >
                  {MEAL_TYPES.map(m => (
                    <option key={m} value={m}>{m === 'Any' ? 'Any Meal Type' : m}</option>
                  ))}
                </select>

                <button
                  id="regenerate-recipes-btn"
                  onClick={() => loadRecipes(selectedDiet, selectedMeal)}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-border-soft text-sprout-900 border border-border text-xs font-bold transition-colors disabled:opacity-50"
                  title="Generate new recipe ideas"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Get Fresh Ideas</span>
                </button>
              </div>
            </div>
          )}

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6">
            {cart.length === 0 ? (
              <div className="py-12 px-4 text-center max-w-md mx-auto">
                <div className="w-20 h-20 rounded-full bg-border-soft text-muted flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
                </div>
                <h3 className="font-display font-bold text-xl text-ink mb-2">
                  Add Produce to Get Recipes
                </h3>
                <p className="text-xs sm:text-sm text-muted leading-relaxed mb-6">
                  Add some tomatoes, corn, greens, eggs, or berries to your cart first. Our farm chef will instantly generate custom recipes centered around what you picked!
                </p>
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenCart) onOpenCart();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-sprout-900 text-white font-bold text-xs sm:text-sm hover:bg-sprout-700 transition-all shadow-sm"
                >
                  Browse Today's Fresh Sale List
                </button>
              </div>
            ) : isLoading ? (
              <div className="py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-pale text-sprout-900 flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <ChefHat className="w-8 h-8" />
                </div>
                <h4 className="font-display font-bold text-lg text-ink mb-1">
                  Crafting Farm-to-Table Recipes...
                </h4>
                <p className="text-xs text-muted max-w-sm mx-auto">
                  Balancing the harvest notes, cooking times, and complementary pantry staples for your selected produce.
                </p>
              </div>
            ) : recipes.length === 0 ? (
              <div className="py-12 text-center max-w-md mx-auto">
                <AlertCircle className="w-12 h-12 text-terracotta mx-auto mb-3" />
                <h4 className="font-display font-bold text-lg text-ink mb-1">
                  No recipes matched your exact filter
                </h4>
                <p className="text-xs text-muted mb-4">
                  Try clearing the dietary or meal filter to see all recipes available for your cart ingredients.
                </p>
                <button
                  onClick={() => {
                    setSelectedDiet('All');
                    setSelectedMeal('Any');
                    loadRecipes('All', 'Any');
                  }}
                  className="px-4 py-2 rounded-xl bg-sprout-900 text-white text-xs font-semibold hover:bg-sprout-700"
                >
                  Reset Filters & Show All
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Recipe Selector Tabs (for multiple recipes) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-border-soft">
                  {recipes.map((r, idx) => (
                    <button
                      key={r.id || idx}
                      onClick={() => setActiveRecipeTab(idx)}
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
                        activeRecipeTab === idx
                          ? 'bg-sprout-900 text-white shadow-sm'
                          : 'bg-white hover:bg-pale text-muted border border-border-soft'
                      }`}
                    >
                      <Utensils className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[200px] sm:max-w-[240px]">{r.title}</span>
                    </button>
                  ))}
                </div>

                {/* Active Recipe Card */}
                {activeRecipe && (
                  <div className="bg-pale rounded-2xl border border-border p-5 sm:p-7 shadow-xs">
                    {/* Title & Metadata */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-border-soft">
                      <div className="space-y-2 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            activeRecipe.difficulty === 'Easy'
                              ? 'bg-pale text-sprout-700'
                              : activeRecipe.difficulty === 'Medium'
                              ? 'bg-honey text-warning'
                              : 'bg-error-soft text-error'
                          }`}>
                            {activeRecipe.difficulty}
                          </span>
                          {activeRecipe.tags?.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-md bg-cream text-muted text-[11px] border border-border-soft"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <h3 className="font-display font-bold text-xl sm:text-2xl text-ink leading-snug">
                          {activeRecipe.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-muted leading-relaxed">
                          {activeRecipe.description}
                        </p>
                      </div>

                      {/* Action buttons (Copy / Print) */}
                      <div className="flex items-center gap-2 self-start shrink-0">
                        <button
                          id={`copy-recipe-${activeRecipe.id}-btn`}
                          onClick={() => handleCopyRecipe(activeRecipe)}
                          className="px-3 py-1.5 rounded-xl bg-cream hover:bg-border-soft border border-border text-xs font-semibold text-muted flex items-center gap-1.5 transition-colors"
                          title="Copy recipe text"
                        >
                          {copiedRecipeId === activeRecipe.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-sprout-900" />
                              <span className="text-sprout-900">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <button
                          id={`print-recipe-${activeRecipe.id}-btn`}
                          onClick={() => handlePrintRecipe(activeRecipe)}
                          className="px-3 py-1.5 rounded-xl bg-cream hover:bg-border-soft border border-border text-xs font-semibold text-muted flex items-center gap-1.5 transition-colors"
                          title="Print recipe card"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-border-soft text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-border-soft flex items-center justify-center text-sprout-900">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-muted text-[10px] uppercase font-bold block">Prep Time</span>
                          <span className="font-semibold text-ink">{activeRecipe.prepTime}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-border-soft flex items-center justify-center text-warning">
                          <Flame className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-muted text-[10px] uppercase font-bold block">Cook Time</span>
                          <span className="font-semibold text-ink">{activeRecipe.cookTime}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-border-soft flex items-center justify-center text-sprout-900">
                          <Utensils className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-muted text-[10px] uppercase font-bold block">Servings</span>
                          <span className="font-semibold text-ink">{activeRecipe.servings}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-border-soft flex items-center justify-center text-sprout-900">
                          <Leaf className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-muted text-[10px] uppercase font-bold block">Cart Produce</span>
                          <span className="font-semibold text-ink">{activeRecipe.usedCartIngredients.length} used</span>
                        </div>
                      </div>
                    </div>

                    {/* Ingredients Split Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-5 border-b border-border-soft">
                      {/* From Your Cart */}
                      <div className="bg-pale p-4 rounded-xl border border-border-soft">
                        <div className="flex items-center gap-2 text-xs font-bold text-sprout-700 uppercase tracking-wider mb-2.5">
                          <CheckCircle2 className="w-4 h-4 text-sprout-900" />
                          <span>From Your Farm Cart</span>
                        </div>
                        <ul className="space-y-1.5">
                          {activeRecipe.usedCartIngredients.map((item, i) => (
                            <li key={i} className="text-xs sm:text-sm font-semibold text-sprout-900 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-sprout-900"></span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Pantry Staples Needed */}
                      <div className="bg-cream p-4 rounded-xl border border-border">
                        <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider mb-2.5">
                          <BookOpen className="w-4 h-4 text-muted" />
                          <span>Common Pantry Staples</span>
                        </div>
                        <ul className="space-y-1.5">
                          {activeRecipe.pantryStaplesNeeded.map((item, i) => (
                            <li key={i} className="text-xs sm:text-sm text-muted flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-border"></span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Step-by-Step Cooking Instructions */}
                    <div className="pt-5 space-y-4">
                      <h4 className="font-display font-bold text-base text-ink">
                        Preparation & Cooking Steps
                      </h4>

                      <div className="space-y-3">
                        {activeRecipe.instructions.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-sprout-900 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </div>
                            <p className="text-xs sm:text-sm text-ink leading-relaxed flex-1">
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Farmer's Seasonal Tip */}
                    {activeRecipe.chefTip && (
                      <div className="mt-6 p-4 rounded-xl bg-pale border border-border-soft flex items-start gap-3">
                        <Leaf className="w-4 h-4 text-clay shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-xs text-clay uppercase tracking-wider block mb-0.5">
                            Farmer & Chef's Tip
                          </span>
                          <p className="text-xs sm:text-sm text-clay leading-relaxed italic">
                            "{activeRecipe.chefTip}"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-4 sm:p-5 bg-pale border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-muted">
              <span>Have ingredients in your cart? </span>
              <strong className="text-ink">Totals update live</strong>
              <span> with instant cloud order sync.</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white hover:bg-border-soft border border-border text-xs font-bold text-muted"
              >
                Close
              </button>

              {onOpenCart && cart.length > 0 && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenCart();
                  }}
                  className="px-5 py-2 rounded-xl bg-sprout-900 hover:bg-sprout-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-mint" />
                  <span>View Cart & Order (${cart.reduce((s, i) => s + i.produce.price * i.quantity, 0).toFixed(2)})</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
