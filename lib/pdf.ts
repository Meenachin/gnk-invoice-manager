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
  const logoPath = path.join(
    process.cwd(),
    'public',
    'gnk-header.png'
  );

  if (fs.existsSync(logoPath)) {
    doc.image(
      logoPath,
      45,
      20,
      {
        width: 505,
        height: 113,
      }
    );
  }

  text(
    doc,
    'GST TAX INVOICE',
    62,
    144,
    471,
    14,
    {
      bold: true,
      size: 8,
      align: 'center',
    }
  );

  const x = 49;
  const y = 154;
  const w = 488;
  const left = 236;
  const right = w - left;

  rect(doc, x, y, w, 405);

  line(
    doc,
    x + left,
    y,
    x + left,
    y + 156,
    0.8
  );

  line(
    doc,
    x,
    y + 78,
    x + w,
    y + 78,
    0.8
  );

  line(
    doc,
    x,
    y + 156,
    x + w,
    y + 156,
    0.8
  );

  text(
    doc,
    `${COMPANY.name.toUpperCase()}\n` +
      `# ${COMPANY.address[0].replace(',', '')}\n` +
      `${COMPANY.address[1].replace(',', '')}\n` +
      `State Name : Telangana, Code : 36\n` +
      `GSTIN/UIN : ${COMPANY.gstin}\n` +
      `Phone no : ${COMPANY.phone}`,
    x + 5,
    y + 5,
    left - 10,
    70,
    {
      size: 7.2,
      bold: true,
    }
  );

  text(
    doc,
    `INVOICE NO. ${inv.invoiceNo}\n\n` +
      `Invoice date : ${dateDMY(inv.invoiceDate)}\n` +
      `Description of work : ${
        inv.workDescription ||
        'Housekeeping and maintenance works'
      }\n` +
      `Period of work : ${dateRange(
        inv.periodFrom,
        inv.periodTo
      )}`,
    x + left + 5,
    y + 5,
    right - 10,
    68,
    {
      size: 7.2,
    }
  );

  text(
    doc,
    `Buyer\n` +
      `${inv.billToName}\n` +
      `${inv.billToAddress || ''}\n` +
      `GSTIN/UIN        : ${inv.billToGstin || ''}\n` +
      `State Name       : ${
        inv.billToState ||
        'Telangana, Code : 36'
      }`,
    x + 5,
    y + 82,
    left - 10,
    68,
    {
      size: 7.1,
    }
  );

  text(
    doc,
    `BILL Description :\n` +
      `${inv.billDescription || ''}`,
    x + left + 5,
    y + 82,
    right - 10,
    68,
    {
      size: 7.1,
    }
  );

  const ty = y + 156;

  const cols = [
    x,
    x + 42,
    x + 240,
    x + 302,
    x + 356,
    x + 407,
    x + w,
  ];

  const hh = 22;

  const visibleItems =
    inv.lineItems.slice(0, 8);

  const itemArea = Math.max(
    100,
    visibleItems.length * 28
  );

  const tableH =
    hh +
    itemArea +
    80;

  rect(
    doc,
    x,
    ty,
    w,
    tableH
  );

  cols.forEach((cx) => {
    line(
      doc,
      cx,
      ty,
      cx,
      ty + tableH,
      0.6
    );
  });

  [
    'S.No.',
    'Description of Goods',
    'HSN/SAC',
    'Quantity',
    'Rate',
    'Per',
    'Amount',
  ].forEach((header, i) => {
    text(
      doc,
      header,
      cols[i] + 3,
      ty + 5,
      cols[i + 1] - cols[i] - 6,
      15,
      {
        bold: true,
        size: 6.7,
        align:
          i === 1
            ? 'left'
            : 'center',
      }
    );
  });

  line(
    doc,
    x,
    ty + hh,
    x + w,
    ty + hh,
    0.6
  );

  const rowH = itemArea;

  visibleItems.forEach((item, index) => {
    const yy =
      ty +
      hh +
      (index * rowH) /
        Math.max(
          1,
          visibleItems.length
        );

    const rh =
      rowH /
      Math.max(
        1,
        visibleItems.length
      );

    text(
      doc,
      String(index + 1),
      cols[0] + 3,
      yy + 7,
      35,
      rh,
      {
        size: 6.8,
      }
    );

    text(
      doc,
      item.description,
      cols[1] + 5,
      yy + 7,
      cols[2] - cols[1] - 10,
      rh,
      {
        size: 6.8,
      }
    );

    text(
      doc,
      item.hsnSac || '998533',
      cols[2] + 3,
      yy + 7,
      cols[3] - cols[2] - 6,
      rh,
      {
        size: 6.8,
        align: 'center',
      }
    );

    text(
      doc,
      String(item.quantity),
      cols[3] + 3,
      yy + 7,
      cols[4] - cols[3] - 6,
      rh,
      {
        size: 6.8,
        align: 'center',
      }
    );

    text(
      doc,
      money(item.rate),
      cols[4] + 3,
      yy + 7,
      cols[5] - cols[4] - 6,
      rh,
      {
        size: 6.8,
        align: 'center',
      }
    );

    text(
      doc,
      item.per || 'Quantity',
      cols[5] + 3,
      yy + 7,
      cols[6] - cols[5] - 6,
      rh,
      {
        size: 6.8,
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
      yy + 7,
      45,
      rh,
      {
        size: 6.8,
        align: 'right',
      }
    );

    line(
      doc,
      x,
      yy + rh,
      x + w,
      yy + rh,
      0.4
    );
  });

  const sy =
    ty +
    hh +
    itemArea;

  const totalLabels = [
    'TOTAL',
    `CGST ${inv.cgstRate}%`,
    `SGST ${inv.sgstRate}%`,
    'TOTAL',
  ];

  const totalValues = [
    inv.subtotal,
    inv.taxCgst,
    inv.taxSgst,
    inv.grandTotal,
  ];

  totalLabels.forEach((label, index) => {
    const yy = sy + index * 20;

    text(
      doc,
      label,
      x + 240,
      yy + 4,
      167,
      13,
      {
        size: 6.8,
        align: 'right',
        bold: index === 3,
      }
    );

    text(
      doc,
      money(totalValues[index]),
      x + 407,
      yy + 4,
      76,
      13,
      {
        size: 6.8,
        align: 'right',
        bold: index === 3,
      }
    );

    line(
      doc,
      x + 240,
      yy,
      x + w,
      yy,
      0.4
    );
  });

  const wordsY =
    ty +
    hh +
    itemArea +
    80;

  text(
    doc,
    `Amount Chargeable (in words): ${numberToIndianWords(
      inv.grandTotal
    )}`,
    x + 5,
    wordsY + 7,
    w - 10,
    22,
    {
      size: 6.8,
    }
  );

  text(
    doc,
    `Account Details\n` +
      `Account no : ${COMPANY.accountNumber}\n` +
      `Account Name : ${COMPANY.name}\n` +
      `Account type : ${COMPANY.accountType}\n` +
      `IFSC Code : ${COMPANY.ifsc}\n` +
      `Branch Name : ${COMPANY.branchName}`,
    x + 5,
    wordsY + 34,
    260,
    70,
    {
      size: 6.8,
    }
  );

  rect(
    doc,
    x + 260,
    wordsY + 30,
    228,
    82,
    0.6
  );

  text(
    doc,
    `For ${COMPANY.name}`,
    x + 270,
    wordsY + 36,
    208,
    15,
    {
      size: 6.8,
      align: 'center',
    }
  );

  text(
    doc,
    'Authorised Signatory',
    x + 340,
    wordsY + 80,
    130,
    14,
    {
      size: 6.8,
      align: 'right',
    }
  );
}
