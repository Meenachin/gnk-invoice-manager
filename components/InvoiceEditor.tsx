'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import InvoicePreview from './InvoicePreview';
import { Invoice, InvoiceInput, LineItem } from '@/lib/types';
import { calculateTotals } from '@/lib/invoice';

type Props = {
  id?: string;
  type?: 'catering' | 'housekeeping';
};

const companyDefaults = {
  phone: '9701055662',
  gstin: '36BMTPG2251D1Z6',
  hkCode: '00440318',
};

function createBlankInvoice(
  type: 'catering' | 'housekeeping'
): InvoiceInput {
  return {
    invoiceType: type,
    invoiceNo: '',
    invoiceDate: new Date().toISOString().slice(0, 10),

    periodFrom: type === 'housekeeping' ? '' : null,
    periodTo: type === 'housekeeping' ? '' : null,

    workDescription:
      type === 'housekeeping'
        ? 'Housekeeping and maintenance works'
        : '',

    billToName: '',
    billToAddress: '',
    billToGstin: '',
    billToState: 'Telangana, Code : 36',

    billDescription: '',

    lineItems: [
      {
        description: '',
        quantity: 1,
        rate: 0,
        per: 'Quantity',
        hsnSac: type === 'housekeeping' ? '998533' : '',
      },
    ],

    cgstRate: type === 'catering' ? 2.5 : 9,
    sgstRate: type === 'catering' ? 2.5 : 9,
  };
}

function calculateInvoice(input: InvoiceInput): Invoice {
  const totals = calculateTotals(
    input.lineItems,
    input.cgstRate,
    input.sgstRate
  );

  return {
    ...input,
    id: 'preview',
    ...totals,
  };
}

