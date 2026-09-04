'use client';

import { Invoice } from '@/lib/types';
import { COMPANY } from '@/lib/company';
import { money, dateDMY, dateRange } from '@/lib/format';
import { numberToIndianWords } from '@/lib/invoice';

export default function InvoicePreview({
  invoice,
}: {
  invoice: Invoice;
}) {
  if (invoice.invoiceType === 'housekeeping') {
    return <HousekeepingPreview invoice={invoice} />;
  }

  return <CateringPreview invoice={invoice} />;
}

/* =========================================================
   SHARED UI
========================================================= */

function PreviewHeader({
  invoice,
  type,
}: {
  invoice: Invoice;
  type: 'catering' | 'housekeeping';
}) {
  return (
    <div className="preview-top">
      <div>
        <div className="preview-eyebrow">
          {type === 'housekeeping'
            ? 'HOUSEKEEPING & MAINTENANCE'
            : 'CATERING'}
        </div>

        <h2 className="preview-company">
          GNK NAVEEN INDUSTRIAL
        </h2>

        <h3 className="preview-company-sub">
          CATERERS & MAINTENANCE
        </h3>
      </div>

      <div className="preview-status">
        <span className="preview-status-dot" />
        Saved Invoice
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="info-item">
      <span className="info-label">{label}</span>
      <span className="info-value">{value || '—'}</span>
    </div>
  );
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  );
}

/* =========================================================
   CATERING
========================================================= */

