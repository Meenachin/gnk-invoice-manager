import { z } from 'zod';

export const invoiceSchema = z.object({
  invoiceType: z.enum(['catering','housekeeping']),
  invoiceNo: z.string().min(1),
  invoiceDate: z.string().min(1),
  periodFrom: z.string().nullable().optional(),
  periodTo: z.string().nullable().optional(),
  workDescription: z.string().optional(),
  billToName: z.string().min(1),
  billToAddress: z.string().optional(),
  billToGstin: z.string().optional(),
  billToState: z.string().optional(),
  billDescription: z.string().optional(),
  lineItems: z.array(z.object({ description: z.string(), quantity: z.number(), rate: z.number(), per: z.string().optional(), hsnSac: z.string().optional() })),
  cgstRate: z.number().min(0).max(100),
  sgstRate: z.number().min(0).max(100)
});