function formatMoney(value: number) {
  return `₹ ${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value?: string | null) {
  if (!value) return '-';

  const parts = String(value).slice(0, 10).split('-');

  if (parts.length !== 3) return value;

  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

export default function InvoiceEditor({
  id,
  type = 'catering',
}: Props) {
  const [form, setForm] = useState<InvoiceInput>(
    createBlankInvoice(type)
  );

  const [loading, setLoading] = useState(Boolean(id));
  const [editing, setEditing] = useState(!id);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const invoice = useMemo(
    () => calculateInvoice(form),
    [form]
  );

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function loadInvoice() {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `/api/invoices/${id}`,
          {
            cache: 'no-store',
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error || 'Unable to load invoice'
          );
        }

        if (!data.invoice) {
          throw new Error('Invoice not found');
        }

        const item = data.invoice;

        if (cancelled) return;

        const invoiceType =
          item.invoice_type === 'housekeeping'
            ? 'housekeeping'
            : 'catering';

        setForm({
          invoiceType,
          invoiceNo: item.invoice_no || '',
          invoiceDate: String(item.invoice_date || '').slice(
            0,
            10
          ),

          periodFrom: item.period_from
            ? String(item.period_from).slice(0, 10)
            : null,

          periodTo: item.period_to
            ? String(item.period_to).slice(0, 10)
            : null,

          workDescription:
            item.work_description || '',

          billToName:
            item.bill_to_name || '',

          billToAddress:
            item.bill_to_address || '',

          billToGstin:
            item.bill_to_gstin || '',

          billToState:
            item.bill_to_state || '',

          billDescription:
            item.bill_description || '',

          lineItems: Array.isArray(item.line_items)
            ? item.line_items.map((line: any) => ({
                description: line.description || '',
                quantity: Number(line.quantity || 0),
                rate: Number(line.rate || 0),
                per: line.per || '',
                hsnSac: line.hsnSac || '',
              }))
            : [],

          cgstRate:
            invoiceType === 'catering'
              ? 2.5
              : 9,

          sgstRate:
            invoiceType === 'catering'
              ? 2.5
              : 9,
        });
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err?.message || 'Unable to load invoice'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInvoice();

    return () => {
      cancelled = true;
    };
  }, [id]);

  function updateField<K extends keyof InvoiceInput>(
    key: K,
    value: InvoiceInput[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setMessage('');
    setError('');
  }

  function updateLine(
    index: number,
    key: keyof LineItem,
    value: string
  ) {
    setForm((current) => ({
      ...current,

      lineItems: current.lineItems.map(
        (item, itemIndex) => {
          if (itemIndex !== index) {
            return item;
          }

          if (
            key === 'quantity' ||
            key === 'rate'
          ) {
            return {
              ...item,
              [key]:
                value === ''
                  ? 0
                  : Number(value),
            };
          }

          return {
            ...item,
            [key]: value,
          };
        }
      ),
    }));

    setMessage('');
    setError('');
  }

  function addLine() {
    setForm((current) => ({
      ...current,

      lineItems: [
        ...current.lineItems,

        {
          description: '',
          quantity: 1,
          rate: 0,
          per: 'Quantity',
          hsnSac:
            current.invoiceType === 'housekeeping'
              ? '998533'
              : '',
        },
      ],
    }));
  }

  function removeLine(index: number) {
    if (form.lineItems.length === 1) {
      return;
    }

    setForm((current) => ({
      ...current,

      lineItems: current.lineItems.filter(
        (_, itemIndex) =>
          itemIndex !== index
      ),
    }));
  }

  async function saveInvoice() {
    setSaving(true);
    setMessage('');
    setError('');

    try {
      if (!form.invoiceNo.trim()) {
        throw new Error(
          'Invoice number is required.'
        );
      }

      if (!form.invoiceDate) {
        throw new Error(
          'Invoice date is required.'
        );
      }

      if (!form.billToName.trim()) {
        throw new Error(
          'Buyer name is required.'
        );
      }

      if (form.lineItems.length === 0) {
        throw new Error(
          'Add at least one line item.'
        );
      }

      const response = await fetch(
        id
          ? `/api/invoices/${id}`
          : '/api/invoices',
        {
          method: id ? 'PUT' : 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data?.error === 'string'
            ? data.error
            : 'Unable to save invoice.'
        );
      }

      setMessage(
        id
          ? 'Invoice updated successfully.'
          : 'Invoice created successfully.'
      );

      setEditing(false);

      if (!id && data?.invoice?.id) {
        window.location.href =
          `/invoices/${data.invoice.id}`;
      }
    } catch (err: any) {
      setError(
        err?.message ||
          'Unable to save invoice.'
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="invoice-loading">
        <div className="loading-spinner" />
        <h3>Loading invoice...</h3>
        <p>Please wait while we load the saved invoice.</p>
      </div>
    );
  }

  if (error && !form.invoiceNo) {
    return (
      <div className="invoice-error-page">
        <h2>Unable to load invoice</h2>
        <p>{error}</p>

        <Link
          href="/invoices"
          className="btn"
        >
          Back to Invoices
        </Link>
      </div>
    );
  }

  const isHousekeeping =
    form.invoiceType === 'housekeeping';

  return (
    <div className="invoice-page">

      {/* HEADER */}
      <div className="invoice-page-header">

        <div className="header-left">

          <Link
            href="/invoices"
            className="back-link"
          >
            ← Invoices
          </Link>

          <div className="title-row">

            <div>
              <div className="eyebrow">
                GNK INVOICE MANAGER
              </div>

              <h1>
                {isHousekeeping
                  ? 'Housekeeping Invoice'
                  : 'Catering Invoice'}
              </h1>

              <p>
                {id
                  ? `Invoice ${form.invoiceNo || '—'}`
                  : 'Create a new invoice'}
              </p>
            </div>

            <span
              className={
                editing
                  ? 'status-badge editing'
                  : 'status-badge saved'
              }
            >
              {editing
                ? 'Editing'
                : 'Saved'}
            </span>

          </div>

        </div>

        <div className="header-actions">

          {!editing && id && (
            <button
              type="button"
              className="btn primary"
              onClick={() => {
                setEditing(true);
                setMessage('');
                setError('');
              }}
            >
              ✎ Edit Invoice
            </button>
          )}

          {id && (
            <>
              <a
                className="btn secondary"
                href={`/api/invoices/${id}/pdf`}
                target="_blank"
                rel="noreferrer"
              >
                PDF
              </a>

              <a
                className="btn secondary"
                href={`/api/invoices/${id}/docx`}
              >
                DOCX
              </a>

              <button
                type="button"
                className="btn secondary"
                onClick={() => window.print()}
              >
                Print
              </button>
            </>
          )}

        </div>

      </div>

      {/* MESSAGE */}
      {message && (
        <div className="alert success-alert">
          <span>✓</span>
          {message}
        </div>
      )}

      {error && (
        <div className="alert error-alert">
          <span>!</span>
          {error}
        </div>
      )}

      {/* EDIT MODE */}
      {editing ? (
        <div className="editor-layout">

          <div className="editor-column">

            {/* INVOICE DETAILS */}
            <section className="editor-card">

              <div className="card-heading">
                <div>
                  <span className="section-number">
                    01
                  </span>

                  <div>
                    <h2>Invoice Details</h2>
                    <p>
                      Basic information for this invoice
                    </p>
                  </div>
                </div>
              </div>

              <div className="field-grid">

                <div className="field">
                  <label>
                    Invoice Number
                    <span>*</span>
                  </label>

                  <input
                    value={form.invoiceNo}
                    onChange={(e) =>
                      updateField(
                        'invoiceNo',
                        e.target.value
                      )
                    }
                    placeholder={
                      isHousekeeping
                        ? 'GNK/JUN26/DW2'
                        : 'SBI/AUG26/A1'
                    }
                  />
                </div>

                <div className="field">
                  <label>
                    Invoice Date
                    <span>*</span>
                  </label>

                  <input
                    type="date"
                    value={form.invoiceDate}
                    onChange={(e) =>
                      updateField(
                        'invoiceDate',
                        e.target.value
                      )
                    }
                  />
                </div>

              </div>

              {isHousekeeping && (
                <>
                  <div className="field">
                    <label>
                      Description of Work
                    </label>

                    <input
                      value={
                        form.workDescription || ''
                      }
                      onChange={(e) =>
                        updateField(
                          'workDescription',
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="field-grid">

                    <div className="field">
                      <label>
                        Period From
                      </label>

                      <input
                        type="date"
                        value={
                          form.periodFrom || ''
                        }
                        onChange={(e) =>
                          updateField(
                            'periodFrom',
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="field">
                      <label>
                        Period To
                      </label>

                      <input
                        type="date"
                        value={
                          form.periodTo || ''
                        }
                        onChange={(e) =>
                          updateField(
                            'periodTo',
                            e.target.value
                          )
                        }
                      />
                    </div>

                  </div>
                </>
              )}

            </section>

            {/* BUYER */}
            <section className="editor-card">

              <div className="card-heading">
                <div>
                  <span className="section-number">
                    02
                  </span>

                  <div>
                    <h2>Buyer Information</h2>
                    <p>
                      Customer information printed on the invoice
                    </p>
                  </div>
                </div>
              </div>

              <div className="field">

                <label>
                  Buyer Name
                  <span>*</span>
                </label>

                <textarea
                  rows={3}
                  value={form.billToName}
                  onChange={(e) =>
                    updateField(
                      'billToName',
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="field">

                <label>
                  Buyer Address
                </label>

                <textarea
                  rows={4}
                  value={
                    form.billToAddress || ''
                  }
                  onChange={(e) =>
                    updateField(
                      'billToAddress',
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="field-grid">

                <div className="field">

                  <label>
                    GSTIN / UIN
                  </label>

                  <input
                    value={
                      form.billToGstin || ''
                    }
                    onChange={(e) =>
                      updateField(
                        'billToGstin',
                        e.target.value
                      )
                    }
                  />

                </div>

                <div className="field">

                  <label>
                    State
                  </label>

                  <input
                    value={
                      form.billToState || ''
                    }
                    onChange={(e) =>
                      updateField(
                        'billToState',
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>

            </section>

            {/* BILL DESCRIPTION */}
            <section className="editor-card">

              <div className="card-heading">
                <div>
                  <span className="section-number">
                    03
                  </span>

                  <div>
                    <h2>Bill Description</h2>
                    <p>
                      Description shown in the invoice
                    </p>
                  </div>
                </div>
              </div>

              <div className="field">

                <textarea
                  rows={5}
                  value={
                    form.billDescription || ''
                  }
                  onChange={(e) =>
                    updateField(
                      'billDescription',
                      e.target.value
                    )
                  }
                  placeholder="Enter bill description..."
                />

              </div>

            </section>

            {/* ITEMS */}
            <section className="editor-card">

              <div className="card-heading items-heading">

                <div>
                  <span className="section-number">
                    04
                  </span>

                  <div>
                    <h2>Line Items</h2>
                    <p>
                      Add services or products included in this invoice
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn secondary"
                  onClick={addLine}
                >
                  + Add Item
                </button>

              </div>

              <div className="items-editor">

                <div className="items-header">
                  <span>#</span>
                  <span>Description</span>
                  <span>HSN/SAC</span>
                  <span>Qty</span>
                  <span>Rate</span>
                  <span>Per</span>
                  <span>Amount</span>
                  <span />
                </div>

                {form.lineItems.map(
                  (item, index) => {

                    const amount =
                      Number(item.quantity || 0) *
                      Number(item.rate || 0);

                    return (
                      <div
                        className="item-row"
                        key={index}
                      >

                        <div className="item-number">
                          {index + 1}
                        </div>

                        <input
                          value={
                            item.description
                          }
                          onChange={(e) =>
                            updateLine(
                              index,
                              'description',
                              e.target.value
                            )
                          }
                          placeholder="Description"
                        />

                        <input
                          value={
                            item.hsnSac || ''
                          }
                          onChange={(e) =>
                            updateLine(
                              index,
                              'hsnSac',
                              e.target.value
                            )
                          }
                          placeholder="HSN/SAC"
                        />

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            item.quantity
                          }
                          onChange={(e) =>
                            updateLine(
                              index,
                              'quantity',
                              e.target.value
                            )
                          }
                        />

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            item.rate
                          }
                          onChange={(e) =>
                            updateLine(
                              index,
                              'rate',
                              e.target.value
                            )
                          }
                        />

                        <input
                          value={
                            item.per || ''
                          }
                          onChange={(e) =>
                            updateLine(
                              index,
                              'per',
                              e.target.value
                            )
                          }
                          placeholder="Per"
                        />

                        <div className="item-amount">
                          {formatMoney(amount)}
                        </div>

                        <button
                          type="button"
                          className="remove-item"
                          onClick={() =>
                            removeLine(index)
                          }
                          title="Remove item"
                          disabled={
                            form.lineItems.length ===
                            1
                          }
                        >
                          ×
                        </button>

                      </div>
                    );
                  }
                )}

              </div>

            </section>

            {/* TAX */}
            <section className="editor-card">

              <div className="card-heading">
                <div>
                  <span className="section-number">
                    05
                  </span>

                  <div>
                    <h2>Tax & Totals</h2>
                    <p>
                      Tax rates and automatically calculated totals
                    </p>
                  </div>
                </div>
              </div>

              <div className="tax-grid">

                <div className="tax-field">

                  <label>CGST</label>

                  <div className="tax-input">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={
                        form.cgstRate
                      }
                      onChange={(e) =>
                        updateField(
                          'cgstRate',
                          Number(
                            e.target.value
                          )
                        )
                      }
                    />
                    <span>%</span>
                  </div>

                </div>

                <div className="tax-field">

                  <label>SGST</label>

                  <div className="tax-input">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={
                        form.sgstRate
                      }
                      onChange={(e) =>
                        updateField(
                          'sgstRate',
                          Number(
                            e.target.value
                          )
                        )
                      }
                    />
                    <span>%</span>
                  </div>

                </div>

                <div className="totals-box">

                  <div>
                    <span>Subtotal</span>
                    <strong>
                      {formatMoney(
                        invoice.subtotal
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      CGST {form.cgstRate}%
                    </span>
                    <strong>
                      {formatMoney(
                        invoice.taxCgst
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      SGST {form.sgstRate}%
                    </span>
                    <strong>
                      {formatMoney(
                        invoice.taxSgst
                      )}
                    </strong>
                  </div>

                  <div className="grand-total">
                    <span>Grand Total</span>
                    <strong>
                      {formatMoney(
                        invoice.grandTotal
                      )}
                    </strong>
                  </div>

                </div>

              </div>

            </section>

            {/* SAVE BAR */}
            <div className="save-bar">

              <div>
                <strong>
                  {id
                    ? 'Update this invoice'
                    : 'Create invoice'}
                </strong>

                <span>
                  All calculated amounts will be saved automatically.
                </span>
              </div>

              <div className="save-actions">

                {id && (
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() => {
                      setEditing(false);
                      setError('');
                      setMessage('');
                    }}
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="button"
                  className="btn primary large"
                  onClick={saveInvoice}
                  disabled={saving}
                >
                  {saving
                    ? 'Saving...'
                    : id
                    ? '✓ Update Invoice'
                    : '✓ Create Invoice'}
                </button>

              </div>

            </div>

          </div>

          {/* LIVE PREVIEW */}
          <aside className="preview-column">

            <div className="preview-sticky">

              <div className="preview-heading">

                <div>
                  <span>
                    LIVE PREVIEW
                  </span>

                  <h2>
                    Final Invoice
                  </h2>
                </div>

                <span className="preview-dot">
                  Live
                </span>

              </div>

              <div className="preview-container">
                <InvoicePreview
                  invoice={invoice}
                />
              </div>

            </div>

          </aside>

        </div>
      ) : (

        /* VIEW MODE */
        <div className="view-layout">

          <div className="view-summary">

            <section className="summary-card">

              <div className="summary-icon">
                {isHousekeeping
                  ? 'HK'
                  : 'CT'}
              </div>

              <div>

                <span>
                  {isHousekeeping
                    ? 'HOUSEKEEPING'
                    : 'CATERING'}
                </span>

                <h2>
                  {form.invoiceNo || 'Invoice'}
                </h2>

                <p>
                  Invoice Date:{' '}
                  {formatDate(
                    form.invoiceDate
                  )}
                </p>

              </div>

            </section>

            <section className="summary-card">

              <div className="summary-details">

                <div>
                  <span>Buyer</span>
                  <strong>
                    {form.billToName ||
                      '-'}
                  </strong>
                </div>

                <div>
                  <span>Subtotal</span>
                  <strong>
                    {formatMoney(
                      invoice.subtotal
                    )}
                  </strong>
                </div>

                <div>
                  <span>Grand Total</span>
                  <strong className="total-highlight">
                    {formatMoney(
                      invoice.grandTotal
                    )}
                  </strong>
                </div>

              </div>

            </section>

          </div>

          <section className="full-preview-card">

            <div className="preview-heading">

              <div>
                <span>
                  DOCUMENT PREVIEW
                </span>

                <h2>
                  Final Invoice
                </h2>
              </div>

              <div className="preview-actions">

                <button
                  type="button"
                  className="btn secondary"
                  onClick={() =>
                    window.print()
                  }
                >
                  Print
                </button>

              </div>

            </div>

            <div className="preview-container large-preview">
              <InvoicePreview
                invoice={invoice}
              />
            </div>

          </section>

        </div>
      )}

      {/* Company details are intentionally not editable */}
      <div className="company-locked-note no-print">
        <div className="lock-icon">🔒</div>

        <div>
          <strong>
            GNK company information is locked
          </strong>

          <p>
            Company address, GSTIN, contact number,
            bank details and declaration are controlled
            by the application and are not editable from
            the invoice screen.
          </p>
        </div>

      </div>

    </div>
  );
}
