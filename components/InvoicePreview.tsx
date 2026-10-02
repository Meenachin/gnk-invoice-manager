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
    <div
      className="paper hk"
      style={{
        background: '#ffffff',
        padding: 0,
        overflow: 'hidden',
        border: 'none',
      }}
    >

      {/* ================= TOP DESIGN ================= */}

      <div
        style={{
          position: 'relative',
          height: '145px',
          background: '#ffffff',
          overflow: 'hidden',
        }}
      >

        {/* BLUE TOP RIGHT SHAPE */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '55%',
            height: '120px',
            background: '#123F67',
            borderBottomLeftRadius: '90px',
          }}
        />

        {/* GOLD ACCENT */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: '42%',
            width: '18px',
            height: '115px',
            background: '#D9A441',
            transform: 'rotate(-38deg)',
            transformOrigin: 'top',
          }}
        />

        {/* LOGO */}
        <img
          src="/gnk-header.png"
          alt="GNK"
          style={{
            position: 'absolute',
            left: '28px',
            top: '10px',
            width: '285px',
            height: '105px',
            objectFit: 'contain',
            objectPosition: 'left center',
          }}
        />

        {/* GST TITLE */}
        <div
          style={{
            position: 'absolute',
            right: '35px',
            top: '30px',
            width: '330px',
            color: '#ffffff',
            fontSize: '25px',
            fontWeight: 800,
            textAlign: 'right',
            letterSpacing: '0.5px',
          }}
        >
          GST <span style={{ color: '#D9A441' }}>TAX INVOICE</span>

          <div
            style={{
              marginTop: '8px',
              marginLeft: 'auto',
              width: '175px',
              height: '3px',
              background: '#D9A441',
            }}
          />
        </div>
      </div>


      {/* ================= COMPANY + INVOICE ================= */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          margin: '0 18px 10px',
        }}
      >

        {/* COMPANY */}
        <div
          style={{
            border: '1px solid #B8C7D3',
            padding: '12px',
            minHeight: '145px',
            fontSize: '11px',
            lineHeight: 1.5,
          }}
        >
          <div
            style={{
              color: '#123F67',
              fontSize: '14px',
              fontWeight: 800,
              marginBottom: '6px',
            }}
          >
            GNK Naveen Industrial Caterers
            <br />
            and Maintenance
          </div>

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
        </div>


        {/* INVOICE DETAILS */}
        <div
          style={{
            background: '#EAF2F8',
            border: '1px solid #B8C7D3',
            padding: '12px',
            minHeight: '145px',
            fontSize: '11px',
            lineHeight: 1.55,
          }}
        >
          <div>
            <b style={{ color: '#123F67' }}>INVOICE NO. :</b>{' '}
            {i.invoiceNo}
          </div>

          <div>
            <b style={{ color: '#123F67' }}>INVOICE DATE :</b>{' '}
            {dateDMY(i.invoiceDate)}
          </div>

          <div style={{ marginTop: '12px' }}>
            <b style={{ color: '#123F67' }}>
              DESCRIPTION OF WORK :
            </b>
            <br />
            {i.workDescription ||
              'Housekeeping and maintenance works'}
          </div>

          <div style={{ marginTop: '10px' }}>
            <b style={{ color: '#123F67' }}>
              PERIOD OF WORK :
            </b>{' '}
            {dateRange(i.periodFrom, i.periodTo)}
          </div>
        </div>
      </div>


      {/* ================= BUYER + BILL DESCRIPTION ================= */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          margin: '0 18px 10px',
        }}
      >

        {/* BUYER */}
        <div
          style={{
            border: '1px solid #B8C7D3',
          }}
        >
          <div
            style={{
              background: '#123F67',
              color: '#ffffff',
              padding: '8px 12px',
              fontSize: '13px',
              fontWeight: 800,
            }}
          >
            BUYER
          </div>

          <div
            style={{
              padding: '10px 12px',
              minHeight: '88px',
              fontSize: '11px',
              lineHeight: 1.55,
            }}
          >
            <b>{i.billToName}</b>
            <br />
            {i.billToAddress}
            <br />
            GSTIN/UIN : {i.billToGstin || ''}
            <br />
            State Name :{' '}
            {i.billToState || 'Telangana, Code : 36'}
          </div>
        </div>


        {/* BILL DESCRIPTION */}
        <div
          style={{
            border: '1px solid #B8C7D3',
          }}
        >
          <div
            style={{
              background: '#123F67',
              color: '#ffffff',
              padding: '8px 12px',
              fontSize: '13px',
              fontWeight: 800,
            }}
          >
            BILL DESCRIPTION
          </div>

          <div
            style={{
              padding: '10px 12px',
              minHeight: '88px',
              fontSize: '11px',
              lineHeight: 1.55,
            }}
          >
            {i.billDescription || ''}
          </div>
        </div>
      </div>


      {/* ================= ITEMS TABLE ================= */}

      <div style={{ margin: '0 18px' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
            fontSize: '10px',
          }}
        >
          <thead>
            <tr
              style={{
                background: '#123F67',
                color: '#ffffff',
              }}
            >
              <th style={{ border: '1px solid #B8C7D3', padding: '8px', width: '7%' }}>
                S.No.
              </th>

              <th style={{ border: '1px solid #B8C7D3', padding: '8px', width: '30%' }}>
                Description of Goods
              </th>

              <th style={{ border: '1px solid #B8C7D3', padding: '8px', width: '13%' }}>
                HSN/SAC
              </th>

              <th style={{ border: '1px solid #B8C7D3', padding: '8px', width: '12%' }}>
                Quantity
              </th>

              <th style={{ border: '1px solid #B8C7D3', padding: '8px', width: '12%' }}>
                Rate
              </th>

              <th style={{ border: '1px solid #B8C7D3', padding: '8px', width: '10%' }}>
                Per
              </th>

              <th style={{ border: '1px solid #B8C7D3', padding: '8px', width: '16%' }}>
                Amount
              </th>
            </tr>
          </thead>

          <tbody>
            {i.lineItems.map((x, n) => (
              <tr
                key={n}
                style={{
                  background:
                    n % 2 === 0 ? '#ffffff' : '#EAF2F8',
                }}
              >
                <td style={{ border: '1px solid #B8C7D3', padding: '8px', textAlign: 'center' }}>
                  {n + 1}
                </td>

                <td style={{ border: '1px solid #B8C7D3', padding: '8px' }}>
                  {x.description}
                </td>

                <td style={{ border: '1px solid #B8C7D3', padding: '8px', textAlign: 'center' }}>
                  {x.hsnSac}
                </td>

                <td style={{ border: '1px solid #B8C7D3', padding: '8px', textAlign: 'center' }}>
                  {x.quantity}
                </td>

                <td style={{ border: '1px solid #B8C7D3', padding: '8px', textAlign: 'right' }}>
                  {money(x.rate)}
                </td>

                <td style={{ border: '1px solid #B8C7D3', padding: '8px', textAlign: 'center' }}>
                  {x.per}
                </td>

                <td style={{ border: '1px solid #B8C7D3', padding: '8px', textAlign: 'right' }}>
                  {money(
                    Number(x.quantity || 0) *
                    Number(x.rate || 0)
                  )}
                </td>
              </tr>
            ))}

            <tr>
              <td
                colSpan={6}
                style={{
                  border: '1px solid #B8C7D3',
                  padding: '8px',
                  textAlign: 'right',
                  background: '#EAF2F8',
                  fontWeight: 700,
                }}
              >
                TOTAL
              </td>

              <td
                style={{
                  border: '1px solid #B8C7D3',
                  padding: '8px',
                  textAlign: 'right',
                  background: '#EAF2F8',
                  fontWeight: 700,
                }}
              >
                {money(i.subtotal)}
              </td>
            </tr>

            <tr>
              <td
                colSpan={6}
                style={{
                  border: '1px solid #B8C7D3',
                  padding: '8px',
                  textAlign: 'right',
                  background: '#EAF2F8',
                }}
              >
                CGST @ {i.cgstRate}%
              </td>

              <td
                style={{
                  border: '1px solid #B8C7D3',
                  padding: '8px',
                  textAlign: 'right',
                  background: '#EAF2F8',
                }}
              >
                {money(i.taxCgst)}
              </td>
            </tr>

            <tr>
              <td
                colSpan={6}
                style={{
                  border: '1px solid #B8C7D3',
                  padding: '8px',
                  textAlign: 'right',
                  background: '#EAF2F8',
                }}
              >
                SGST @ {i.sgstRate}%
              </td>

              <td
                style={{
                  border: '1px solid #B8C7D3',
                  padding: '8px',
                  textAlign: 'right',
                  background: '#EAF2F8',
                }}
              >
                {money(i.taxSgst)}
              </td>
            </tr>

            <tr>
              <td
                colSpan={6}
                style={{
                  border: '1px solid #123F67',
                  padding: '10px',
                  textAlign: 'right',
                  background: '#123F67',
                  color: '#ffffff',
                  fontWeight: 800,
                }}
              >
                GRAND TOTAL
              </td>

              <td
                style={{
                  border: '1px solid #123F67',
                  padding: '10px',
                  textAlign: 'right',
                  background: '#123F67',
                  color: '#ffffff',
                  fontWeight: 800,
                }}
              >
                {money(i.grandTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>


      {/* ================= AMOUNT IN WORDS ================= */}

      <div
        style={{
          margin: '10px 18px',
          padding: '10px 12px',
          background: '#EAF2F8',
          border: '1px solid #B8C7D3',
          fontSize: '10px',
          lineHeight: 1.5,
        }}
      >
        <b style={{ color: '#123F67' }}>
          AMOUNT CHARGEABLE IN WORDS :
        </b>{' '}
        {numberToIndianWords(i.grandTotal)}
      </div>


      {/* ================= ACCOUNT + SIGNATURE ================= */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          margin: '0 18px',
        }}
      >

        {/* ACCOUNT DETAILS */}
        <div
          style={{
            border: '1px solid #B8C7D3',
          }}
        >
          <div
            style={{
              background: '#123F67',
              color: '#ffffff',
              padding: '8px 12px',
              fontSize: '13px',
              fontWeight: 800,
            }}
          >
            ACCOUNT DETAILS
          </div>

          <div
            style={{
              padding: '10px 12px',
              fontSize: '10px',
              lineHeight: 1.7,
            }}
          >
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
        </div>


        {/* SIGNATURE */}
        <div
          style={{
            border: '1px solid #B8C7D3',
          }}
        >
          <div
            style={{
              background: '#123F67',
              color: '#ffffff',
              padding: '8px 12px',
              fontSize: '13px',
              fontWeight: 800,
            }}
          >
            AUTHORISED SIGNATURE
          </div>

          <div
            style={{
              height: '105px',
              padding: '35px 12px 10px',
              fontSize: '10px',
              fontWeight: 700,
              color: '#123F67',
            }}
          >
            ______________________________
            <br />
            <br />
            GNK NAVEEN INDUSTRIAL CATERERS & MAINTAINANCE
          </div>
        </div>

      </div>


      {/* ================= BOTTOM GOLD / BLUE DESIGN ================= */}

      <div
        style={{
          position: 'relative',
          height: '55px',
          marginTop: '12px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '38px',
            background: '#123F67',
            borderTopRightRadius: '80%',
          }}
        />

        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            left: 0,
            width: '100%',
            height: '7px',
            background: '#D9A441',
            borderTopRightRadius: '80%',
          }}
        />
      </div>

    </div>
  );
}
