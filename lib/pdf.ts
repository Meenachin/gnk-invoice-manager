import PDFDocument from 'pdfkit';
import { COMPANY } from './company';
import { Invoice } from './types';
import { money, dateDMY, dateRange } from './format';
import { numberToIndianWords } from './invoice';
import fs from 'fs';
import path from 'path';

export function buildInvoicePdf(inv: Invoice): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 0,
      bufferPages: true,
    });

    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    if (inv.invoiceType === 'housekeeping') {
      drawHousekeeping(doc, inv);
    } else {
      drawCatering(doc, inv);
    }

    doc.end();
  });
}

/* =========================================================
   A4
========================================================= */

const A4_W = 595.28;
const A4_H = 841.89;

/* =========================================================
   DRAWING HELPERS
========================================================= */

function line(
  doc: PDFKit.PDFDocument,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  width = 0.7
) {
  doc
    .lineWidth(width)
    .moveTo(x1, y1)
    .lineTo(x2, y2)
    .stroke();
}

function rect(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  lineWidth = 0.7
) {
  doc
    .lineWidth(lineWidth)
    .rect(x, y, width, height)
    .stroke();
}

function text(
  doc: PDFKit.PDFDocument,
  value: string,
  x: number,
  y: number,
  width: number,
  height: number,
  options: {
    bold?: boolean;
    size?: number;
    align?: 'left' | 'center' | 'right' | 'justify';
  } = {}
) {
  doc
    .font(options.bold ? 'Helvetica-Bold' : 'Helvetica')
    .fontSize(options.size ?? 9)
    .text(value || '', x, y, {
      width,
      height,
      align: options.align ?? 'left',
      lineGap: 0,
    });
}

/* =========================================================
   CATERING PDF
   Matches the browser invoice preview proportions
========================================================= */

