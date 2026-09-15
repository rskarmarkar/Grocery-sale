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
        className="w-full max-w-lg bg-[#fffefc] rounded-3xl border border-[#d8d0c2] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Celebration Banner */}
        <div className="bg-[#2d4734] text-white p-6 text-center relative">
          <div className="w-16 h-16 rounded-2xl bg-[#3f654a] text-[#8fe0a8] mx-auto flex items-center justify-center mb-3 shadow-inner">
            <CheckCircle className="w-9 h-9 stroke-[2]" />
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-[#d8ecdf] uppercase tracking-wider mb-2 inline-block">
            Cloud Order Synchronized
          </span>
          <h2 className="font-display font-bold text-2xl text-white">
            Thank You, {order.customerName}!
          </h2>
          <p className="text-xs text-[#c6ded0] mt-1 max-w-sm mx-auto">
            Your farm produce order has been received and cloud-registered in our inventory tracking system.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/20 text-xs font-mono font-bold text-[#faf8f4]">
            <span>Order ID:</span>
            <span className="text-[#a5e2bc]">{order.id}</span>
          </div>
        </div>

        {/* Order Details Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Fulfillment Info */}
          <div className="p-4 rounded-xl bg-[#f7f5ef] border border-[#e4ded3] text-xs text-[#445046] space-y-2">
            <div className="flex items-center justify-between font-semibold text-[#242b26] pb-2 border-b border-[#e7e1d5]">
              <span>Fulfillment Method:</span>
              <span className="capitalize text-[#2d4734] font-bold">
                {order.fulfillmentType === 'pickup' ? 'Farm Stand Pickup' : 'Local Farm Delivery'}
              </span>
            </div>

            {order.fulfillmentType === 'pickup' ? (
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#8a5d3b] shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-[#242b26]">Pickup Window:</span> {order.pickupTime}
                  <p className="text-[#6c786e]">Location: 4800 Willow Creek Rd, Valley Stand</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#8a5d3b] shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-[#242b26]">Delivery Address:</span> {order.deliveryAddress}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#8a5d3b] shrink-0" />
              <span>
                <span className="font-medium text-[#242b26]">Customer Phone:</span> {order.customerPhone}
              </span>
            </div>

            {order.notes && (
              <div className="pt-1 text-[#6a756b] italic">
                "{order.notes}"
              </div>
            )}
          </div>

          {/* Ordered Line Items */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#647167] block mb-2">
              Harvest Produce Summary
            </span>
            <div className="divide-y divide-[#eee8dc] border border-[#e4ded3] rounded-xl overflow-hidden bg-white">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-[#242b26] block">
                      {item.name}
                    </span>
                    <span className="text-[#6e7870]">
                      {item.quantity} {item.unit} × ${item.price.toFixed(2)}
                    </span>
                  </div>
                  <span className="font-display font-bold text-sm text-[#242b26]">
                    ${item.subtotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Totals */}
          <div className="p-4 rounded-xl bg-[#f2f7f3] border border-[#cbdccd] space-y-1 text-xs">
            <div className="flex justify-between text-[#556358]">
              <span>Subtotal:</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-[#556358]">
                <span>Local Delivery Fee:</span>
                <span>${order.deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base text-[#2d4734] pt-2 border-t border-[#cbdccd]">
              <span>Instant Total:</span>
              <span className="font-display text-lg">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-5 bg-[#faf8f4] border-t border-[#dfd7c9] flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-[#2d4734] hover:bg-[#233829] text-white text-xs sm:text-sm font-bold text-center transition-colors shadow-xs"
          >
            Done • Back to Produce Market
          </button>
          <button
            onClick={() => {
              onClose();
              onViewInFarmerDashboard();
            }}
            className="py-3 px-4 rounded-xl bg-[#ede7dc] hover:bg-[#dfd7c9] text-[#556358] text-xs sm:text-sm font-semibold text-center transition-colors flex items-center justify-center gap-1.5"
          >
            <span>View in Farmer Manager</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
