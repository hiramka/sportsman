// Sportsman.ke - Official Point of Sale & Walk-In Sales Receipt Generator
export const printPosReceipt = (order) => {
  if (!order) return;

  const printWindow = window.open('', '_blank', 'width=750,height=850');
  if (!printWindow) {
    alert('Please allow popups to print customer sales receipts.');
    return;
  }

  const receiptDate = new Date(order.date || Date.now()).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const subtotal = Number(order.subtotal || order.totalAmount || 0);
  const discount = Number(order.discountAmount || 0);
  const total = Number(order.totalAmount || 0);
  // Kenya Standard VAT rate (16% included)
  const vatAmount = Math.round((total * 16) / 116);
  const netAmount = total - vatAmount;

  const itemsHtml = (order.items || []).map((it, idx) => {
    const prodName = it.product?.name || it.name || 'Sports Item';
    const size = it.selectedSize || it.size || 'Standard';
    const price = Number(it.product?.price || it.price || 0);
    const qty = Number(it.quantity || 1);
    const lineTotal = price * qty;

    return `
      <tr>
        <td style="padding: 10px 8px; border-bottom: 1px dashed #e2e8f0;">
          <div style="font-weight: 700; color: #0f172a; font-size: 13px;">${prodName}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Fit/Size: <strong style="color: #ea580c;">${size}</strong></div>
        </td>
        <td style="padding: 10px 8px; text-align: center; border-bottom: 1px dashed #e2e8f0; font-size: 13px; font-weight: 600;">
          ${qty}
        </td>
        <td style="padding: 10px 8px; text-align: right; border-bottom: 1px dashed #e2e8f0; font-size: 13px;">
          KES ${price.toLocaleString()}
        </td>
        <td style="padding: 10px 8px; text-align: right; border-bottom: 1px dashed #e2e8f0; font-size: 13px; font-weight: 800; color: #0f172a;">
          KES ${lineTotal.toLocaleString()}
        </td>
      </tr>
    `;
  }).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Receipt - ${order.id} - Sportsman.ke</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');
          * { box-sizing: border-box; }
          body {
            font-family: 'Outfit', -apple-system, sans-serif;
            background-color: #f1f5f9;
            color: #0f172a;
            padding: 24px;
            margin: 0;
            display: flex;
            justify-content: center;
          }
          .receipt-container {
            width: 100%;
            max-width: 580px;
            background: #ffffff;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
          }
          .brand-header {
            text-align: center;
            border-bottom: 2px solid #FF5A1F;
            padding-bottom: 18px;
            margin-bottom: 20px;
          }
          .brand-title {
            font-size: 24px;
            font-weight: 900;
            letter-spacing: -0.5px;
            color: #0B0F19;
            margin: 0;
          }
          .brand-title span { color: #FF5A1F; }
          .brand-subtitle {
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 1px;
            text-transform: uppercase;
            color: #64748b;
            margin-top: 4px;
          }
          .meta-pill {
            display: inline-block;
            background: #fff7ed;
            color: #ea580c;
            border: 1px solid #ffedd5;
            padding: 3px 10px;
            border-radius: 9999px;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 8px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            background: #f8fafc;
            padding: 16px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            font-size: 12px;
            margin-bottom: 24px;
          }
          .info-label {
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            color: #64748b;
            letter-spacing: 0.5px;
            display: block;
            margin-bottom: 2px;
          }
          .info-val {
            font-weight: 700;
            color: #0f172a;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
          }
          .items-table th {
            text-transform: uppercase;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.5px;
            color: #475569;
            padding: 8px;
            border-bottom: 2px solid #e2e8f0;
          }
          .totals-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            margin-bottom: 20px;
          }
          .totals-table td {
            padding: 6px 0;
            color: #475569;
          }
          .grand-total-row td {
            border-top: 2px solid #FF5A1F;
            border-bottom: 2px solid #FF5A1F;
            padding: 12px 0;
            font-size: 18px;
            font-weight: 900;
            color: #FF5A1F;
          }
          .verification-stamp {
            border: 2px dashed #cbd5e1;
            padding: 12px;
            border-radius: 12px;
            text-align: center;
            background: #f8fafc;
            margin-bottom: 20px;
          }
          .receipt-footer {
            text-align: center;
            font-size: 11px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
            padding-top: 16px;
            line-height: 1.5;
          }
          @media print {
            body { background: white; padding: 0; }
            .receipt-container { box-shadow: none; border: none; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="brand-header">
            <div class="brand-title">SPORTSMAN<span>.KE</span></div>
            <div class="brand-subtitle">THE PROFESSIONAL ATHLETE • NAIROBI STORE</div>
            <div class="meta-pill">IN-STORE WALK-IN SALE • OFFICIAL RECEIPT</div>
          </div>

          <div class="info-grid">
            <div>
              <span class="info-label">RECEIPT NUMBER</span>
              <span class="info-val" style="font-family: 'JetBrains Mono', monospace; color: #ea580c;">${order.id}</span>
              
              <span class="info-label" style="margin-top: 8px;">DATE &amp; TIME</span>
              <span class="info-val">${receiptDate}</span>

              <span class="info-label" style="margin-top: 8px;">STORE LOCATION</span>
              <span class="info-val">Nairobi Central / CBD Main Retail Hub</span>
            </div>
            <div style="text-align: right;">
              <span class="info-label">CUSTOMER NAME</span>
              <span class="info-val">${order.customerName || 'Walk-in Customer'}</span>

              <span class="info-label" style="margin-top: 8px;">PHONE / CONTACT</span>
              <span class="info-val">${order.phone || 'Direct Counter'}</span>

              <span class="info-label" style="margin-top: 8px;">PAYMENT METHOD</span>
              <span class="info-val" style="color: #16a34a;">${order.paymentMethod || 'Cash'} ${order.mpesaReference ? `(${order.mpesaReference})` : ''}</span>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th style="text-align: left;">Product Item</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <table class="totals-table">
            <tbody>
              <tr>
                <td>Subtotal</td>
                <td style="text-align: right; font-weight: 700; color: #0f172a;">KES ${subtotal.toLocaleString()}</td>
              </tr>
              ${discount > 0 ? `
              <tr>
                <td style="color: #16a34a;">Special Discount</td>
                <td style="text-align: right; font-weight: 700; color: #16a34a;">- KES ${discount.toLocaleString()}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="font-size: 11px; color: #94a3b8;">Includes 16% VAT (KES ${vatAmount.toLocaleString()})</td>
                <td style="text-align: right; font-size: 11px; color: #94a3b8;">Net: KES ${netAmount.toLocaleString()}</td>
              </tr>
              <tr class="grand-total-row">
                <td>TOTAL CHARGED</td>
                <td style="text-align: right;">KES ${total.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div class="verification-stamp">
            <div style="font-size: 10px; font-weight: 800; color: #16a34a; text-transform: uppercase; letter-spacing: 0.5px;">
              ✓ PAID IN FULL &amp; COLLECTED AT COUNTER
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
              Inventory verified and subtracted from store catalog.
            </div>
          </div>

          <div class="receipt-footer">
            Thank you for shopping at <strong>Sportsman.ke</strong>!<br />
            Need an exchange? Items in original condition may be exchanged within 7 days.<br />
            Customer Support: +254 759 238018 | info@sportsman.ke
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
};
