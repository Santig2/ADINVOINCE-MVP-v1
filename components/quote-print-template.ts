import { QuoteData } from "./quote-pdf-template";

export function generateQuotePrintHTML(quote: QuoteData): string {
    const escapeHtml = (text: string | null | undefined) => {
        if (!text) return "";
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    };

    const formatCurrency = (amount: number | undefined) => {
        return `$${(amount || 0).toFixed(2)}`;
    };

    const calculateItemTotal = (item: any) => {
        const subtotal = item.quantity * item.unitPrice;
        const taxAmount = (subtotal * item.tax) / 100;
        return subtotal + taxAmount;
    };

    const primaryC = "#007587"; // AdStrategic primary blue
    const separatorC = "#e2e8f0";
    const headerAccentC = "#f8fafc";

    const logoHtml = quote.logo
        ? `<img src="${quote.logo}" alt="Company Logo" style="height: 100px; max-width: 250px; object-fit: contain;" />`
        : "";

    const companyInfoHtml = `
    <div style="text-align: right; margin-left: 20px; font-size: 13px; color: #475569;">
      <h1 style="margin: 0 0 5px 0; font-size: 24px; color: #0f172a; font-weight: bold;">
        ${escapeHtml(quote.companyName || "Company Name")}
      </h1>
      ${quote.companyAddress ? `<div class="info-line">${escapeHtml(quote.companyAddress)}</div>` : ""}
      ${quote.companyEmail ? `<div class="info-line">${escapeHtml(quote.companyEmail)}</div>` : ""}
      ${quote.companyPhone ? `<div class="info-line">Phone: ${escapeHtml(quote.companyPhone)}</div>` : ""}
      ${quote.companyNIT ? `<div class="info-line">NIT: ${escapeHtml(quote.companyNIT)}</div>` : ""}
    </div>
  `;

    const itemsRowsHtml = (quote.items || [])
        .map((item, index) => `
      <tr>
        <td style="text-align: center; vertical-align: top;">${index + 1}</td>
        <td style="vertical-align: top;">
          <div style="font-weight: bold; color: #0f172a;">${escapeHtml(item.description || "")}</div>
          ${item.longDescription ? `<div style="font-size: 11px; margin-top: 4px; color: #64748b; white-space: pre-wrap;">${escapeHtml(item.longDescription)}</div>` : ""}
        </td>
        <td style="text-align: center; vertical-align: top;">${item.quantity}</td>
        <td style="text-align: right; vertical-align: top;">${formatCurrency(item.unitPrice)}</td>
        <td style="text-align: right; vertical-align: top;">${formatCurrency(calculateItemTotal(item))}</td>
      </tr>
    `)
        .join("");

    return `
<!DOCTYPE html>
<html>
<head>
  <title>Quote ${escapeHtml(quote.quoteNumber)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      margin: 40px auto;
      max-width: 800px;
      padding: 0 20px;
      font-size: 13px;
      color: #334155;
      line-height: 1.5;
    }
    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .quote-title-block h2 {
      margin: 0;
      font-size: 32px;
      color: #0f172a;
      letter-spacing: -0.5px;
      text-transform: uppercase;
    }
    .quote-title-block p {
      margin: 2px 0;
      color: #64748b;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .info-line { margin: 2px 0; }
    hr {
      border: none;
      border-top: 2px solid ${separatorC};
      margin: 25px 0;
    }
    .details-grid {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 11px;
      font-weight: bold;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 13px;
    }
    table, th, td {
      border: 1px solid ${separatorC};
    }
    th, td {
      padding: 12px 10px;
      text-align: left;
    }
    th {
      background-color: ${headerAccentC};
      font-weight: bold;
      color: #475569;
      font-size: 12px;
    }
    .totals-wrapper {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
    .totals {
      width: 300px;
      background: ${headerAccentC};
      border-radius: 8px;
      padding: 20px;
      border: 1px solid ${separatorC};
    }
    .totals p {
      display: flex;
      justify-content: space-between;
      margin: 8px 0;
      font-size: 13px;
    }
    .totals .grand-total {
      font-size: 18px;
      font-weight: bold;
      color: ${primaryC};
      border-top: 1px solid #cbd5e1;
      padding-top: 12px;
      margin-top: 12px;
    }
    .content-box {
      margin-bottom: 30px;
      background: ${headerAccentC};
      padding: 20px;
      border-radius: 8px;
      border: 1px solid ${separatorC};
    }
    .content-box h3 {
      margin: 0 0 10px 0;
      font-size: 15px;
      color: #0f172a;
    }
    .project-notes {
      margin-top: 30px;
      white-space: pre-wrap;
      font-size: 12px;
      color: #475569;
    }
    @media print {
      body { margin: 0; max-width: 100%; padding: 0; }
    }
  </style>
</head>
<body>

  <div class="header">
    <div class="quote-title-block">
      <h2>Quote</h2>
      <p>${escapeHtml(quote.projectName || "Estimate for services")}</p>
      <div style="margin-top: 10px; font-weight: bold; color: ${primaryC};">Quote # ${escapeHtml(quote.quoteNumber)}</div>
    </div>
    ${logoHtml}
  </div>

  <div style="display: flex; justify-content: flex-end; margin-top: -80px;">
    ${companyInfoHtml}
  </div>

  <hr />

  <div class="details-grid">
    <div>
      <div class="section-title">Prepared For</div>
      <div style="font-size: 16px; font-weight: bold; color: #0f172a; margin-bottom: 4px;">${escapeHtml(quote.clientName || "")}</div>
      ${quote.clientContact ? `<div>${escapeHtml(quote.clientContact)}</div>` : ""}
      ${quote.clientAddress ? `<div>${escapeHtml(quote.clientAddress)}</div>` : ""}
      ${quote.clientEmail ? `<div>${escapeHtml(quote.clientEmail)}</div>` : ""}
      ${quote.clientPhone ? `<div>${escapeHtml(quote.clientPhone)}</div>` : ""}
    </div>
    <div style="text-align: right;">
      <div class="section-title">Details</div>
      <div style="margin-bottom: 4px;"><strong>Issue Date:</strong> ${escapeHtml(quote.issueDate || "N/A")}</div>
      ${quote.estimatedStartDate ? `<div style="margin-bottom: 4px;"><strong>Est. Start:</strong> ${escapeHtml(quote.estimatedStartDate)}</div>` : ""}
      ${quote.estimatedDeliveryDate ? `<div><strong>Est. Delivery:</strong> ${escapeHtml(quote.estimatedDeliveryDate)}</div>` : ""}
    </div>
  </div>

  ${quote.proposalSummary ? `
  <div class="content-box">
    <h3>Executive Summary</h3>
    <div style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(quote.proposalSummary)}</div>
  </div>
  ` : ""}

  <div class="section-title" style="margin-top: 30px; font-size: 14px; color: #0f172a;">Investment Summary</div>

  <table>
    <thead>
      <tr>
        <th style="width: 5%; text-align: center;">#</th>
        <th style="width: 50%;">ITEM & DESCRIPTION</th>
        <th style="width: 10%; text-align: center;">QTY</th>
        <th style="width: 15%; text-align: right;">PRICE</th>
        <th style="width: 20%; text-align: right;">AMOUNT</th>
      </tr>
    </thead>
    <tbody>
      ${itemsRowsHtml}
    </tbody>
  </table>

  <div class="totals-wrapper">
    <div class="totals">
      <p><span>Subtotal:</span> <span>${formatCurrency(quote.subtotal || 0)}</span></p>
      <p><span>Taxes:</span> <span>${formatCurrency(quote.totalTax || 0)}</span></p>
      <p class="grand-total"><span>Estimated Total:</span> <span>${formatCurrency(quote.total || 0)}</span></p>
    </div>
  </div>

  ${(quote.paymentMethods && quote.paymentMethods.length > 0) ? `
  <div style="margin-top: 40px;">
    <div class="section-title">Accepted Payment Methods</div>
    <div>${quote.paymentMethods.map(m => `• ${m}`).join('<br>')}</div>
  </div>
  ` : ""}

</body>
</html>
  `;
}
