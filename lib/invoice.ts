import { InvoiceInput, LineItem } from './types';

export function calculateTotals(items: LineItem[], cgstRate: number, sgstRate: number) {
  const subtotal = round(items.reduce((sum, x) => sum + Number(x.quantity || 0) * Number(x.rate || 0), 0));
  const taxCgst = round(subtotal * Number(cgstRate || 0) / 100);
  const taxSgst = round(subtotal * Number(sgstRate || 0) / 100);
  return { subtotal, taxCgst, taxSgst, grandTotal: round(subtotal + taxCgst + taxSgst) };
}

export function round(n: number) { return Math.round((n + Number.EPSILON) * 100) / 100; }

const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
function two(n: number) { if (n < 20) return ones[n]; return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : ''); }
function three(n: number) { return n >= 100 ? ones[Math.floor(n / 100)] + ' HUNDRED' + (n % 100 ? ' ' + two(n % 100) : '') : two(n); }
export function numberToIndianWords(amount: number) {
  const rupees = Math.floor(Math.abs(amount));
  const paise = Math.round((Math.abs(amount) - rupees) * 100);
  if (rupees === 0 && paise === 0) return 'ZERO RUPEES ONLY';
  let n = rupees;
  const parts: string[] = [];
  const crore = Math.floor(n / 10000000); n %= 10000000;
  const lakh = Math.floor(n / 100000); n %= 100000;
  const thousand = Math.floor(n / 1000); n %= 1000;
  if (crore) parts.push(three(crore) + ' CRORE');
  if (lakh) parts.push(three(lakh) + ' LAKH');
  if (thousand) parts.push(three(thousand) + ' THOUSAND');
  if (n) parts.push(three(n));
  let result = parts.join(' ') + ' RUPEES';
  if (paise) result += ' ' + two(paise) + ' PAISA';
  return result + ' ONLY';
}

export function normalizeInput(body: any): InvoiceInput {
  const lineItems = Array.isArray(body.lineItems) ? body.lineItems.map((x: any) => ({
    description: String(x.description ?? '').trim(),
    quantity: Number(x.quantity ?? 0),
    rate: Number(x.rate ?? 0),
    per: String(x.per ?? ''),
    hsnSac: String(x.hsnSac ?? '')
  })).filter((x: LineItem) => x.description || x.quantity || x.rate) : [];
  const cgstRate = Number(body.cgstRate ?? 0);
  const sgstRate = Number(body.sgstRate ?? 0);
  return {
    invoiceType: body.invoiceType === 'housekeeping' ? 'housekeeping' : 'catering',
    invoiceNo: String(body.invoiceNo ?? '').trim(),
    invoiceDate: String(body.invoiceDate ?? ''),
    periodFrom: body.periodFrom ? String(body.periodFrom) : null,
    periodTo: body.periodTo ? String(body.periodTo) : null,
    workDescription: String(body.workDescription ?? ''),
    billToName: String(body.billToName ?? '').trim(),
    billToAddress: String(body.billToAddress ?? ''),
    billToGstin: String(body.billToGstin ?? ''),
    billToState: String(body.billToState ?? ''),
    billDescription: String(body.billDescription ?? ''),
    lineItems,
    cgstRate,
    sgstRate
  };
}
