
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ExcelJS from 'exceljs';

export const runtime = 'nodejs';

function parseLineItems(value: any): any[] {
  if (Array.isArray(value)) return value;

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

function formatHeader(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function excelValue(value: any): any {
  if (value === null || value === undefined) return '';

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return value;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    if (type !== 'catering' && type !== 'housekeeping') {
      return NextResponse.json(
        { error: 'Invalid invoice type' },
        { status: 400 }
      );
    }

    const sql = db();

    // Get complete invoices from Neon database
    const invoices = await sql`
      SELECT *
      FROM invoices
      WHERE invoice_type = ${type}
      ORDER BY invoice_date DESC, created_at DESC
    `;

    const workbook = new ExcelJS.Workbook();

    workbook.creator = 'GNK Invoice Manager';
    workbook.created = new Date();

    // SHEET 1: INVOICE SUMMARY
    const summarySheet =
      workbook.addWorksheet('Invoice Summary');

    const summaryKeys = Array.from(
      new Set(
        invoices.flatMap((invoice: any) =>
          Object.keys(invoice).filter(
            (key) => key !== 'line_items'
          )
        )
      )
    );

    const summaryColumns = summaryKeys.length
      ? summaryKeys
      : [
          'invoice_no',
          'invoice_date',
          'invoice_type',
          'bill_to_name',
          'bill_to_address',
          'bill_to_gstin',
          'subtotal',
          'tax_cgst',
          'tax_sgst',
          'grand_total',
        ];

    summarySheet.columns = summaryColumns.map((key) => ({
      header: formatHeader(key),
      key,
      width: Math.max(18, formatHeader(key).length + 5),
    }));

    invoices.forEach((invoice: any) => {
      const row: Record<string, any> = {};

      summaryColumns.forEach((key) => {
        row[key] = excelValue(invoice[key]);
      });

      summarySheet.addRow(row);
    });

    // SHEET 2: COMPLETE INVOICE ITEMS
    const itemsSheet =
      workbook.addWorksheet('Invoice Items');

    const allItems: any[] = [];

    invoices.forEach((invoice: any) => {
      const items = parseLineItems(invoice.line_items);

      items.forEach((item: any, index: number) => {
        allItems.push({
          invoice_no: invoice.invoice_no,
          invoice_date: invoice.invoice_date,
          customer_name: invoice.bill_to_name,
          invoice_id: invoice.id,
          item_number: index + 1,
          ...(item && typeof item === 'object'
            ? item
            : { description: String(item) }),
        });
      });
    });

    const itemKeys = Array.from(
      new Set(
        allItems.flatMap((item) => Object.keys(item))
      )
    );

    const itemColumns = itemKeys.length
      ? itemKeys
      : [
          'invoice_no',
          'invoice_date',
          'customer_name',
          'invoice_id',
          'item_number',
          'description',
          'quantity',
          'rate',
          'amount',
        ];

    itemsSheet.columns = itemColumns.map((key) => ({
      header: formatHeader(key),
      key,
      width: Math.max(18, formatHeader(key).length + 5),
    }));

    allItems.forEach((item) => {
      const row: Record<string, any> = {};

      itemColumns.forEach((key) => {
        row[key] = excelValue(item[key]);
      });

      itemsSheet.addRow(row);
    });

    // FORMAT BOTH SHEETS
    [summarySheet, itemsSheet].forEach((sheet) => {
      sheet.views = [{ state: 'frozen', ySplit: 1 }];

      sheet.autoFilter = {
        from: 'A1',
        to: {
          row: 1,
          column: sheet.columns.length,
        },
      };

      const header = sheet.getRow(1);

      header.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' },
      };

      header.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF17365D' },
      };

      header.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      };

      header.height = 25;
    });

    // GENERATE EXCEL FILE
    const buffer = await workbook.xlsx.writeBuffer();

    const filename =
      type === 'catering'
        ? 'GNK_Catering_Invoices.xlsx'
        : 'GNK_Housekeeping_Invoices.xlsx';

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition':
          `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });

  } catch (error: any) {
    console.error('Excel export error:', error);

    return NextResponse.json(
      {
        error:
          error.message || 'Unable to export invoices',
      },
      { status: 500 }
    );
  }
}
