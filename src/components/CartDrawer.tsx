import React, { useState } from 'react';
import { 
  X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, 
  MapPin, Clock, ShieldCheck, Truck, Store, AlertCircle, CheckCircle2,
  ChefHat, Sparkles, Utensils
} from 'lucide-react';
import { CartItem, Order, ProduceItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (produceId: string, delta: number) => void;
  onRemoveItem: (produceId: string) => void;
  onClearCart: () => void;
  onOrderPlaced: (order: Order, updatedProduce: ProduceItem[]) => void;
  onOpenRecipes?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderPlaced,
  onOpenRecipes
}) => {
  // Checkout form states
  const [step, setStep] = useState<'review' | 'checkout'>('review');
  const [fulfillmentType, setFulfillmentType] = useState<'pickup' | 'delivery'>('pickup');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [pickupTime, setPickupTime] = useState('Today (After 2:00 PM)');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Instant Totals Calculation
  const subtotal = cart.reduce((sum, item) => sum + item.produce.price * item.quantity, 0);
  const deliveryFee = fulfillmentType === 'delivery' ? 5.00 : 0.00;
  const tax = 0.00; // Raw agricultural produce is exempt
  const instantTotal = subtotal + deliveryFee + tax;
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage('Please provide your name for the order.');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMessage('Please provide a phone number for pickup or delivery updates.');
      return;
    }
    if (fulfillmentType === 'delivery' && !deliveryAddress.trim()) {
      setErrorMessage('Please provide your local delivery address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail,
          fulfillmentType,
          pickupTime: fulfillmentType === 'pickup' ? pickupTime : undefined,
          deliveryAddress: fulfillmentType === 'delivery' ? deliveryAddress : undefined,
          notes,
          items: cart.map(item => ({
            produceId: item.produce.id,
            quantity: item.quantity
          }))
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to place farm order');
      }

      // Success
      onOrderPlaced(data.order, data.produce);
      onClearCart();
      setStep('review');
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while storing your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-full max-w-md bg-[#faf8f4] shadow-2xl flex flex-col border-l border-[#dfd7c9]">
          
          {/* Drawer Header */}
          <div className="p-5 bg-[#2d4734] text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-[#9dd6b1]" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg leading-tight">
                  {step === 'review' ? 'Produce Cart' : 'Checkout & Order'}
                </h2>
                <p className="text-xs text-[#c6ded0]">
                  {cart.length === 0 
                    ? 'Your harvest basket is empty' 
                    : `${totalItemCount} ${totalItemCount === 1 ? 'item' : 'items'} selected`}
                </p>
              </div>
            </div>

            <button
              id="close-cart-drawer-btn"
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 rounded-full bg-[#ede6dc] text-[#6d796f] flex items-center justify-center mb-4">
                  <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
                </div>
                <h3 className="font-display font-bold text-xl text-[#242b26] mb-2">
                  Your Basket is Empty
                </h3>
                <p className="text-sm text-[#667268] max-w-xs mb-6">
                  Select freshly harvested produce from our farm sale list to place your order.
                </p>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-[#2d4734] text-white font-semibold text-sm hover:bg-[#233829] transition-colors"
                >
                  Browse Today's Produce
                </button>
              </div>
            ) : step === 'review' ? (
              <div className="space-y-4">
                {/* Fulfillment Selector */}
                <div className="bg-[#fffefc] p-3.5 rounded-xl border border-[#dfd7c9]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#647167] block mb-2">
                    Fulfillment Preference
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="select-pickup-option-btn"
                      type="button"
                      onClick={() => setFulfillmentType('pickup')}
                      className={`p-2.5 rounded-lg border text-left flex items-start gap-2.5 transition-all ${
                        fulfillmentType === 'pickup'
                          ? 'border-[#2d4734] bg-[#f0f6f2] text-[#2d4734]'
                          : 'border-[#dfd7c9] bg-[#faf8f4] text-[#556358]'
                      }`}
                    >
                      <Store className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-xs font-bold block">Farm Stand Pickup</span>
                        <span className="text-[11px] text-[#5b7a65]">Free • Ready today</span>
                      </div>
                    </button>

                    <button
                      id="select-delivery-option-btn"
                      type="button"
                      onClick={() => setFulfillmentType('delivery')}
                      className={`p-2.5 rounded-lg border text-left flex items-start gap-2.5 transition-all ${
                        fulfillmentType === 'delivery'
                          ? 'border-[#2d4734] bg-[#f0f6f2] text-[#2d4734]'
                          : 'border-[#dfd7c9] bg-[#faf8f4] text-[#556358]'
                      }`}
                    >
                      <Truck className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-xs font-bold block">Local Delivery</span>
                        <span className="text-[11px] text-[#8a5d3b]">+$5.00 delivery fee</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Recipe Inspiration from Selected Produce */}
                {onOpenRecipes && (
                  <div className="bg-radial from-[#edf6f0] to-[#e4eee7] p-3.5 rounded-xl border border-[#c4ded0] flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#2d4734] text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <ChefHat className="w-4 h-4 text-[#9dd6b1]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#1e3c27]">Farm Basket Recipes</span>
                          <span className="px-1.5 py-0.2 bg-[#2d4734] text-white rounded text-[9px] font-bold">
                            {cart.length} {cart.length === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#4d6655] leading-tight">
                          Custom recipes tailored from your cart ingredients.
                        </p>
                      </div>
                    </div>
                    <button
                      id="drawer-open-recipes-btn"
                      type="button"
                      onClick={onOpenRecipes}
                      className="px-3 py-1.5 rounded-lg bg-[#2d4734] hover:bg-[#203627] text-white text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#9dd6b1]" />
                      <span>Recipes</span>
                    </button>
                  </div>
                )}

                {/* Produce Line Items */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#647167]">
                    Selected Produce ({cart.length})
                  </span>
                  {cart.map(({ produce, quantity }) => {
                    const itemSubtotal = produce.price * quantity;
                    const isMaxStock = quantity >= produce.stock;

                    return (
                      <div
                        key={produce.id}
                        id={`cart-item-${produce.id}`}
                        className="bg-[#fffefc] p-3.5 rounded-xl border border-[#dfd7c9] flex items-center gap-3.5 shadow-2xs"
                      >
                        {/* Thumbnail */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#e4ded5] shrink-0 border border-[#dfd7c9]">
                          {produce.imageUrl ? (
                            <img
                              src={produce.imageUrl}
                              alt={produce.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-[#6e7870]">
                              Farm
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-[#242b26] truncate">
                            {produce.name}
                          </h4>
                          <p className="text-xs text-[#6e7870]">
                            ${produce.price.toFixed(2)} / {produce.unit}
                          </p>

                          {/* Stepper */}
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center border border-[#d6cec0] rounded-lg bg-[#faf8f4]">
                              <button
                                onClick={() => onUpdateQuantity(produce.id, -1)}
                                className="w-7 h-7 flex items-center justify-center text-[#2d4734] hover:bg-[#ebe5d9] transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-9 text-center text-xs font-bold text-[#242b26]">
                                {quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(produce.id, 1)}
                                disabled={isMaxStock}
                                className={`w-7 h-7 flex items-center justify-center transition-colors ${
                                  isMaxStock 
                                    ? 'text-gray-300 cursor-not-allowed' 
                                    : 'text-[#2d4734] hover:bg-[#ebe5d9]'
                                }`}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <span className="text-xs text-[#526055] font-medium">
                              {produce.unit}s
                            </span>
                          </div>
                        </div>

                        {/* Subtotal & Delete */}
                        <div className="text-right flex flex-col justify-between items-end h-16">
                          <button
                            onClick={() => onRemoveItem(produce.id)}
                            className="text-[#968a7a] hover:text-[#a83232] transition-colors p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div>
                            <span className="font-display font-bold text-sm text-[#242b26] block">
                              ${itemSubtotal.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Checkout Form */
              <form id="farm-order-form" onSubmit={handleSubmitOrder} className="space-y-4">
                <div className="bg-[#fffefc] p-4 rounded-xl border border-[#dfd7c9] space-y-3.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#647167] block">
                    Customer Information
                  </span>

                  <div>
                    <label className="block text-xs font-semibold text-[#48534a] mb-1">
                      Full Name *
                    </label>
                    <input
                      id="customer-name-input"
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g., Sarah Miller"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#faf8f4] border border-[#d6cec0] text-sm text-[#242b26] focus:outline-none focus:ring-2 focus:ring-[#2d4734]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#48534a] mb-1">
                      Phone Number * (for harvest status text)
                    </label>
                    <input
                      id="customer-phone-input"
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="(555) 000-0000"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#faf8f4] border border-[#d6cec0] text-sm text-[#242b26] focus:outline-none focus:ring-2 focus:ring-[#2d4734]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#48534a] mb-1">
                      Email Address (optional)
                    </label>
                    <input
                      id="customer-email-input"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="sarah@example.com"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#faf8f4] border border-[#d6cec0] text-sm text-[#242b26] focus:outline-none focus:ring-2 focus:ring-[#2d4734]"
                    />
                  </div>
                </div>

                {/* Fulfillment Details */}
                <div className="bg-[#fffefc] p-4 rounded-xl border border-[#dfd7c9] space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#647167] block">
                    {fulfillmentType === 'pickup' ? 'Pickup Details' : 'Delivery Address'}
                  </span>

                  {fulfillmentType === 'pickup' ? (
                    <div>
                      <label className="block text-xs font-semibold text-[#48534a] mb-1">
                        Preferred Pickup Window
                      </label>
                      <select
                        id="pickup-time-select"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#faf8f4] border border-[#d6cec0] text-sm text-[#242b26] focus:outline-none focus:ring-2 focus:ring-[#2d4734]"
                      >
                        <option value="Today (2:00 PM - 5:00 PM)">Today (2:00 PM - 5:00 PM)</option>
                        <option value="Tomorrow Morning (9:00 AM - 12:00 PM)">Tomorrow Morning (9:00 AM - 12:00 PM)</option>
                        <option value="Tomorrow Afternoon (1:00 PM - 4:00 PM)">Tomorrow Afternoon (1:00 PM - 4:00 PM)</option>
                        <option value="Weekend Stand Pickup (Saturday 8:00 AM - 1:00 PM)">Weekend Stand Pickup (Saturday 8:00 AM - 1:00 PM)</option>
                      </select>
                      <p className="text-[11px] text-[#6d7b70] mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#2d4734]" />
                        Stand location: 4800 Willow Creek Rd, Valley Stand
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-[#48534a] mb-1">
                        Local Delivery Address *
                      </label>
                      <textarea
                        id="delivery-address-input"
                        rows={2}
                        required
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Street address, unit/apt, city, zip code"
                        className="w-full px-3.5 py-2 rounded-lg bg-[#faf8f4] border border-[#d6cec0] text-sm text-[#242b26] focus:outline-none focus:ring-2 focus:ring-[#2d4734]"
                      />
                      <p className="text-[11px] text-[#8a5d3b] mt-1">
                        Local deliveries dispatched after evening harvest.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-[#48534a] mb-1">
                      Notes for Farmer (optional)
                    </label>
                    <input
                      id="order-notes-input"
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g., Leave on back porch, pack ripe berries"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#faf8f4] border border-[#d6cec0] text-sm text-[#242b26] focus:outline-none focus:ring-2 focus:ring-[#2d4734]"
                    />
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-lg bg-[#fcf2ed] border border-[#e8c8b8] text-xs text-[#a34426] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </form>
            )}
          </div>

          {/* Drawer Footer: INSTANT TOTAL BREAKDOWN */}
          {cart.length > 0 && (
            <div className="p-5 bg-[#fffefc] border-t border-[#dfd7c9] shadow-lg">
              {/* Cost calculations */}
              <div className="space-y-1.5 pb-4 border-b border-[#f1ece2] text-xs text-[#556358]">
                <div className="flex justify-between">
                  <span>Produce Subtotal ({totalItemCount} units)</span>
                  <span className="font-semibold text-[#242b26]">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>
                    {fulfillmentType === 'delivery' ? 'Local Farm Delivery' : 'Farm Stand Pickup'}
                  </span>
                  <span className="font-semibold text-[#242b26]">
                    {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Fresh Agricultural Sales Tax</span>
                  <span className="text-[#3b6348] font-medium">$0.00 (Tax Exempt)</span>
                </div>
              </div>

              {/* INSTANT TOTAL PROMINENT DISPLAY */}
              <div className="pt-3 pb-4 flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6d7a70] block">
                    Instant Cart Total
                  </span>
                  <span className="text-[11px] text-[#8a5d3b] font-medium">
                    Stored & tracked in cloud
                  </span>
                </div>
                <div className="text-right">
                  <span 
                    id="cart-instant-total-amount"
                    className="font-display text-2xl sm:text-3xl font-bold text-[#2d4734]"
                  >
                    ${instantTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              {step === 'review' ? (
                <div className="space-y-2">
                  <button
                    id="proceed-to-checkout-btn"
                    onClick={() => setStep('checkout')}
                    className="w-full py-3 px-4 rounded-xl bg-[#2d4734] hover:bg-[#233829] active:scale-98 text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm border border-[#3b5d44]"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  {onOpenRecipes && (
                    <button
                      id="drawer-footer-recipes-btn"
                      type="button"
                      onClick={onOpenRecipes}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#faf8f4] hover:bg-[#efe9dd] border border-[#d6cec0] text-[#2d4734] font-bold text-xs transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <ChefHat className="w-4 h-4 text-[#2d4734]" />
                      <span>Get Recipes from Selected Produce ({cart.length})</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setStep('review')}
                    className="px-4 py-3 rounded-xl bg-[#faf8f4] border border-[#d6cec0] hover:bg-[#ede7dc] text-[#556358] font-semibold text-xs"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    form="farm-order-form"
                    disabled={isSubmitting}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#2d4734] hover:bg-[#233829] active:scale-98 disabled:bg-gray-300 text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Confirming with Cloud...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#8fe0a8]" />
                        <span>Place Farm Order • ${instantTotal.toFixed(2)}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
