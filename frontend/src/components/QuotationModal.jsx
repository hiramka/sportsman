import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { X, Plus, Trash2, FileText, Calculator, Building, User, Phone, Mail, MapPin } from 'lucide-react';

const NAIROBI_SUB_COUNTIES = [
  'Westlands',
  'Kilimani / Lavington',
  'Karen / Langata',
  'CBD / Nairobi Central',
  'Embakasi / Eastlands',
  'Kasarani / Roysambu',
  'Gigiri / Runda'
];

export default function QuotationModal({ isOpen, onClose, initialData = null }) {
  const { products, createQuotation } = useContext(AppContext);

  // Form State
  const [clientName, setClientName] = useState('');
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subCounty, setSubCounty] = useState(NAIROBI_SUB_COUNTIES[0]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [validityDays, setValidityDays] = useState('30');
  const [vatMode, setVatMode] = useState('exclusive'); // 'exclusive' | 'inclusive' | 'exempt'
  const [shippingFee, setShippingFee] = useState('1500');
  const [terms, setTerms] = useState('50% deposit upon order placement. Balance payable on delivery. Prices include 16% VAT.');

  // Quotation Items state
  const [selectedProductId, setSelectedProductId] = useState('');
  const [items, setItems] = useState([]);

  // Add Item to Quotation
  const handleAddItem = () => {
    if (!selectedProductId) return;
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;

    // Check if already in items list
    if (items.some(i => i.product.id === prod.id)) {
      alert('Product already added to line items list.');
      return;
    }

    setItems(prev => [
      ...prev,
      {
        product: prod,
        quantity: 1,
        unitPrice: prod.price,
        discountPercent: 0
      }
    ]);
    setSelectedProductId('');
  };

  // Remove Item
  const handleRemoveItem = (index) => {
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Update item field
  const handleItemChange = (index, field, value) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: Number(value) };
      return updated;
    });
  };

  // Financial Calculations
  const calculations = useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      const price = Number(item.unitPrice || 0);
      const qty = Number(item.quantity || 1);
      const disc = Number(item.discountPercent || 0);
      return sum + Math.round(price * qty * (1 - disc / 100));
    }, 0);

    let vatAmount = 0;
    let grandTotal = subtotal;

    if (vatMode === 'exclusive') {
      vatAmount = Math.round(subtotal * 0.16);
      grandTotal = subtotal + vatAmount;
    } else if (vatMode === 'inclusive') {
      vatAmount = Math.round(subtotal * (16 / 116));
      grandTotal = subtotal;
    } else {
      vatAmount = 0;
      grandTotal = subtotal;
    }

    const shipping = Number(shippingFee || 0);
    grandTotal += shipping;

    return { subtotal, vatAmount, shipping, grandTotal, vatMode };
  }, [items, vatMode, shippingFee]);


  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clientName || !phone || items.length === 0) {
      alert('Please provide client name, phone number, and at least one item.');
      return;
    }

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + Number(validityDays));

    const quotationData = {
      clientName,
      organization,
      email,
      phone,
      subCounty,
      deliveryAddress,
      validUntil: expiry.toISOString().split('T')[0],
      items,
      subtotal: calculations.subtotal,
      vatAmount: calculations.vatAmount,
      vatMode: calculations.vatMode,
      includeVat: calculations.vatMode !== 'exempt',
      shippingFee: calculations.shipping,
      grandTotal: calculations.grandTotal,
      terms,
      status: 'Sent'
    };


    createQuotation(quotationData);
    onClose();

    // Reset Form
    setClientName('');
    setOrganization('');
    setEmail('');
    setPhone('');
    setDeliveryAddress('');
    setItems([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-[#0D1321] border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto text-left">
        {/* Header */}
        <div className="p-6 border-b border-slate-900 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white m-0 uppercase tracking-tight">Create Corporate Quotation</h2>
              <p className="text-xs text-slate-400 m-0">Generate official proforma invoices for schools, clubs, and corporate clients</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200 text-xs">
          {/* Client Information */}
          <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 m-0">
              <Building className="w-4 h-4 text-orange-500" /> Client & Institution Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Contact Name *</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Coach Maurice Wambua"
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">School / Organization / Club</label>
                <div className="relative">
                  <Building className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. St. Mary's High School"
                    value={organization}
                    onChange={e => setOrganization(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Phone Number *</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="+254 712 345 678"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="sports@stmarys.ac.ke"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Sub-County Location</label>
                <select
                  value={subCounty}
                  onChange={e => setSubCounty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-orange-500 focus:outline-none cursor-pointer"
                >
                  {NAIROBI_SUB_COUNTIES.map(sc => (
                    <option key={sc} value={sc}>{sc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Delivery Address</label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Waiyaki Way / Gate 2"
                    value={deliveryAddress}
                    onChange={e => setDeliveryAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Item Selector Section */}
          <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 m-0">
                <Calculator className="w-4 h-4 text-orange-500" /> Line Items & Pricing Breakdown
              </h3>
            </div>

            {/* Product Selector Dropdown */}
            <div className="flex items-center gap-2">
              <select
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
                className="flex-1 px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-orange-500 focus:outline-none cursor-pointer text-xs"
              >
                <option value="">-- Select Product from Catalogue --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} - [{p.brand}] (KES {p.price.toLocaleString()})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleAddItem}
                disabled={!selectedProductId}
                className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>

            {/* Selected Items Table */}
            {items.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                No items added to quotation yet. Select products from catalogue above.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase font-black">
                      <th className="py-2 px-2">Item</th>
                      <th className="py-2 px-2 text-center w-20">Qty</th>
                      <th className="py-2 px-2 text-right w-28">Unit Price</th>
                      <th className="py-2 px-2 text-right w-24">Disc %</th>
                      <th className="py-2 px-2 text-right w-28">Total</th>
                      <th className="py-2 px-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => {
                      const price = Number(item.unitPrice || 0);
                      const qty = Number(item.quantity || 1);
                      const disc = Number(item.discountPercent || 0);
                      const lineTotal = Math.round(price * qty * (1 - disc / 100));

                      return (
                        <tr key={item.product.id} className="border-b border-slate-900/60 hover:bg-slate-900/30">
                          <td className="py-2.5 px-2">
                            <div className="font-bold text-white">{item.product.name}</div>
                            <div className="text-[10px] text-slate-500">{item.product.brand}</div>
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                              className="w-16 px-2 py-1 bg-slate-950 border border-slate-800 text-center rounded-lg text-white font-bold"
                            />
                          </td>
                          <td className="py-2.5 px-2 text-right">
                            <input
                              type="number"
                              min="0"
                              value={item.unitPrice}
                              onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)}
                              className="w-24 px-2 py-1 bg-slate-950 border border-slate-800 text-right rounded-lg text-white font-bold"
                            />
                          </td>
                          <td className="py-2.5 px-2 text-right">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.discountPercent}
                              onChange={e => handleItemChange(idx, 'discountPercent', e.target.value)}
                              className="w-16 px-2 py-1 bg-slate-950 border border-slate-800 text-right rounded-lg text-emerald-400 font-bold"
                            />
                          </td>
                          <td className="py-2.5 px-2 text-right font-black text-white">
                            KES {lineTotal.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-slate-500 hover:text-red-400 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quotation Config & Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl space-y-3">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Validity Period</label>
              <select
                value={validityDays}
                onChange={e => setValidityDays(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none cursor-pointer"
              >
                <option value="7">7 Days Validity</option>
                <option value="14">14 Days Validity</option>
                <option value="30">30 Days Validity</option>
              </select>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-bold">
                  <input
                    type="checkbox"
                    checked={includeVat}
                    onChange={e => setIncludeVat(e.target.checked)}
                    className="accent-orange-500 w-4 h-4 rounded"
                  />
                  <span>Include 16% VAT Tax Breakdown</span>
                </label>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Shipping / Delivery Fee (KES)</label>
                <input
                  type="number"
                  value={shippingFee}
                  onChange={e => setShippingFee(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none font-bold"
                />
              </div>
            </div>

            {/* Financial Summary Card */}
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-2">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 m-0">Quotation Summary</h4>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Items Subtotal:</span>
                  <span className="font-bold text-white">KES {calculations.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>16% VAT:</span>
                  <span className="font-bold text-slate-400">{includeVat ? `KES ${calculations.vatAmount.toLocaleString()}` : '0% Exempt'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee:</span>
                  <span className="font-bold text-white">KES {calculations.shipping.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-black text-orange-500">
                  <span>Grand Total:</span>
                  <span>KES {calculations.grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms & Notes */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Terms of Sale & Payment Notes</label>
            <textarea
              rows={2}
              value={terms}
              onChange={e => setTerms(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none text-xs"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black shadow-lg shadow-orange-500/20 cursor-pointer transition-all"
            >
              Save & Issue Quotation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
