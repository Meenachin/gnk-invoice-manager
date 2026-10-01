'use client';

import { Invoice } from '@/lib/types';
import { COMPANY } from '@/lib/company';
import { money, dateDMY, dateRange } from '@/lib/format';
import { numberToIndianWords } from '@/lib/invoice';

export default function InvoicePreview({
  invoice
}: {
  invoice: Invoice
}) {
  return invoice.invoiceType === 'catering'
    ? <Catering invoice={invoice} />
    : <Housekeeping invoice={invoice} />;
}

function Catering({ invoice: i }: { invoice: Invoice }) {
  return (
    <div className="paper">
      <div className="invoice-title">Taxable Invoice</div>

      <table className="invoice-table">
        <tbody>

          <tr>
            <td colSpan={3}>
              <b>{COMPANY.name}</b>
              <br />
              {COMPANY.address.join('\n')}
              <br />
              Contact no : {COMPANY.phone}
              <br />
              GST IN : {COMPANY.gstin}
              <br />
              H/K code : {COMPANY.hkCode}
              <br />
              SAC CODE : {COMPANY.sacCode}
            </td>

            <td colSpan={3}>
              INVOICE No : {i.invoiceNo}
              <br />
              INVOICE DATE: {dateDMY(i.invoiceDate)}
            </td>
          </tr>

          <tr>
            <td colSpan={3}>
              <b>BILL TO</b>
              <br />
              {i.billToName}
              <br />
              {i.billToAddress}
              <br />
              GST NO : {i.billToGstin}
            </td>

            <td colSpan={3}>
              <b>Description:</b> {i.billDescription}
            </td>
          </tr>

          <tr>
            <th style={{ width: '7%' }}>SNO</th>
            <th style={{ width: '31%' }}>DESCRIPTION</th>
            <th>QUANTITY</th>
            <th>RATE</th>
            <th>PER</th>
            <th style={{ width: '17%' }}>AMOUNT IN Rs.</th>
          </tr>

          {i.lineItems.map((x, n) => (
            <tr key={n}>
              <td>{n + 1}</td>
              <td>{x.description}</td>
              <td style={{ textAlign: 'center' }}>
                {x.quantity}
              </td>
              <td style={{ textAlign: 'right' }}>
                {money(x.rate)}
              </td>
              <td style={{ textAlign: 'center' }}>
                {x.per}
              </td>
              <td style={{ textAlign: 'right' }}>
                {money(x.quantity * x.rate)}
              </td>
            </tr>
          ))}

          <tr>
            <td
              colSpan={5}
              style={{ textAlign: 'right' }}
            >
              <b>TOTAL</b>
            </td>
            <td style={{ textAlign: 'right' }}>
              {money(i.subtotal)}
            </td>
          </tr>

          <tr>
            <td
              colSpan={5}
              style={{ textAlign: 'right' }}
            >
              CGST {i.cgstRate}%
            </td>
            <td style={{ textAlign: 'right' }}>
              {money(i.taxCgst)}
            </td>
          </tr>

          <tr>
            <td
              colSpan={5}
              style={{ textAlign: 'right' }}
            >
              SGST {i.sgstRate}%
            </td>
            <td style={{ textAlign: 'right' }}>
              {money(i.taxSgst)}
            </td>
          </tr>

          <tr>
            <td
              colSpan={5}
              style={{ textAlign: 'right' }}
            >
              <b>GRAND TOTAL</b>
            </td>
            <td style={{ textAlign: 'right' }}>
              <b>{money(i.grandTotal)}</b>
            </td>
          </tr>

        </tbody>
      </table>

      <div className="amount-words">
        AMOUNT CHARGEABLE IN WORDS :
        {numberToIndianWords(i.grandTotal)}
      </div>

      <div className="bottom-grid">

        <div>
          <b>DECLARATION :</b>
          <br />
          {COMPANY.declaration}
        </div>

        <div>
          <b>COMPANY BANK DETAILS :</b>
          <br />
          BANK NAME : {COMPANY.bankName}
          <br />
          BRANCH NAME : {COMPANY.branchName}
          <br />
          ACCOUNT NUMBER : {COMPANY.accountNumber}
          <br />
          ACCOUNT TYPE : {COMPANY.accountType}
          <br />
          IFSC CODE : {COMPANY.ifsc}

          <div className="signature">
            <b>AUTHORISED SIGNATURE</b>
            <br />
            <br />
            (GNK NAVEEN INDUSTRIAL CATERERS &
            MAINTAINANCE)
          </div>
        </div>

      </div>
    </div>
  );
}

