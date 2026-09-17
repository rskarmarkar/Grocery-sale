import React from 'react';
import { CheckCircle, MapPin, Phone, Calendar, Clock, ShoppingBag, ArrowRight, Printer, Sparkles } from 'lucide-react';
import { Order } from '../types';

interface OrderConfirmationModalProps {
  order: Order | null;
  onClose: () => void;
  onViewInFarmerDashboard: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onClose,
  onViewInFarmerDashboard
}) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div 
        id="order-confirmation-dialog"
        className="w-full max-w-lg bg-pale rounded-3xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Celebration Banner */}
        <div className="bg-sprout-900 text-white p-6 text-center relative">
          <div className="w-16 h-16 rounded-2xl bg-sprout-700 text-mint mx-auto flex items-center justify-center mb-3 shadow-inner">
            <CheckCircle className="w-9 h-9 stroke-[2]" />
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-pale uppercase tracking-wider mb-2 inline-block">
            Cloud Order Synchronized
          </span>
          <h2 className="font-display font-bold text-2xl text-white">
            Thank You, {order.customerName}!
          </h2>
          <p className="text-xs text-mint mt-1 max-w-sm mx-auto">
            Your farm produce order has been received and cloud-registered in our inventory tracking system.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/20 text-xs font-mono font-bold text-cream">
            <span>Order ID:</span>
            <span className="text-mint">{order.id}</span>
          </div>
        </div>

        {/* Order Details Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Fulfillment Info */}
          <div className="p-4 rounded-xl bg-border-soft border border-border-soft text-xs text-ink space-y-2">
            <div className="flex items-center justify-between font-semibold text-ink pb-2 border-b border-pale">
              <span>Fulfillment Method:</span>
              <span className="capitalize text-sprout-900 font-bold">
                {order.fulfillmentType === 'pickup' ? 'Farm Stand Pickup' : 'Local Farm Delivery'}
              </span>
            </div>

            {order.fulfillmentType === 'pickup' ? (
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-clay shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-ink">Pickup Window:</span> {order.pickupTime}
                  <p className="text-muted">Location: 4800 Willow Creek Rd, Valley Stand</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-clay shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-ink">Delivery Address:</span> {order.deliveryAddress}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-clay shrink-0" />
              <span>
                <span className="font-medium text-ink">Customer Phone:</span> {order.customerPhone}
              </span>
            </div>

            {order.notes && (
              <div className="pt-1 text-muted italic">
                "{order.notes}"
              </div>
            )}
          </div>

          {/* Ordered Line Items */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted block mb-2">
              Harvest Produce Summary
            </span>
            <div className="divide-y divide-border-soft border border-border-soft rounded-xl overflow-hidden bg-white">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-ink block">
                      {item.name}
                    </span>
                    <span className="text-muted">
                      {item.quantity} {item.unit} × ${item.price.toFixed(2)}
                    </span>
                  </div>
                  <span className="font-display font-bold text-sm text-ink">
                    ${item.subtotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Totals */}
          <div className="p-4 rounded-xl bg-success-soft border border-success-soft space-y-1 text-xs">
            <div className="flex justify-between text-muted">
              <span>Subtotal:</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-muted">
                <span>Local Delivery Fee:</span>
                <span>${order.deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base text-sprout-900 pt-2 border-t border-success-soft">
              <span>Instant Total:</span>
              <span className="font-display text-lg">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-5 bg-cream border-t border-border flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-sprout-900 hover:bg-sprout-700 text-white text-xs sm:text-sm font-bold text-center transition-colors shadow-xs"
          >
            Done • Back to Produce Market
          </button>
          <button
            onClick={() => {
              onClose();
              onViewInFarmerDashboard();
            }}
            className="py-3 px-4 rounded-xl bg-border-soft hover:bg-border text-muted text-xs sm:text-sm font-semibold text-center transition-colors flex items-center justify-center gap-1.5"
          >
            <span>View in Farmer Manager</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