function drawCatering(
  doc: PDFKit.PDFDocument,
  inv: Invoice
) {
  /*
   * These dimensions correspond closely to:
   *
   * .paper {
   *   width: 794px;
   *   padding: 70px;
   * }
   *
   * converted to A4 points.
   */

  const x = 52.5;
  const w = 490.28;
  const right = x + w;

  /* -------------------------------------------------------
     TITLE
  ------------------------------------------------------- */

  text(
    doc,
    'Taxable Invoice',
    x,
    50,
    w,
    22,
    {
      bold: true,
      size: 15.5,
      align: 'center',
    }
  );

  /*
   * Browser preview has margin below title.
   */
  const tableTop = 80;

  /* -------------------------------------------------------
     MAIN HEADER TABLE
  ------------------------------------------------------- */

  const half = w / 2;

  /*
   * Company information row.
   */
  const companyRowH = 74;

  /*
   * Buyer / description row.
   */
  const buyerRowH = 56;

  const headerTotalH = companyRowH + buyerRowH;

  rect(
    doc,
    x,
    tableTop,
    w,
    headerTotalH
  );

  /* vertical centre divider */
  line(
    doc,
    x + half,
    tableTop,
    x + half,
    tableTop + headerTotalH,
    0.7
  );

  /* horizontal divider */
  line(
    doc,
    x,
    tableTop + companyRowH,
    right,
    tableTop + companyRowH,
    0.7
  );

  /* -------------------------------------------------------
     COMPANY INFORMATION
  ------------------------------------------------------- */

  const companyText =
    `${COMPANY.name}\n` +
    `${COMPANY.address[0]}\n` +
    `${COMPANY.address[1]}\n` +
    `Contact no : ${COMPANY.phone}\n` +
    `GST IN : ${COMPANY.gstin}\n` +
    `H/K code : ${COMPANY.hkCode}\n` +
    `SAC CODE : ${COMPANY.sacCode}`;

  text(
    doc,
    companyText,
    x + 5,
    tableTop + 5,
    half - 10,
    companyRowH - 10,
    {
      size: 8.8,
    }
  );

  /* -------------------------------------------------------
     INVOICE INFORMATION
  ------------------------------------------------------- */

  text(
    doc,
    `INVOICE No : ${inv.invoiceNo}\n` +
      `INVOICE DATE: ${dateDMY(inv.invoiceDate)}`,
    x + half + 5,
    tableTop + 5,
    half - 10,
    companyRowH - 10,
    {
      size: 8.8,
    }
  );

  /* -------------------------------------------------------
     BUYER
  ------------------------------------------------------- */

  const buyerText =
    `BILL TO\n` +
    `${inv.billToName}\n` +
    `${inv.billToAddress || ''}\n` +
    `GST NO : ${inv.billToGstin || ''}`;

  text(
    doc,
    buyerText,
    x + 5,
    tableTop + companyRowH + 5,
    half - 10,
    buyerRowH - 10,
    {
      size: 8.8,
    }
  );

  /* -------------------------------------------------------
     DESCRIPTION
  ------------------------------------------------------- */

  text(
    doc,
    `Description: ${inv.billDescription || ''}`,
    x + half + 5,
    tableTop + companyRowH + 5,
    half - 10,
    buyerRowH - 10,
    {
      size: 8.8,
    }
  );

  /* =======================================================
     ITEMS TABLE
  ======================================================= */

  const tableY =
    tableTop +
    headerTotalH;

  const headerH = 20;

  /*
   * Same approximate column proportions as the HTML preview:
   *
   * SNO          7%
   * DESCRIPTION 31%
   * QUANTITY     15%
   * RATE         15%
   * PER          15%
   * AMOUNT       17%
   */

  const columnWidths = [
    w * 0.07,
    w * 0.31,
    w * 0.15,
    w * 0.15,
    w * 0.15,
    w * 0.17,
  ];

  const cols = [x];

  for (const width of columnWidths) {
    cols.push(cols[cols.length - 1] + width);
  }

  const items = inv.lineItems.length
    ? inv.lineItems
    : [
        {
          description: '',
          quantity: 0,
          rate: 0,
          per: '',
          hsnSac: '',
        },
      ];

  /*
   * Normal invoice rows.
   * Enough height for the normal catering invoice
   * while keeping the whole document on one A4 page.
   */
  const rowH =
    items.length <= 5
      ? 25
      : Math.max(19, Math.min(25, 125 / items.length));

  const itemsH = rowH * items.length;

  const totalsRowH = 18;
  const totalsH = totalsRowH * 4;

  const tableH =
    headerH +
    itemsH +
    totalsH;

  rect(
    doc,
    x,
    tableY,
    w,
    tableH
  );

  /* vertical column lines */
  for (const colX of cols.slice(1, -1)) {
    line(
      doc,
      colX,
      tableY,
      colX,
      tableY + tableH,
      0.6
    );
  }

  /* -------------------------------------------------------
     TABLE HEADERS
  ------------------------------------------------------- */

  const headers = [
    'SNO',
    'DESCRIPTION',
    'QUANTITY',
    'RATE',
    'PER',
    'AMOUNT IN Rs.',
  ];

  for (let i = 0; i < headers.length; i++) {
    text(
      doc,
      headers[i],
      cols[i] + 3,
      tableY + 5,
      columnWidths[i] - 6,
      14,
      {
        bold: true,
        size: 7.5,
        align:
          i === 1
            ? 'left'
            : 'center',
      }
    );
  }

  line(
    doc,
    x,
    tableY + headerH,
    right,
    tableY + headerH,
    0.6
  );

  /* -------------------------------------------------------
     LINE ITEMS
  ------------------------------------------------------- */

  items.forEach((item, index) => {
    const rowY =
      tableY +
      headerH +
      index * rowH;

    const textY = rowY + 6;

    text(
      doc,
      String(index + 1),
      cols[0] + 3,
      textY,
      columnWidths[0] - 6,
      rowH - 4,
      {
        size: 8,
        align: 'left',
      }
    );

    text(
      doc,
      item.description || '',
      cols[1] + 4,
      textY,
      columnWidths[1] - 8,
      rowH - 4,
      {
        size: 8,
        align: 'left',
      }
    );

    text(
      doc,
      String(item.quantity ?? ''),
      cols[2] + 3,
      textY,
      columnWidths[2] - 6,
      rowH - 4,
      {
        size: 8,
        align: 'center',
      }
    );

    text(
      doc,
      money(item.rate),
      cols[3] + 3,
      textY,
      columnWidths[3] - 6,
      rowH - 4,
      {
        size: 8,
        align: 'right',
      }
    );

    text(
      doc,
      item.per || '',
      cols[4] + 3,
      textY,
      columnWidths[4] - 6,
      rowH - 4,
      {
        size: 8,
        align: 'center',
      }
    );

    text(
      doc,
      money(
        Number(item.quantity || 0) *
          Number(item.rate || 0)
      ),
      cols[5] + 3,
      textY,
      columnWidths[5] - 6,
      rowH - 4,
      {
        size: 8,
        align: 'right',
      }
    );

    line(
      doc,
      x,
      rowY + rowH,
      right,
      rowY + rowH,
      0.45
    );
  });

  /* =======================================================
     TOTALS
  ======================================================= */

  const totalsY =
    tableY +
    headerH +
    itemsH;

  const labelStart = cols[0];
  const labelEnd = cols[5];
  const amountStart = cols[5];

  const labels = [
    'TOTAL',
    `CGST ${inv.cgstRate}%`,
    `SGST ${inv.sgstRate}%`,
    'GRAND TOTAL',
  ];

  const values = [
    inv.subtotal,
    inv.taxCgst,
    inv.taxSgst,
    inv.grandTotal,
  ];

  for (let i = 0; i < 4; i++) {
    const rowY =
      totalsY +
      i * totalsRowH;

    line(
      doc,
      labelStart,
      rowY,
      right,
      rowY,
      0.45
    );

    text(
      doc,
      labels[i],
      labelStart + 5,
      rowY + 4,
      amountStart - labelStart - 10,
      13,
      {
        bold: i === 3,
        size: 8,
        align: 'right',
      }
    );

    text(
      doc,
      money(values[i]),
      amountStart + 4,
      rowY + 4,
      columnWidths[5] - 8,
      13,
      {
        bold: i === 3,
        size: 8,
        align: 'right',
      }
    );
  }

  line(
    doc,
    x,
    totalsY + totalsH,
    right,
    totalsY + totalsH,
    0.7
  );

  /* =======================================================
     AMOUNT IN WORDS
  ======================================================= */

  const wordsY =
    totalsY +
    totalsH;

  const wordsH = 24;

  rect(
    doc,
    x,
    wordsY,
    w,
    wordsH,
    0.7
  );

  text(
    doc,
    `AMOUNT CHARGEABLE IN WORDS : ${numberToIndianWords(
      inv.grandTotal
    )}`,
    x + 6,
    wordsY + 6,
    w - 12,
    14,
    {
      size: 8,
    }
  );

  /* =======================================================
     DECLARATION + BANK + SIGNATURE
  ======================================================= */

  const footerY =
    wordsY +
    wordsH;

  /*
   * Preview uses:
   * grid-template-columns: 1fr 1.55fr
   */

  const leftFooterW =
    w / 2.55;

  const rightFooterW =
    w - leftFooterW;

  const footerH = 120;

  rect(
    doc,
    x,
    footerY,
    w,
    footerH,
    0.7
  );

  line(
    doc,
    x + leftFooterW,
    footerY,
    x + leftFooterW,
    footerY + footerH,
    0.7
  );

  /*
   * Signature area on right.
   */
  const signatureTop =
    footerY + 72;

  line(
    doc,
    x + leftFooterW,
    signatureTop,
    right,
    signatureTop,
    0.7
  );

  /* -------------------------------------------------------
     DECLARATION
  ------------------------------------------------------- */

  text(
    doc,
    `DECLARATION :`,
    x + 7,
    footerY + 7,
    leftFooterW - 14,
    15,
    {
      bold: true,
      size: 9,
    }
  );

  text(
    doc,
    COMPANY.declaration,
    x + 7,
    footerY + 25,
    leftFooterW - 14,
    80,
    {
      size: 9,
    }
  );

  /* -------------------------------------------------------
     BANK DETAILS
  ------------------------------------------------------- */

  text(
    doc,
    `COMPANY BANK DETAILS :`,
    x + leftFooterW + 7,
    footerY + 7,
    rightFooterW - 14,
    15,
    {
      bold: true,
      size: 9,
    }
  );

  text(
    doc,
    `BANK NAME : ${COMPANY.bankName}\n` +
      `BRANCH NAME : ${COMPANY.branchName}\n` +
      `ACCOUNT NUMBER : ${COMPANY.accountNumber}\n` +
      `ACCOUNT TYPE : ${COMPANY.accountType}\n` +
      `IFSC CODE : ${COMPANY.ifsc}`,
    x + leftFooterW + 7,
    footerY + 25,
    rightFooterW - 14,
    55,
    {
      size: 9,
    }
  );

  /* -------------------------------------------------------
     AUTHORISED SIGNATURE
  ------------------------------------------------------- */

  text(
    doc,
    'AUTHORISED SIGNATURE',
    x + leftFooterW + 5,
    signatureTop + 10,
    rightFooterW - 10,
    15,
    {
      bold: true,
      size: 9,
      align: 'center',
    }
  );

  text(
    doc,
    '(GNK NAVEEN INDUSTRIAL CATERERS &\nMAINTAINANCE)',
    x + leftFooterW + 10,
    signatureTop + 38,
    rightFooterW - 20,
    30,
    {
      size: 8.5,
      align: 'center',
    }
  );
}

