/**
 * Shipping Waybill Generator & Thermal 4x6 / A4 Printer
 * Supports 1-click thermal printing and saving as file
 */
export const printShippingWaybill = (order) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to open the shipping waybill.');
    return;
  }

  const itemsList = (order.items || []).map(item => `
    <tr>
      <td style="padding: 6px 4px; border-bottom: 1px dashed #cbd5e1; font-weight: 600; font-size: 11px;">
        ${item.product?.name || 'Item'}
        <span style="display: block; font-size: 10px; color: #d97706; font-weight: 800;">
          SIZE: ${item.selectedSize || 'Standard'}
        </span>
      </td>
      <td style="padding: 6px 4px; border-bottom: 1px dashed #cbd5e1; text-align: center; font-weight: 800; font-size: 12px;">
        ${item.quantity}
      </td>
    </tr>
  `).join('');

  const waybillHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>WAYBILL - ${order.id}</title>
      <style>
        @page {
          size: 4in 6in;
          margin: 0;
        }
        @media print {
          body {
            margin: 0;
            padding: 8px;
            background: #fff;
          }
          .no-print {
            display: none !important;
          }
          .waybill-container {
            border: 2px solid #000 !important;
            box-shadow: none !important;
          }
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background: #f1f5f9;
          color: #0f172a;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .action-bar {
          width: 384px;
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }
        .btn {
          flex: 1;
          padding: 10px 14px;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .btn-print {
          background: #ea580c;
          color: white;
        }
        .btn-save {
          background: #0f172a;
          color: white;
        }
        .waybill-container {
          width: 384px; /* 4 inches at 96 DPI */
          min-height: 576px; /* 6 inches at 96 DPI */
          background: white;
          border: 2px solid #0f172a;
          border-radius: 4px;
          padding: 12px;
          box-sizing: border-box;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #0f172a;
          padding-bottom: 8px;
          margin-bottom: 8px;
        }
        .brand-title {
          font-size: 18px;
          font-weight: 900;
          letter-spacing: -0.5px;
        }
        .brand-title span {
          color: #ea580c;
        }
        .badge {
          display: inline-block;
          font-size: 9px;
          font-weight: 900;
          padding: 2px 6px;
          border: 1px solid #000;
          border-radius: 3px;
          text-transform: uppercase;
        }
        .barcode-box {
          text-align: center;
          padding: 6px;
          background: #f8fafc;
          border: 1px dashed #64748b;
          margin-bottom: 8px;
        }
        .barcode-visual {
          font-family: monospace;
          letter-spacing: 5px;
          font-size: 20px;
          font-weight: 900;
          background: repeating-linear-gradient(90deg, #000, #000 2px, transparent 2px, transparent 4px, #000 4px, #000 7px, transparent 7px, transparent 10px);
          height: 38px;
          margin-bottom: 4px;
        }
        .barcode-text {
          font-family: monospace;
          font-size: 11px;
          font-weight: 800;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          border-bottom: 1px solid #cbd5e1;
          padding-bottom: 8px;
          margin-bottom: 8px;
          font-size: 10px;
        }
        .address-box {
          border: 1px solid #0f172a;
          padding: 8px;
          border-radius: 4px;
          margin-bottom: 8px;
          background: #fafafa;
        }
        .address-title {
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
          color: #ea580c;
          margin-bottom: 3px;
        }
        .customer-name {
          font-size: 13px;
          font-weight: 900;
          color: #0f172a;
        }
        .customer-phone {
          font-size: 12px;
          font-weight: 800;
          font-family: monospace;
          color: #000;
        }
        .location-bold {
          font-size: 11px;
          font-weight: 800;
          margin-top: 2px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 8px;
        }
        .items-table th {
          font-size: 9px;
          text-transform: uppercase;
          font-weight: 900;
          border-bottom: 1px solid #000;
          padding-bottom: 4px;
          text-align: left;
        }
        .meta-footer {
          border-top: 2px solid #0f172a;
          padding-top: 6px;
          font-size: 9px;
        }
        .signature-box {
          margin-top: 6px;
          border: 1px dashed #64748b;
          padding: 8px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          min-height: 35px;
        }
      </style>
    </head>
    <body>
      <div class="action-bar no-print">
        <button class="btn btn-print" onclick="window.print()">
          🖨️ Print Waybill (4x6 / A4)
        </button>
        <button class="btn btn-save" id="saveBtn">
          💾 Save Waybill File
        </button>
      </div>

      <div class="waybill-container" id="waybillContent">
        <div class="header">
          <div>
            <div class="brand-title">SPORTSMAN<span>.KE</span></div>
            <div style="font-size: 8px; font-weight: 800; text-transform: uppercase; color: #64748b;">
              Express Sports Dispatch
            </div>
          </div>
          <div style="text-align: right;">
            <span class="badge">STANDARD COURIER</span>
            <div style="font-size: 8px; font-weight: 800; margin-top: 2px;">
              ${new Date(order.date || Date.now()).toLocaleDateString('en-KE')}
            </div>
          </div>
        </div>

        <div class="barcode-box">
          <div class="barcode-visual"></div>
          <div class="barcode-text">*${order.id}*</div>
        </div>

        <div class="address-box">
          <div class="address-title">SHIP TO (RECEIVER):</div>
          <div class="customer-name">${order.customerName || 'Customer'}</div>
          <div class="customer-phone">${order.phone || 'Phone N/A'}</div>
          <div class="location-bold">
            ${order.subCounty || 'Nairobi Central'}, ${order.county || 'Nairobi'}
          </div>
          <div style="font-size: 10px; color: #475569; margin-top: 2px;">
            ${order.deliveryAddress || 'Address on file'}
          </div>
        </div>

        <div class="grid-2">
          <div>
            <div style="font-size: 8px; font-weight: 800; color: #64748b; text-transform: uppercase;">FROM:</div>
            <div style="font-weight: 800;">Sportsman Warehouse</div>
            <div>Nairobi Fulfillment Hub 1</div>
            <div>Tel: +254 759 238018</div>
          </div>
          <div>
            <div style="font-size: 8px; font-weight: 800; color: #64748b; text-transform: uppercase;">COURIER & ROUTE:</div>
            <div style="font-weight: 800;">${order.courierName || 'Nairobi Speed Courier'}</div>
            <div style="font-family: monospace;">TRK: ${order.trackingNumber || order.id}</div>
            <div style="font-weight: 800; color: #ea580c;">PAYMENT: ${order.paymentMethod || 'M-Pesa'}</div>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Item / Variant Size</th>
              <th style="text-align: center; width: 40px;">Qty</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
        </table>

        <div class="meta-footer">
          <div style="display: flex; justify-content: space-between; font-weight: 800;">
            <span>TOTAL AMOUNT: KES ${Number(order.totalAmount || 0).toLocaleString()}</span>
            <span>SHIPPING: KES ${Number(order.shippingFee || 0).toLocaleString()}</span>
          </div>
          <div style="font-size: 8px; color: #64748b; margin-top: 3px;">
            ⚠️ INSTRUCTIONS: FRAGILE ATHLETIC EQUIPMENT. INSPECT SEAL BEFORE SIGNING.
          </div>

          <div class="signature-box">
            <span style="font-size: 8px; font-weight: 800; color: #64748b; text-transform: uppercase;">
              Receiver Signature & Date:
            </span>
            <span style="font-size: 11px; font-family: serif; font-weight: 800;">
              ${order.signature ? `Signed: ${order.signature}` : '______________________'}
            </span>
          </div>
        </div>
      </div>

      <script>
        document.getElementById('saveBtn').addEventListener('click', function() {
          const content = document.documentElement.outerHTML;
          const blob = new Blob([content], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'WAYBILL_${order.id}.html';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        });
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(waybillHtml);
  printWindow.document.close();
};
