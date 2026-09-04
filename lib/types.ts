export type InvoiceType = 'catering' | 'housekeeping';
export type LineItem = { description: string; quantity: number; rate: number; per?: string; hsnSac?: string };
export type Invoice = {
  id: string;
  invoiceType: InvoiceType;
  invoiceNo: string;
  invoiceDate: string;
  periodFrom?: string | null;
  periodTo?: string | null;
  workDescription?: string | null;
  billToName: string;
  billToAddress?: string | null;
  billToGstin?: string | null;
  billToState?: string | null;
  billDescription?: string | null;
  lineItems: LineItem[];
  cgstRate: number;
  sgstRate: number;
  taxCgst: number;
  taxSgst: number;
  subtotal: number;
  grandTotal: number;
  createdAt?: string;
  updatedAt?: string;
};

export type InvoiceInput = Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'subtotal' | 'grandTotal' | 'taxCgst' | 'taxSgst'>;
