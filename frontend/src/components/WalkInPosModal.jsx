import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import {
  X,
  Search,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  ShoppingBag,
  User,
  Phone,
  Printer,
  CheckCircle2,
  Sparkles,
  CreditCard,
  Smartphone,
  Banknote,
  Building,
  Tag,
  AlertCircle
} from 'lucide-react';
import { printPosReceipt } from '../utils/posReceiptPrinter';

export default function WalkInPosModal({ isOpen, onClose }) {
  const { products, recordWalkInSale } = useContext(AppContext);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Active Sale Cart
  const [saleItems, setSaleItems] = useState([]);
  const [activeSizes, setActiveSizes] = useState({}); // productId -> size string

  // Customer & Payment Info
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // 'Cash' | 'In-Store M-Pesa Till' | 'Card / POS' | 'Bank Transfer'
  const [paymentReference, setPaymentReference] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [notes, setNotes] = useState('');

  // Status
  const [submitting, setSubmitting] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Extract categories
  const categories = useMemo(() => {
    const list = Array.from(new Set((products || []).map(p => p.category).filter(Boolean)));
    return ['All', ...list];
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    const q = (search || '').toLowerCase();
    return (products || []).filter(p => {
      const matchQ =
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q));
      const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
      return matchQ && matchCat;
    });
  }, [products, search, categoryFilter]);

  // Calculations
  const subtotal = useMemo(() => {
    return saleItems.reduce((sum, item) => sum + (Number(item.product.price || 0) * item.quantity), 0);
  }, [saleItems]);

  const discount = Number(discountAmount) || 0;
  const grandTotal = Math.max(0, subtotal - discount);

  // Add item to sale cart
  const handleAddItem = (product) => {
    if (product.stockQuantity <= 0) {
      alert(`Product "${product.name}" is sold out.`);
      return;
    }

    let availableSizes = ['Standard'];
    try {
      const parsed = Array.isArray(product.sizes) ? product.sizes : JSON.parse(product.sizes || '["Standard"]');
      if (Array.isArray(parsed) && parsed.length > 0) availableSizes = parsed;
    } catch {
      availableSizes = ['Standard'];
    }

    const chosenSize = activeSizes[product.id] || availableSizes[0] || 'Standard';

    setSaleItems(prev => {
      const existingIdx = prev.findIndex(
        i => i.product.id === product.id && i.selectedSize === chosenSize
      );
      if (existingIdx > -1) {
        const currentQty = prev[existingIdx].quantity;
        if (currentQty >= product.stockQuantity) {
          alert(`Cannot add more than available stock (${product.stockQuantity}) for ${product.name}.`);
          return prev;
        }
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        return updated;
      }
      return [...prev, { product, quantity: 1, selectedSize: chosenSize }];
    });
  };

  const handleUpdateQty = (index, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }
    const item = saleItems[index];
    if (newQty > item.product.stockQuantity) {
      alert(`Only ${item.product.stockQuantity} items in stock.`);
      return;
    }
    setSaleItems(prev => {
      const updated = [...prev];
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const handleRemoveItem = (index) => {
    setSaleItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleReset = () => {
    setSaleItems([]);
    setCustomerName('Walk-in Customer');
    setPhone('');
    setEmail('');
    setPaymentMethod('Cash');
    setPaymentReference('');
    setDiscountAmount('');
    setNotes('');
    setCompletedSale(null);
    setErrorMessage('');
  };

  const handleSubmitSale = async (e) => {
    e.preventDefault();
    if (saleItems.length === 0) {
      setErrorMessage('Please add at least one product to the sale cart.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const saleOrder = await recordWalkInSale({
        customerName: customerName || 'Walk-in Customer',
        phone: phone || '+254 700 000000',
        email: email || 'walkin@sportsman.ke',
        paymentMethod,
        paymentReference,
        items: saleItems,
        discountAmount: discount,
        notes: notes || 'Walk-in store sale'
      });

      if (saleOrder) {
        setCompletedSale(saleOrder);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to record in-store sale.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in text-left">
      <div className="w-full max-w-5xl bg-[#0B0F19] border border-emerald-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800/80 bg-slate-950/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white m-0 uppercase tracking-tight">
                  Point of Sale (POS) &bull; Record Walk-In Sale
                </h3>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-500/30">
                  In-Store Counter
                </span>
              </div>
              <p className="text-xs text-slate-400 m-0 mt-0.5">
                Record physical purchases from walk-in customers and immediately decrement store inventory.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        {completedSale ? (
          /* Success Screen */
          <div className="p-8 text-center flex-1 overflow-y-auto flex flex-col items-center justify-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 block mb-1">
                SALE SUCCESSFULLY RECORDED &amp; FULFILLED
              </span>
              <h2 className="text-2xl font-black text-white">
                Receipt Reference: <span className="text-emerald-400 font-mono">{completedSale.id}</span>
              </h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-2">
                Inventory has been updated in the warehouse catalog. Customer receipt is generated and ready for print.
              </p>
            </div>

            {/* Summary Pill Box */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 w-full max-w-md text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="font-bold text-white">{completedSale.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment:</span>
                <span className="font-bold text-emerald-400">
                  {completedSale.paymentMethod} {completedSale.mpesaReference ? `(${completedSale.mpesaReference})` : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Items Sold:</span>
                <span className="font-bold text-white">
                  {(completedSale.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0)} items
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-black">
                <span className="text-slate-300">Total Collected:</span>
                <span className="text-emerald-400 font-mono">
                  KES {Number(completedSale.totalAmount || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
              <button
                onClick={() => printPosReceipt(completedSale)}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Receipt</span>
              </button>

              <button
                onClick={handleReset}
                className="py-3 px-5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-white font-black text-xs sm:text-sm rounded-xl active:scale-95 transition-all cursor-pointer"
              >
                New Walk-In Sale
              </button>
            </div>
          </div>
        ) : (
          /* Main POS Split Interface */
          <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
            {/* Left Column: Product Selection Grid (7 cols) */}
            <div className="lg:col-span-7 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-slate-800/80 flex flex-col overflow-hidden">
              {/* Product Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search product name, brand, or category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-300 cursor-pointer"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Products Catalog Cards (Scrollable) */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    No products found matching your search.
                  </div>
                ) : (
                  filteredProducts.map(prod => {
                    const isOutOfStock = Number(prod.stockQuantity || 0) <= 0;
                    let sizes = ['Standard'];
                    try {
                      const parsed = Array.isArray(prod.sizes) ? prod.sizes : JSON.parse(prod.sizes || '["Standard"]');
                      if (Array.isArray(parsed) && parsed.length > 0) sizes = parsed;
                    } catch {
                      sizes = ['Standard'];
                    }
                    const chosenSize = activeSizes[prod.id] || sizes[0] || 'Standard';

                    return (
                      <div
                        key={prod.id}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isOutOfStock
                            ? 'bg-slate-950/40 border-slate-900 opacity-60'
                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={prod.imageUrl}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover bg-slate-950 shrink-0"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/logo.png';
                            }}
                          />
                          <div className="min-w-0">
                            <span className="text-[10px] text-slate-500 uppercase font-black block truncate">
                              {prod.brand} &bull; {prod.category}
                            </span>
                            <h4 className="text-xs font-bold text-white truncate m-0">
                              {prod.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-black text-emerald-400">
                                KES {Number(prod.price || 0).toLocaleString()}
                              </span>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.2 rounded ${
                                isOutOfStock
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                  : prod.stockQuantity <= 3
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-slate-800 text-slate-300'
                              }`}>
                                {isOutOfStock ? 'Sold Out' : `${prod.stockQuantity} in stock`}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Size Picker & Add Button */}
                        <div className="flex items-center gap-2 shrink-0">
                          {sizes.length > 1 && (
                            <select
                              value={chosenSize}
                              disabled={isOutOfStock}
                              onChange={(e) => setActiveSizes({ ...activeSizes, [prod.id]: e.target.value })}
                              className="bg-slate-950 border border-slate-800 text-slate-300 text-[10px] font-bold rounded-lg px-2 py-1.5 focus:outline-none"
                            >
                              {sizes.map(sz => (
                                <option key={sz} value={sz}>{sz}</option>
                              ))}
                            </select>
                          )}

                          <button
                            type="button"
                            onClick={() => handleAddItem(prod)}
                            disabled={isOutOfStock}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all cursor-pointer ${
                              isOutOfStock
                                ? 'bg-slate-900 text-slate-600 border border-slate-850 cursor-not-allowed'
                                : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Active Sale Cart & Customer Payment Form (5 cols) */}
            <form onSubmit={handleSubmitSale} className="lg:col-span-5 p-4 sm:p-6 flex flex-col justify-between overflow-hidden bg-slate-950/40">
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {/* Sale Cart Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-black text-white uppercase tracking-wider m-0">
                      Sale Items ({saleItems.reduce((sum, it) => sum + it.quantity, 0)})
                    </h4>
                  </div>
                  {saleItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSaleItems([])}
                      className="text-[10px] text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      Clear Items
                    </button>
                  )}
                </div>

                {/* Selected Items List */}
                {saleItems.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl p-4">
                    <ShoppingBag className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                    Click "Add" on any product on the left to build the customer's sale receipt.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {saleItems.map((item, idx) => (
                      <div
                        key={`${item.product.id}-${item.selectedSize}-${idx}`}
                        className="bg-slate-900 border border-slate-850 p-2.5 rounded-xl flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-bold text-white truncate m-0">{item.product.name}</h5>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span className="font-bold text-orange-400">Size: {item.selectedSize}</span>
                            <span>&bull;</span>
                            <span>KES {Number(item.product.price || 0).toLocaleString()} each</span>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(idx, item.quantity - 1)}
                              className="p-1 hover:text-orange-400 text-slate-400 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-white px-2">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(idx, item.quantity + 1)}
                              className="p-1 hover:text-emerald-400 text-slate-400 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-slate-600 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Customer Details Section */}
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-wider m-0">
                    Walk-in Client Details
                  </h5>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Customer Name</label>
                      <input
                        type="text"
                        placeholder="e.g. John K."
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Phone / Mobile</label>
                      <input
                        type="tel"
                        placeholder="0712345678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-wider m-0">
                    Payment Method
                  </h5>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'Cash', label: 'Cash (Counter)', icon: Banknote },
                      { id: 'In-Store M-Pesa Till', label: 'M-Pesa Till (123456)', icon: Smartphone },
                      { id: 'Card / POS', label: 'Card / POS Terminal', icon: CreditCard },
                      { id: 'Bank Transfer', label: 'Bank Transfer', icon: Building }
                    ].map(pm => {
                      const Icon = pm.icon;
                      const isSelected = paymentMethod === pm.id;
                      return (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setPaymentMethod(pm.id)}
                          className={`p-2 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-[11px] font-bold truncate">{pm.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Payment Reference Code (especially useful for M-Pesa code) */}
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">
                      Payment Ref / M-Pesa Transaction Code (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. QK89271..."
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white uppercase font-mono"
                    />
                  </div>

                  {/* Discount & Notes */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">
                        In-Store Discount (KES)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">
                        Sale Notes / Counter #
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Counter 1 Walk-in"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>

              {/* Footer Totals & Submit */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span className="font-bold text-slate-200">KES {subtotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount Applied:</span>
                      <span className="font-bold">- KES {discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800/80">
                    <span>Total To Collect:</span>
                    <span className="text-emerald-400 font-mono">KES {grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || saleItems.length === 0}
                  className={`w-full py-3.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    submitting || saleItems.length === 0
                      ? 'bg-slate-900 text-slate-600 border border-slate-850 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-95'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>
                    {submitting ? 'Recording Sale...' : `Complete Sale & Deduct Stock (KES ${grandTotal.toLocaleString()})`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