/* =========================================================
   HOUSEKEEPING PDF
   KEEPING ITS SEPARATE FORMAT
========================================================= */
function drawHousekeeping(
  doc: PDFKit.PDFDocument,
  inv: Invoice
) {
  const pageW = A4_W;
  const pageH = A4_H;

  const navy = '#123F67';
  const lightBlue = '#EAF2F8';
  const gold = '#D9A441';
  const border = '#B8C7D3';

  const margin = 28;
  const x = margin;
  const w = pageW - margin * 2;
  const right = x + w;

  /* =========================================================
     TOP HEADER
  ========================================================= */

  // White page
  doc.rect(0, 0, pageW, pageH).fill('#FFFFFF');

  // Top navy band
  doc
    .fillColor(navy)
    .rect(0, 0, pageW, 105)
    .fill();

  // Gold accent
  doc
    .fillColor(gold)
    .rect(0, 101, pageW, 5)
    .fill();

  // Existing GNK logo
  const logoPath = path.join(
    process.cwd(),
    'public',
    'gnk-header.png'
  );

  if (fs.existsSync(logoPath)) {
    doc.image(
      logoPath,
      x + 8,
      12,
      {
        width: 270,
        height: 75,
      }
    );
  }

  // GST TAX INVOICE
  text(
    doc,
    'GST TAX INVOICE',
    330,
    25,
    235,
    30,
    {
      bold: true,
      size: 21,
      align: 'center',
    }
  );

  doc
    .fillColor(gold)
    .rect(400, 59, 135, 3)
    .fill();

  /* =========================================================
     COMPANY + INVOICE INFORMATION
  ========================================================= */

  const topY = 120;
  const infoH = 145;
  const leftW = 275;
  const rightW = w - leftW;

  // Outer box
  doc
    .lineWidth(0.8)
    .strokeColor(border)
    .rect(x, topY, w, infoH)
    .stroke();

  // Divider
  line(
    doc,
    x + leftW,
    topY,
    x + leftW,
    topY + infoH,
    0.8
  );

  // Company name
  text(
    doc,
    COMPANY.name,
    x + 12,
    topY + 12,
    leftW - 24,
    20,
    {
      bold: true,
      size: 11,
    }
  );

  text(
    doc,
    `${COMPANY.address[0]}\n` +
      `${COMPANY.address[1]}\n` +
      `State Name : Telangana, Code : 36\n` +
      `GSTIN/UIN : ${COMPANY.gstin}\n` +
      `Phone no : ${COMPANY.phone}`,
    x + 12,
    topY + 38,
    leftW - 24,
    95,
    {
      size: 9,
    }
  );

  // Invoice details background
  doc
    .fillColor(lightBlue)
    .rect(
      x + leftW,
      topY,
      rightW,
      infoH
    )
    .fill();

  // Invoice details
  text(
    doc,
    `INVOICE NO.        :  ${inv.invoiceNo}`,
    x + leftW + 14,
    topY + 14,
    rightW - 28,
    18,
    {
      bold: true,
      size: 9.5,
    }
  );

  text(
    doc,
    `INVOICE DATE       :  ${dateDMY(inv.invoiceDate)}`,
    x + leftW + 14,
    topY + 38,
    rightW - 28,
    18,
    {
      bold: true,
      size: 9.5,
    }
  );

  text(
    doc,
    `DESCRIPTION OF WORK :`,
    x + leftW + 14,
    topY + 64,
    rightW - 28,
    16,
    {
      bold: true,
      size: 9,
    }
  );

  text(
    doc,
    inv.workDescription ||
      'Housekeeping and maintenance works',
    x + leftW + 14,
    topY + 82,
    rightW - 28,
    25,
    {
      size: 9,
    }
  );

  text(
    doc,
    `PERIOD OF WORK    :  ${dateRange(
      inv.periodFrom,
      inv.periodTo
    )}`,
    x + leftW + 14,
    topY + 116,
    rightW - 28,
    18,
    {
      bold: true,
      size: 9,
    }
  );

  /* =========================================================
     BUYER + BILL DESCRIPTION
  ========================================================= */

  const boxY = topY + infoH + 14;
  const boxH = 108;
  const gap = 5;
  const boxW = (w - gap) / 2;

  // BUYER
  doc
    .fillColor(navy)
    .rect(x, boxY, boxW, 27)
    .fill();

  text(
    doc,
    'BUYER',
    x + 12,
    boxY + 7,
    boxW - 24,
    15,
    {
      bold: true,
      size: 10,
    }
  );

  doc
    .lineWidth(0.8)
    .strokeColor(border)
    .rect(x, boxY, boxW, boxH)
    .stroke();

  text(
    doc,
    `${inv.billToName || ''}\n` +
      `${inv.billToAddress || ''}\n` +
      `GSTIN/UIN : ${inv.billToGstin || ''}\n` +
      `State Name : ${
        inv.billToState ||
        'Telangana, Code : 36'
      }`,
    x + 12,
    boxY + 38,
    boxW - 24,
    boxH - 42,
    {
      size: 9,
    }
  );

  // BILL DESCRIPTION
  const billX = x + boxW + gap;

  doc
    .fillColor(navy)
    .rect(billX, boxY, boxW, 27)
    .fill();

  text(
    doc,
    'BILL DESCRIPTION',
    billX + 12,
    boxY + 7,
    boxW - 24,
    15,
    {
      bold: true,
      size: 10,
    }
  );

  doc
    .lineWidth(0.8)
    .strokeColor(border)
    .rect(billX, boxY, boxW, boxH)
    .stroke();

  text(
    doc,
    inv.billDescription || '',
    billX + 12,
    boxY + 38,
    boxW - 24,
    boxH - 42,
    {
      size: 9,
    }
  );

  /* =========================================================
     ITEMS TABLE
  ========================================================= */

  const tableY = boxY + boxH + 14;

  const columns = [
    45,   // S.No.
    205,  // Description
    78,   // HSN/SAC
    70,   // Quantity
    70,   // Rate
    60,   // Per
    w - 45 - 205 - 78 - 70 - 70 - 60,
  ];

  const tableHeaders = [
    'S.No.',
    'Description of Goods',
    'HSN/SAC',
    'Quantity',
    'Rate',
    'Per',
    'Amount',
  ];

  const tableHeaderH = 32;

  const items =
    inv.lineItems.length > 0
      ? inv.lineItems.slice(0, 8)
      : [
          {
            description: '',
            quantity: 0,
            rate: 0,
            per: '',
            hsnSac: '',
          },
        ];

  const rowH = 27;
  const itemsH = items.length * rowH;

  const totalsH = 4 * 27;

  const tableH =
    tableHeaderH +
    itemsH +
    totalsH;

  // Outer table
  doc
    .lineWidth(0.8)
    .strokeColor(border)
    .rect(x, tableY, w, tableH)
    .stroke();

  // Header background
  doc
    .fillColor(navy)
    .rect(
      x,
      tableY,
      w,
      tableHeaderH
    )
    .fill();

  // Column positions
  const cols = [x];

  for (const width of columns) {
    cols.push(
      cols[cols.length - 1] + width
    );
  }

  // Vertical lines
  for (let i = 1; i < cols.length - 1; i++) {
    line(
      doc,
      cols[i],
      tableY,
      cols[i],
      tableY + tableH,
      0.5
    );
  }

  // Header text
  for (
    let i = 0;
    i < tableHeaders.length;
    i++
  ) {
    text(
      doc,
      tableHeaders[i],
      cols[i] + 3,
      tableY + 9,
      columns[i] - 6,
      15,
      {
        bold: true,
        size: 7.5,
        align:
          i === 1
            ? 'left'
            : 'center',
      }
    );
  }

  // Item rows
  items.forEach((item, index) => {
    const rowY =
      tableY +
      tableHeaderH +
      index * rowH;

    if (index % 2 === 1) {
      doc
        .fillColor('#F3F7FA')
        .rect(
          x,
          rowY,
          w,
          rowH
        )
        .fill();
    }

    text(
      doc,
      String(index + 1),
      cols[0] + 3,
      rowY + 8,
      columns[0] - 6,
      15,
      {
        size: 8,
        align: 'center',
      }
    );

    text(
      doc,
      item.description || '',
      cols[1] + 5,
      rowY + 8,
      columns[1] - 10,
      15,
      {
        size: 8,
      }
    );

    text(
      doc,
      item.hsnSac || '998533',
      cols[2] + 3,
      rowY + 8,
      columns[2] - 6,
      15,
      {
        size: 8,
        align: 'center',
      }
    );

    text(
      doc,
      String(item.quantity ?? ''),
      cols[3] + 3,
      rowY + 8,
      columns[3] - 6,
      15,
      {
        size: 8,
        align: 'center',
      }
    );

    text(
      doc,
      money(item.rate),
      cols[4] + 3,
      rowY + 8,
      columns[4] - 6,
      15,
      {
        size: 8,
        align: 'right',
      }
    );

    text(
      doc,
      item.per || 'Quantity',
      cols[5] + 3,
      rowY + 8,
      columns[5] - 6,
      15,
      {
        size: 8,
        align: 'center',
      }
    );

    text(
      doc,
      money(
        Number(item.quantity || 0) *
          Number(item.rate || 0)
      ),
      cols[6] + 3,
      rowY + 8,
      columns[6] - 6,
      15,
      {
        size: 8,
        align: 'right',
      }
    );

    line(
      doc,
      x,
      rowY + rowH,
      right,
      rowY + rowH,
      0.45
    );
  });

  /* =========================================================
     TOTALS
  ========================================================= */

  const totalsY =
    tableY +
    tableHeaderH +
    itemsH;

  const labels = [
    'TOTAL',
    `CGST @ ${inv.cgstRate}%`,
    `SGST @ ${inv.sgstRate}%`,
    'GRAND TOTAL',
  ];

  const values = [
    inv.subtotal,
    inv.taxCgst,
    inv.taxSgst,
    inv.grandTotal,
  ];

  for (let i = 0; i < 4; i++) {
    const yy =
      totalsY +
      i * 27;

    if (i === 3) {
      doc
        .fillColor(navy)
        .rect(
          cols[5],
          yy,
          columns[5] + columns[6],
          27
        )
        .fill();
    } else {
      doc
        .fillColor(lightBlue)
        .rect(
          cols[5],
          yy,
          columns[5] + columns[6],
          27
        )
        .fill();
    }

    text(
      doc,
      labels[i],
      cols[5] + 5,
      yy + 7,
      columns[5] - 10,
      15,
      {
        bold: true,
        size: i === 3 ? 9 : 8,
        align: 'right',
      }
    );

    text(
      doc,
      money(values[i]),
      cols[6] + 5,
      yy + 7,
      columns[6] - 10,
      15,
      {
        bold: true,
        size: i === 3 ? 10 : 8,
        align: 'right',
      }
    );

    line(
      doc,
      cols[5],
      yy + 27,
      right,
      yy + 27,
      0.4
    );
  }

  /* =========================================================
     AMOUNT IN WORDS
  ========================================================= */

  const wordsY =
    tableY + tableH + 12;

  doc
    .fillColor(lightBlue)
    .rect(x, wordsY, w, 55)
    .fill();

  doc
    .lineWidth(0.8)
    .strokeColor(border)
    .rect(x, wordsY, w, 55)
    .stroke();

  text(
    doc,
    'AMOUNT CHARGEABLE IN WORDS :',
    x + 12,
    wordsY + 10,
    w - 24,
    15,
    {
      bold: true,
      size: 8.5,
    }
  );

  text(
    doc,
    numberToIndianWords(
      inv.grandTotal
    ),
    x + 12,
    wordsY + 28,
    w - 24,
    20,
    {
      size: 8.5,
    }
  );

  /* =========================================================
     ACCOUNT DETAILS + SIGNATURE
  ========================================================= */

  const footerY =
    wordsY + 67;

  const footerH = 115;
  const half = w / 2;

  // Account box
  doc
    .fillColor(navy)
    .rect(x, footerY, half - 4, 27)
    .fill();

  text(
    doc,
    'ACCOUNT DETAILS',
    x + 12,
    footerY + 7,
    half - 28,
    15,
    {
      bold: true,
      size: 10,
    }
  );

  doc
    .lineWidth(0.8)
    .strokeColor(border)
    .rect(
      x,
      footerY,
      half - 4,
      footerH
    )
    .stroke();

  text(
    doc,
    `BANK NAME       : ${COMPANY.bankName}\n` +
      `BRANCH NAME     : ${COMPANY.branchName}\n` +
      `ACCOUNT NUMBER  : ${COMPANY.accountNumber}\n` +
      `ACCOUNT TYPE    : ${COMPANY.accountType}\n` +
      `IFSC CODE       : ${COMPANY.ifsc}`,
    x + 12,
    footerY + 40,
    half - 28,
    70,
    {
      size: 8.5,
    }
  );

  // Signature box
  const sigX = x + half + 4;

  doc
    .fillColor(navy)
    .rect(
      sigX,
      footerY,
      half - 4,
      27
    )
    .fill();

  text(
    doc,
    'AUTHORISED SIGNATURE',
    sigX + 12,
    footerY + 7,
    half - 28,
    15,
    {
      bold: true,
      size: 10,
    }
  );

  doc
    .lineWidth(0.8)
    .strokeColor(border)
    .rect(
      sigX,
      footerY,
      half - 4,
      footerH
    )
    .stroke();

  line(
    doc,
    sigX + 30,
    footerY + 82,
    sigX + half - 34,
    footerY + 82,
    0.8
  );

  text(
    doc,
    'GNK NAVEEN INDUSTRIAL CATERERS & MAINTAINANCE',
    sigX + 15,
    footerY + 92,
    half - 30,
    18,
    {
      bold: true,
      size: 7.5,
      align: 'center',
    }
  );

  /* =========================================================
     BOTTOM GOLD/NAVY ACCENT
  ========================================================= */

  doc
    .fillColor(gold)
    .rect(0, pageH - 13, pageW, 5)
    .fill();

  doc
    .fillColor(navy)
    .rect(0, pageH - 8, pageW, 8)
    .fill();
}
    
