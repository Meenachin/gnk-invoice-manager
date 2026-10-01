'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { money, dateDMY } from '@/lib/format';

type InvoiceType = 'catering' | 'housekeeping';

export default function Invoices() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoiceType, setInvoiceType] =
    useState<InvoiceType>('catering');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const type =
      params.get('type') === 'housekeeping'
        ? 'housekeeping'
        : 'catering';

    setInvoiceType(type);

    load(type);
  }, []);

  async function load(type: InvoiceType) {
    try {
      setLoading(true);

      const response = await fetch('/api/invoices', {
        cache: 'no-store',
      });

      const result = await response.json();

      const allInvoices = result.invoices || [];

      const filteredInvoices = allInvoices.filter(
        (invoice: any) =>
          invoice.invoice_type === type
      );

      setData(filteredInvoices);
    } catch (error) {
      console.error('Unable to load invoices:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  const isHousekeeping =
    invoiceType === 'housekeeping';

  return (
    <main className="container">

      {/* PAGE HEADER */}
     <div
  style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '20px',
  }}
>
  <div>
    <h1 style={{ margin: '0 0 5px' }}>
      {isHousekeeping
        ? 'Housekeeping Bills History'
        : 'Catering Bills History'}
    </h1>

    <span className="muted">
      {isHousekeeping
        ? 'View and manage saved housekeeping bills.'
        : 'View and manage saved catering bills.'}
    </span>
  </div>

  <Link
    className="btn"
    href={
      isHousekeeping
        ? '/invoices/new?type=housekeeping'
        : '/invoices/new?type=catering'
    }
    style={{
      whiteSpace: 'nowrap',
      flexShrink: 0,
    }}
  >
    {isHousekeeping
      ? '+ New Housekeeping Invoice'
      : '+ New Catering Invoice'}
  </Link>
</div>


      {/* HISTORY TABLE */}
      <div className="table-wrap">

        {loading ? (
          <div style={{ padding: 25 }}>
            Loading bills...
          </div>
        ) : (
          <table className="data-table">

            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Grand Total</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {data.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    No{' '}
                    {isHousekeeping
                      ? 'housekeeping'
                      : 'catering'}{' '}
                    bills found.
                  </td>
                </tr>
              ) : (
                data.map((invoice) => (
                  <tr key={invoice.id}>

                    {/* INVOICE NUMBER */}
                    <td>
                      <b>
                        {invoice.invoice_no}
                      </b>
                    </td>

                    {/* DATE */}
                    <td>
                      {dateDMY(
                        invoice.invoice_date
                      )}
                    </td>

                    {/* CUSTOMER */}
                    <td>
                      {invoice.bill_to_name}
                    </td>

                    {/* GRAND TOTAL */}
                    <td>
                      ₹{' '}
                      {money(
                        Number(
                          invoice.grand_total
                        )
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td>

                      <div
                        style={{
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                        }}
                      >

                        {/* VIEW / EDIT */}
                        <Link
                          className="btn secondary"
                          href={`/invoices/${invoice.id}?edit=1`}
                        >
                          View / Edit
                        </Link>

                        {/* PDF DOWNLOAD */}
                       <button
  type="button"
  className="btn secondary"
  onClick={() => window.print()}
>
  Print
</button>

                      </div>

                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>
        )}

      </div>

    </main>
  );
}