function Housekeeping({ invoice: i }: { invoice: Invoice }) {
  return (
    <div className="paper hk">
      {/* TITLE */}
      <div
        style={{
          textAlign: 'center',
          fontWeight: 700,
          fontSize: 16,
          marginBottom: 14,
          textDecoration: 'underline',
        }}
      >
        GST TAX INVOICE
      </div>

      {/* COMPANY + INVOICE DETAILS */}
      <table
        className="invoice-table hk-paper"
        style={{ tableLayout: 'fixed' }}
      >
        <tbody>
          <tr>
            <td
              colSpan={3}
              style={{
                width: '50%',
                lineHeight: 1.45,
              }}
            >
              <b>GNK Naveen Industrial Caterers and maintenance</b>
              <br />
              # 19-1-912/2
              <br />
              Murali nagar, Bahadurpura
              <br />
              Hyderabad – 500 064.
              <br />
              State Name : Telangana, Code : 36
              <br />
              GSTIN/UIN : {COMPANY.gstin}
              <br />
              Phone no : {COMPANY.phone}
            </td>

            <td
              colSpan={4}
              style={{
                width: '50%',
                lineHeight: 1.55,
              }}
            >
              <div>
                <b>INVOICE NO. :</b> {i.invoiceNo}
              </div>

              <div>
                <b>Invoice Date :</b> {dateDMY(i.invoiceDate)}
              </div>

              <div>
                <b>Description of Work :</b>
                <br />
                {i.workDescription ||
                  'Housekeeping and maintenance works'}
              </div>

              <div>
                <b>Period of Work :</b>{' '}
                {dateRange(i.periodFrom, i.periodTo)}
              </div>
            </td>
          </tr>

          {/* BUYER + BILL DESCRIPTION */}
          <tr>
            <td
              colSpan={3}
              style={{
                width: '50%',
                lineHeight: 1.45,
              }}
            >
              <b>BUYER</b>
              <br />

              <b>{i.billToName}</b>
              <br />

              {i.billToAddress}
              <br />

              GSTIN/UIN : {i.billToGstin || ''}
              <br />

              State Name :{' '}
              {i.billToState || 'Telangana, Code : 36'}
            </td>

            <td
              colSpan={4}
              style={{
                width: '50%',
                lineHeight: 1.45,
              }}
            >
              <b>BILL DESCRIPTION</b>
              <br />

              {i.billDescription || ''}
            </td>
          </tr>

          {/* ITEM TABLE HEADER */}
          <tr>
            <th style={{ width: '7%' }}>S.No.</th>

            <th style={{ width: '31%' }}>
              Description of Goods
            </th>

            <th style={{ width: '13%' }}>
              HSN/SAC
            </th>

            <th style={{ width: '12%' }}>
              Quantity
            </th>

            <th style={{ width: '13%' }}>
              Rate
            </th>

            <th style={{ width: '10%' }}>
              Per
            </th>

            <th style={{ width: '14%' }}>
              Amount
            </th>
          </tr>

          {/* ITEMS */}
          {i.lineItems.map((x, n) => (
            <tr key={n}>
              <td style={{ textAlign: 'center' }}>
                {n + 1}
              </td>

              <td>
                {x.description}
              </td>

              <td style={{ textAlign: 'center' }}>
                {x.hsnSac}
              </td>

              <td style={{ textAlign: 'center' }}>
                {x.quantity}
              </td>

              <td style={{ textAlign: 'right' }}>
                {money(x.rate)}
              </td>

              <td style={{ textAlign: 'center' }}>
                {x.per}
              </td>

              <td style={{ textAlign: 'right' }}>
                {money(
                  Number(x.quantity || 0) *
                    Number(x.rate || 0)
                )}
              </td>
            </tr>
          ))}

          {/* TOTAL */}
          <tr>
            <td
              colSpan={6}
              style={{ textAlign: 'right' }}
            >
              <b>TOTAL</b>
            </td>

            <td style={{ textAlign: 'right' }}>
              {money(i.subtotal)}
            </td>
          </tr>

          {/* CGST */}
          <tr>
            <td
              colSpan={6}
              style={{ textAlign: 'right' }}
            >
              CGST {i.cgstRate}%
            </td>

            <td style={{ textAlign: 'right' }}>
              {money(i.taxCgst)}
            </td>
          </tr>

          {/* SGST */}
          <tr>
            <td
              colSpan={6}
              style={{ textAlign: 'right' }}
            >
              SGST {i.sgstRate}%
            </td>

            <td style={{ textAlign: 'right' }}>
              {money(i.taxSgst)}
            </td>
          </tr>

          {/* GRAND TOTAL */}
          <tr>
            <td
              colSpan={6}
              style={{ textAlign: 'right' }}
            >
              <b>GRAND TOTAL</b>
            </td>

            <td style={{ textAlign: 'right' }}>
              <b>{money(i.grandTotal)}</b>
            </td>
          </tr>
        </tbody>
      </table>

      {/* AMOUNT IN WORDS */}
      <div
        className="amount-words"
        style={{ marginTop: 8 }}
      >
        <b>AMOUNT CHARGEABLE IN WORDS :</b>{' '}
        {numberToIndianWords(i.grandTotal)}
      </div>

      {/* ACCOUNT + SIGNATURE */}
      <div
        className="bottom-grid"
        style={{ marginTop: 8 }}
      >
        <div>
          <b>ACCOUNT DETAILS</b>
          <br />
          BANK NAME : {COMPANY.bankName}
          <br />
          BRANCH NAME : {COMPANY.branchName}
          <br />
          ACCOUNT NUMBER : {COMPANY.accountNumber}
          <br />
          ACCOUNT TYPE : {COMPANY.accountType}
          <br />
          IFSC CODE : {COMPANY.ifsc}
        </div>

        <div>
          <b>AUTHORISED SIGNATURE</b>

          <div className="signature">
            <b>
              GNK NAVEEN INDUSTRIAL CATERERS & MAINTAINANCE
            </b>
          </div>
        </div>
      </div>
    </div>
  );
}