function CateringPreview({
  invoice: i,
}: {
  invoice: Invoice;
}) {
  return (
    <div className="invoice-preview-shell">
      <div className="preview-paper catering-preview">

        <PreviewHeader
          invoice={i}
          type="catering"
        />

        <div className="document-title">
          TAXABLE INVOICE
        </div>

        {/* Invoice information */}
        <div className="invoice-info-grid">
          <div className="info-card">
            <SectionTitle
              title="Company Details"
              subtitle="Supplier information"
            />

            <div className="info-grid">
              <InfoItem
                label="Company"
                value={COMPANY.name}
              />

              <InfoItem
                label="GSTIN"
                value={COMPANY.gstin}
              />

              <InfoItem
                label="Phone"
                value={COMPANY.phone}
              />

              <InfoItem
                label="H/K Code"
                value={COMPANY.hkCode}
              />

              <InfoItem
                label="SAC Code"
                value={COMPANY.sacCode}
              />
            </div>

            <div className="address-block">
              {COMPANY.address.map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
          </div>

          <div className="info-card">
            <SectionTitle
              title="Invoice Information"
              subtitle="Document details"
            />

            <div className="info-grid">
              <InfoItem
                label="Invoice No."
                value={i.invoiceNo}
              />

              <InfoItem
                label="Invoice Date"
                value={dateDMY(i.invoiceDate)}
              />
            </div>

            <div className="description-box">
              <span>Description</span>
              <p>{i.billDescription || '—'}</p>
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="preview-section">
          <SectionTitle
            title="Bill To"
            subtitle="Customer / buyer details"
          />

          <div className="buyer-card">
            <div>
              <span className="buyer-label">
                Customer
              </span>

              <strong>
                {i.billToName || '—'}
              </strong>
            </div>

            <div>
              <span className="buyer-label">
                Address
              </span>

              <span>
                {i.billToAddress || '—'}
              </span>
            </div>

            <div>
              <span className="buyer-label">
                GSTIN
              </span>

              <span>
                {i.billToGstin || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="preview-section">
          <SectionTitle
            title="Invoice Items"
            subtitle={`${i.lineItems.length} item${
              i.lineItems.length === 1 ? '' : 's'
            }`}
          />

          <div className="modern-table-wrap">
            <table className="modern-table">
              <thead>
                <tr>
                  <th className="center">#</th>
                  <th>Description</th>
                  <th className="center">Qty</th>
                  <th className="right">Rate</th>
                  <th className="center">Per</th>
                  <th className="right">Amount</th>
                </tr>
              </thead>

              <tbody>
                {i.lineItems.map((item, index) => {
                  const amount =
                    Number(item.quantity || 0) *
                    Number(item.rate || 0);

                  return (
                    <tr key={index}>
                      <td className="center">
                        {index + 1}
                      </td>

                      <td>
                        <div className="item-description">
                          {item.description || '—'}
                        </div>
                      </td>

                      <td className="center">
                        {item.quantity}
                      </td>

                      <td className="right">
                        ₹ {money(item.rate)}
                      </td>

                      <td className="center">
                        {item.per || '—'}
                      </td>

                      <td className="right amount-cell">
                        ₹ {money(amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="totals-area">
          <div className="totals-box">

            <div className="total-row">
              <span>Subtotal</span>
              <strong>
                ₹ {money(i.subtotal)}
              </strong>
            </div>

            <div className="total-row">
              <span>
                CGST {i.cgstRate}%
              </span>
              <span>
                ₹ {money(i.taxCgst)}
              </span>
            </div>

            <div className="total-row">
              <span>
                SGST {i.sgstRate}%
              </span>
              <span>
                ₹ {money(i.taxSgst)}
              </span>
            </div>

            <div className="grand-total-row">
              <span>Grand Total</span>

              <strong>
                ₹ {money(i.grandTotal)}
              </strong>
            </div>

          </div>
        </div>

        {/* Amount in words */}
        <div className="amount-words-card">
          <span>Amount Chargeable in Words</span>

          <strong>
            {numberToIndianWords(i.grandTotal)}
          </strong>
        </div>

        {/* Bottom */}
        <div className="bottom-information">

          <div className="bottom-card">
            <SectionTitle title="Declaration" />

            <p>
              {COMPANY.declaration || '—'}
            </p>
          </div>

          <div className="bottom-card">
            <SectionTitle title="Bank Details" />

            <div className="bank-details">
              <InfoItem
                label="Bank"
                value={COMPANY.bankName}
              />

              <InfoItem
                label="Branch"
                value={COMPANY.branchName}
              />

              <InfoItem
                label="Account No."
                value={COMPANY.accountNumber}
              />

              <InfoItem
                label="Account Type"
                value={COMPANY.accountType}
              />

              <InfoItem
                label="IFSC"
                value={COMPANY.ifsc}
              />
            </div>
          </div>

        </div>

        <PreviewFooter />

      </div>
    </div>
  );
}

/* =========================================================
   HOUSEKEEPING
========================================================= */

function HousekeepingPreview({
  invoice: i,
}: {
  invoice: Invoice;
}) {
  return (
    <div className="invoice-preview-shell">
      <div className="preview-paper housekeeping-preview">

        <PreviewHeader
          invoice={i}
          type="housekeeping"
        />

        <div className="document-title">
          GST TAX INVOICE
        </div>

        {/* Top information */}
        <div className="hk-info-grid">

          <div className="info-card">
            <SectionTitle
              title="Supplier Details"
              subtitle="Housekeeping & maintenance service provider"
            />

            <div className="supplier-name">
              {COMPANY.name}
            </div>

            <div className="address-block">
              {COMPANY.address.map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>

            <div className="info-grid hk-small-grid">
              <InfoItem
                label="State"
                value="Telangana, Code : 36"
              />

              <InfoItem
                label="GSTIN/UIN"
                value={COMPANY.gstin}
              />

              <InfoItem
                label="Phone"
                value={COMPANY.phone}
              />
            </div>
          </div>

          <div className="info-card">

            <SectionTitle
              title="Invoice Details"
              subtitle="Service period and document information"
            />

            <div className="info-grid">
              <InfoItem
                label="Invoice No."
                value={i.invoiceNo}
              />

              <InfoItem
                label="Invoice Date"
                value={dateDMY(i.invoiceDate)}
              />

              <InfoItem
                label="Period"
                value={
                  i.periodFrom && i.periodTo
                    ? dateRange(
                        i.periodFrom,
                        i.periodTo
                      )
                    : '—'
                }
              />
            </div>

            <div className="description-box">
              <span>Description of Work</span>

              <p>
                {i.workDescription ||
                  'Housekeeping and maintenance works'}
              </p>
            </div>

          </div>

        </div>

        {/* Buyer */}
        <div className="preview-section">

          <SectionTitle
            title="Buyer"
            subtitle="Customer / client information"
          />

          <div className="buyer-card hk-buyer">

            <div>
              <span className="buyer-label">
                Customer
              </span>

              <strong>
                {i.billToName || '—'}
              </strong>
            </div>

            <div>
              <span className="buyer-label">
                Address
              </span>

              <span>
                {i.billToAddress || '—'}
              </span>
            </div>

            <div>
              <span className="buyer-label">
                GSTIN/UIN
              </span>

              <span>
                {i.billToGstin || '—'}
              </span>
            </div>

            <div>
              <span className="buyer-label">
                State
              </span>

              <span>
                {i.billToState || '—'}
              </span>
            </div>

          </div>
        </div>

        {/* Bill Description */}
        <div className="description-full">

          <span>Bill Description</span>

          <p>
            {i.billDescription || '—'}
          </p>

        </div>

        {/* Housekeeping items */}
        <div className="preview-section">

          <SectionTitle
            title="Service / Goods Details"
            subtitle={`${i.lineItems.length} line item${
              i.lineItems.length === 1 ? '' : 's'
            }`}
          />

          <div className="modern-table-wrap">

            <table className="modern-table hk-table">

              <thead>
                <tr>
                  <th className="center">S.No.</th>
                  <th>Description of Goods</th>
                  <th className="center">HSN/SAC</th>
                  <th className="center">Quantity</th>
                  <th className="right">Rate</th>
                  <th className="center">Per</th>
                  <th className="right">Amount</th>
                </tr>
              </thead>

              <tbody>

                {i.lineItems.map((item, index) => {

                  const amount =
                    Number(item.quantity || 0) *
                    Number(item.rate || 0);

                  return (
                    <tr key={index}>

                      <td className="center">
                        {index + 1}
                      </td>

                      <td>
                        <div className="item-description">
                          {item.description || '—'}
                        </div>
                      </td>

                      <td className="center">
                        {item.hsnSac || '—'}
                      </td>

                      <td className="center">
                        {item.quantity}
                      </td>

                      <td className="right">
                        ₹ {money(item.rate)}
                      </td>

                      <td className="center">
                        {item.per || 'Quantity'}
                      </td>

                      <td className="right amount-cell">
                        ₹ {money(amount)}
                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        </div>

        {/* Totals */}
        <div className="totals-area">

          <div className="totals-box">

            <div className="total-row">
              <span>Subtotal</span>
              <strong>
                ₹ {money(i.subtotal)}
              </strong>
            </div>

            <div className="total-row">
              <span>
                CGST {i.cgstRate}%
              </span>

              <span>
                ₹ {money(i.taxCgst)}
              </span>
            </div>

            <div className="total-row">
              <span>
                SGST {i.sgstRate}%
              </span>

              <span>
                ₹ {money(i.taxSgst)}
              </span>
            </div>

            <div className="grand-total-row">
              <span>Total</span>

              <strong>
                ₹ {money(i.grandTotal)}
              </strong>
            </div>

          </div>

        </div>

        {/* Words */}
        <div className="amount-words-card">
          <span>Amount Chargeable in Words</span>

          <strong>
            {numberToIndianWords(i.grandTotal)}
          </strong>
        </div>

        {/* Bank + signature */}
        <div className="bottom-information">

          <div className="bottom-card">

            <SectionTitle title="Account Details" />

            <div className="bank-details">

              <InfoItem
                label="Account No."
                value={COMPANY.accountNumber}
              />

              <InfoItem
                label="Account Name"
                value={COMPANY.name}
              />

              <InfoItem
                label="Account Type"
                value={COMPANY.accountType}
              />

              <InfoItem
                label="IFSC"
                value={COMPANY.ifsc}
              />

              <InfoItem
                label="Branch"
                value={COMPANY.branchName}
              />

            </div>

          </div>

          <div className="signature-card">

            <span>For</span>

            <strong>
              {COMPANY.name}
            </strong>

            <div className="signature-space" />

            <b>
              Authorised Signatory
            </b>

          </div>

        </div>

        <PreviewFooter />

      </div>
    </div>
  );
}

/* =========================================================
   FOOTER
========================================================= */

function PreviewFooter() {
  return (
    <div className="preview-footer">

      <div className="footer-company">
        GNK NAVEEN INDUSTRIAL CATERERS & MAINTENANCE
      </div>

      <div className="footer-address">
        # 19-1-912/2, Murli Nagar, Bahadurpura,
        Hyderabad, Telangana State, India - 500064
      </div>

      <div className="footer-contact">
        Phone: {COMPANY.phone}
      </div>

    </div>
  );
}
