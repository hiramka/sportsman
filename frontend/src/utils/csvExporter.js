/**
 * Export Orders to CSV for Accounting, Inventory Auditing, Supplier Restocking, and KRA VAT Filing
 */
export const exportOrdersToCSV = (orders, filterRange = 'all', customDates = { start: '', end: '' }) => {
  if (!orders || orders.length === 0) {
    alert('No orders available to export.');
    return;
  }

  const now = new Date();
  let filtered = [...orders];

  if (filterRange === 'today') {
    const todayStr = now.toISOString().split('T')[0];
    filtered = filtered.filter(o => (o.date || '').startsWith(todayStr));
  } else if (filterRange === '7days') {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    filtered = filtered.filter(o => new Date(o.date) >= sevenDaysAgo);
  } else if (filterRange === '30days') {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    filtered = filtered.filter(o => new Date(o.date) >= thirtyDaysAgo);
  } else if (filterRange === 'month') {
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    filtered = filtered.filter(o => {
      const d = new Date(o.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
  } else if (filterRange === 'custom' && customDates.start && customDates.end) {
    const start = new Date(customDates.start);
    const end = new Date(customDates.end);
    end.setHours(23, 59, 59, 999);
    filtered = filtered.filter(o => {
      const d = new Date(o.date);
      return d >= start && d <= end;
    });
  }

  if (filtered.length === 0) {
    alert(`No orders found for the selected date range: "${filterRange}".`);
    return;
  }

  // Define CSV headers
  const headers = [
    'Order ID',
    'Order Date',
    'Customer Name',
    'Customer Phone',
    'Customer Email',
    'County',
    'Town / Sub-County',
    'Physical Address',
    'Payment Method',
    'M-Pesa Reference',
    'Status',
    'Items Summary (Name [Size] x Qty)',
    'Total Units',
    'Subtotal (KES)',
    '16% VAT Amount (KES) [KRA]',
    'Net Before VAT (KES)',
    'Discount (KES)',
    'Coupon Code',
    'Shipping Fee (KES)',
    'Grand Total (KES)',
    'Courier Partner',
    'Tracking Number',
    'Size Exchange Status'
  ];

  // Map rows
  const rows = filtered.map(order => {
    const items = order.items || [];
    const totalUnits = items.reduce((sum, it) => sum + (it.quantity || 1), 0);
    const itemsSummary = items
      .map(it => `${it.product?.name || 'Item'} [${it.selectedSize || 'Standard'}] x${it.quantity || 1}`)
      .join('; ');

    const subtotal = Number(order.subtotal || 0);
    const vatAmount = Math.round(subtotal - subtotal / 1.16);
    const netBeforeVat = subtotal - vatAmount;
    const discount = Number(order.discountAmount || 0);
    const shippingFee = Number(order.shippingFee || 0);
    const grandTotal = Number(order.totalAmount || 0);

    let exchangeStatus = 'None';
    if (order.exchangeRequestJson) {
      try {
        const parsed = JSON.parse(order.exchangeRequestJson);
        exchangeStatus = parsed.status || 'Pending';
      } catch {
        exchangeStatus = 'Requested';
      }
    }

    return [
      `"${order.id}"`,
      `"${new Date(order.date || Date.now()).toISOString().replace('T', ' ').substring(0, 19)}"`,
      `"${(order.customerName || '').replace(/"/g, '""')}"`,
      `"${(order.phone || '').replace(/"/g, '""')}"`,
      `"${(order.email || '').replace(/"/g, '""')}"`,
      `"${(order.county || 'Nairobi').replace(/"/g, '""')}"`,
      `"${(order.subCounty || '').replace(/"/g, '""')}"`,
      `"${(order.deliveryAddress || '').replace(/"/g, '""')}"`,
      `"${(order.paymentMethod || '').replace(/"/g, '""')}"`,
      `"${(order.mpesaReference || 'N/A').replace(/"/g, '""')}"`,
      `"${order.status || 'Pending'}"`,
      `"${itemsSummary.replace(/"/g, '""')}"`,
      totalUnits,
      subtotal,
      vatAmount,
      netBeforeVat,
      discount,
      `"${(order.couponApplied || 'None').replace(/"/g, '""')}"`,
      shippingFee,
      grandTotal,
      `"${(order.courierName || 'Pending').replace(/"/g, '""')}"`,
      `"${(order.trackingNumber || 'Pending').replace(/"/g, '""')}"`,
      `"${exchangeStatus}"`
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateTag = now.toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `sportsman_orders_accounting_kra_${filterRange}_${dateTag}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
