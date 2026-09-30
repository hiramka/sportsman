/**
 * Utility to print and export professional Quotations / Proforma Invoices
 */
export const printQuotation = (quotation) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print quotations.');
    return;
  }

  const issueDate = new Date(quotation.createdAt).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' });
  const validUntilDate = quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' }) : '30 Days from Issue';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Quotation ${quotation.id} - Sportsman.ke</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
          * { box-sizing: border-box; }
          body {
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
            padding: 40px;
            color: #0f172a;
            line-height: 1.5;
            background-color: #f8fafc;
          }
          .quote-box {
            max-width: 800px;
            margin: auto;
            background: #ffffff;
            padding: 45px;
            border-radius: 20px;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
            border: 1px solid #e2e8f0;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px solid #FF5A1F;
            padding-bottom: 25px;
            margin-bottom: 30px;
          }
          .brand-title {
            font-size: 30px;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: -1px;
            margin: 0;
          }
          .brand-title span { color: #FF5A1F; }
          .brand-sub {
            font-size: 11px;
            color: #64748b;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 2px;
          }
          .doc-type {
            text-align: right;
          }
          .doc-badge {
            display: inline-block;
            background-color: #fff7ed;
            color: #ea580c;
            border: 1px solid #ffedd5;
            font-weight: 900;
            font-size: 13px;
            padding: 6px 14px;
            border-radius: 30px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .quote-num {
            font-size: 18px;
            font-weight: 900;
            color: #0f172a;
            margin-top: 8px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 25px;
            margin-bottom: 35px;
            font-size: 13px;
          }
          .info-card {
            background-color: #f8fafc;
            padding: 18px;
            border-radius: 14px;
            border: 1px solid #f1f5f9;
          }
          .card-title {
            font-size: 10px;
            font-weight: 800;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
          }
          .client-name {
            font-size: 15px;
            font-weight: 800;
            color: #0f172a;
          }
          .org-name {
            font-size: 13px;
            font-weight: 700;
            color: #FF5A1F;
            margin-bottom: 6px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            font-size: 13px;
          }
          th {
            background-color: #0f172a;
            color: #ffffff;
            text-transform: uppercase;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.5px;
            padding: 12px 14px;
            text-align: left;
          }
          th:first-child { border-top-left-radius: 10px; border-bottom-left-radius: 10px; }
          th:last-child { border-top-right-radius: 10px; border-bottom-right-radius: 10px; text-align: right; }
          td {
            padding: 14px;
            border-bottom: 1px solid #f1f5f9;
            color: #334155;
          }
          .prod-name { font-weight: 700; color: #0f172a; }
          .prod-brand { font-size: 11px; color: #64748b; }
          .financials {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 35px;
          }
          .fin-table {
            width: 300px;
            font-size: 13px;
          }
          .fin-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            color: #475569;
          }
          .fin-grand {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-top: 2px solid #FF5A1F;
            font-size: 18px;
            font-weight: 900;
            color: #FF5A1F;
            margin-top: 8px;
          }
          .payment-terms-grid {
            display: grid;
            grid-template-columns: 1.2fr 0.8fr;
            gap: 20px;
            margin-top: 30px;
            padding-top: 25px;
            border-top: 1px dashed #cbd5e1;
            font-size: 12px;
          }
          .pay-box {
            background-color: #f1f5f9;
            padding: 16px;
            border-radius: 12px;
          }
          .pay-title {
            font-weight: 800;
            font-size: 11px;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
          }
          .stamp-box {
            border: 2px dashed #cbd5e1;
            border-radius: 12px;
            padding: 16px;
            text-align: center;
            background-color: #fafafa;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
          }
          @media print {
            body { background: #ffffff; padding: 0; }
            .quote-box { box-shadow: none; border: none; padding: 0; max-width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="quote-box">
          <!-- Header -->
          <div class="header">
            <div>
              <h1 class="brand-title">SPORTSMAN<span>.KE</span></h1>
              <div class="brand-sub">Kenya Premier Sports Hub & Equipment Supplier</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 8px;">
                Nairobi Central, Kenya • Tel: +254 759 238018<br>
                Email: Sportsman.ke001@gmail.com • Web: https://sportsman.ke
              </div>
            </div>
            <div class="doc-type">
              <div class="doc-badge">Official Quotation</div>
              <div class="quote-num">${quotation.id}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
                Date: <strong>${issueDate}</strong><br>
                Valid Until: <strong>${validUntilDate}</strong>
              </div>
            </div>
          </div>

          <!-- Client & Order Info -->
          <div class="info-grid">
            <div class="info-card">
              <div class="card-title">QUOTATION PREPARED FOR:</div>
              <div class="client-name">${quotation.clientName}</div>
              ${quotation.organization ? `<div class="org-name">${quotation.organization}</div>` : ''}
              <div><strong>Phone:</strong> ${quotation.phone}</div>
              <div><strong>Email:</strong> ${quotation.email}</div>
              <div><strong>Location:</strong> ${quotation.subCounty || 'Nairobi Central'}, ${quotation.deliveryAddress || 'Nairobi'}</div>
            </div>

            <div class="info-card">
              <div class="card-title">ISSUED BY:</div>
              <div class="client-name">Sportsman Corporate Sales</div>
              <div>Prepared By: <strong>${quotation.preparedBy || 'Sales Admin'}</strong></div>
              <div>Payment Mode: <strong>M-Pesa / Bank Transfer / Cheque</strong></div>
              <div>Status: <strong style="color: #ea580c; text-transform: uppercase;">${quotation.status}</strong></div>
            </div>
          </div>

          <!-- Items Table -->
          <table>
            <thead>
              <tr>
                <th style="width: 45%;">Item Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Disc %</th>
                <th style="text-align: right;">Line Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${quotation.items.map(item => {
                const price = Number(item.unitPrice || item.product.price);
                const qty = Number(item.quantity);
                const disc = Number(item.discountPercent || 0);
                const lineTotal = Math.round(price * qty * (1 - disc / 100));

                return `
                  <tr>
                    <td>
                      <div class="prod-name">${item.product.name}</div>
                      <div class="prod-brand">Brand: ${item.product.brand || 'Sportsman'}</div>
                    </td>
                    <td style="text-align: center; font-weight: 700;">${qty}</td>
                    <td style="text-align: right;">KES ${price.toLocaleString()}</td>
                    <td style="text-align: right; color: #059669; font-weight: 600;">${disc > 0 ? `${disc}%` : '-'}</td>
                    <td style="text-align: right; font-weight: 800; color: #0f172a;">KES ${lineTotal.toLocaleString()}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <!-- Financial Breakdown -->
          <div class="financials">
            <div class="fin-table">
              <div class="fin-row">
                <span>Items Subtotal:</span>
                <span>KES ${Number(quotation.subtotal).toLocaleString()}</span>
              </div>

              ${quotation.includeVat ? `
                <div class="fin-row">
                  <span>VAT (16% Included):</span>
                  <span>KES ${Number(quotation.vatAmount).toLocaleString()}</span>
                </div>
              ` : `
                <div class="fin-row" style="color: #64748b; font-size: 11px;">
                  <span>Tax Status:</span>
                  <span>0% (Tax Exempt)</span>
                </div>
              `}

              ${Number(quotation.shippingFee) > 0 ? `
                <div class="fin-row">
                  <span>Nairobi Delivery / Freight:</span>
                  <span>KES ${Number(quotation.shippingFee).toLocaleString()}</span>
                </div>
              ` : ''}

              <div class="fin-grand">
                <span>Grand Total:</span>
                <span>KES ${Number(quotation.grandTotal).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <!-- Payment Terms & Sign off -->
          <div class="payment-terms-grid">
            <div class="pay-box">
              <div class="pay-title">Payment Instructions</div>
              <div style="margin-bottom: 4px;"><strong>M-Pesa Buy Goods Till:</strong> 123456 (Sportsman.ke)</div>
              <div style="margin-bottom: 4px;"><strong>Bank Name:</strong> KCB Bank Kenya Ltd</div>
              <div style="margin-bottom: 4px;"><strong>Account Name:</strong> Sportsman Kenya Enterprises</div>
              <div><strong>Account Number:</strong> 1100223344</div>
              ${quotation.terms ? `<div style="margin-top: 10px; font-style: italic; color: #475569;">"${quotation.terms}"</div>` : ''}
            </div>

            <div class="stamp-box">
              <div style="font-size: 9px; font-weight: 800; color: #94a3b8; uppercase; tracking-wider; margin-bottom: 12px;">Authorized Seal & Signoff</div>
              <div style="font-family: serif; font-size: 18px; font-style: italic; font-weight: 800; color: #FF5A1F; margin-bottom: 4px;">Sportsman Kenya</div>
              <div style="font-size: 10px; color: #059669; font-weight: 800;">✓ Digitally Certified Quotation</div>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            Thank you for choosing Sportsman.ke — Nairobi Premier Sports Equipment Supplier.<br>
            All products are 100% genuine guaranteed. Same-day logistics delivery across Kenya.
          </div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
