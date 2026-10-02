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
    <div
      className="paper"
      style={{
        background: '#ffffff',
        padding: 0,
        overflow: 'hidden',
        border: 'none',
      }}
    >

      {/* ================= TOP BLUE / GOLD HEADER ================= */}

      <div
        style={{
          position: 'relative',
          height: '145px',
          background: '#ffffff',
          overflow: 'hidden',
        }}
      >

        {/* BLUE RIGHT SHAPE */}
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

        {/* GNK LOGO */}
        <img
          src="/gnk-logo-only.png"
          alt="GNK Naveen Industrial Caterers and Maintenance"
          style={{
            position: 'absolute',
            left: '28px',
            top: '12px',
            width: '360px',
            height: '125px',
            objectFit: 'contain',
            objectPosition: 'left center',
          }}
        />

        {/* TAX INVOICE */}
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
          TAX <span style={{ color: '#D9A441' }}>INVOICE</span>

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


      {/* ================= COMPANY + INVOICE DETAILS ================= */}

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
            minHeight: '135px',
            fontSize: '10px',
            lineHeight: 1.45,
          }}
        >
          <div
            style={{
              color: '#123F67',
              fontSize: '13px',
              fontWeight: 800,
              marginBottom: '5px',
            }}
          >
            GNK Naveen Industrial Caterers
            <br />
            and Maintenance
          </div>

          {COMPANY.address[0]}
          <br />
          {COMPANY.address[1]}
          <br />
          Contact no : {COMPANY.phone}
          <br />
          GST IN : {COMPANY.gstin}
          <br />
          H/K code : {COMPANY.hkCode}
          <br />
          SAC CODE : {COMPANY.sacCode}
        </div>


        {/* INVOICE DETAILS */}
        <div
          style={{
            background: '#EAF2F8',
            border: '1px solid #B8C7D3',
            padding: '12px',
            minHeight: '135px',
            fontSize: '10px',
            lineHeight: 1.6,
          }}
        >
          <div>
            <b style={{ color: '#123F67' }}>
              INVOICE NO :
            </b>{' '}
            {i.invoiceNo}
          </div>

          <div>
            <b style={{ color: '#123F67' }}>
              INVOICE DATE :
            </b>{' '}
            {dateDMY(i.invoiceDate)}
          </div>

          <div style={{ marginTop: '12px' }}>
            <b style={{ color: '#123F67' }}>
              DESCRIPTION :
            </b>
            <br />
            {i.billDescription || ''}
          </div>
        </div>
      </div>


      {/* ================= BILL TO + DESCRIPTION ================= */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          margin: '0 18px 10px',
        }}
      >

        {/* BILL TO */}
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
              fontSize: '12px',
              fontWeight: 800,
            }}
          >
            BILL TO
          </div>

          <div
            style={{
              padding: '10px 12px',
              minHeight: '75px',
              fontSize: '10px',
              lineHeight: 1.5,
            }}
          >
            <b>{i.billToName}</b>
            <br />
            {i.billToAddress}
            <br />
            GST NO : {i.billToGstin || ''}
          </div>
        </div>


        {/* DESCRIPTION */}
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
              fontSize: '12px',
              fontWeight: 800,
            }}
          >
            DESCRIPTION
          </div>

          <div
            style={{
              padding: '10px 12px',
              minHeight: '75px',
              fontSize: '10px',
              lineHeight: 1.5,
            }}
          >
            {i.billDescription || ''}
          </div>
        </div>
      </div>


      {/* ================= CATERING ITEMS ================= */}

      <div style={{ margin: '0 18px' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
            fontSize: '9px',
          }}
        >
          <thead>
            <tr
              style={{
                background: '#123F67',
                color: '#ffffff',
              }}
            >
              <th
                style={{
                  border: '1px solid #B8C7D3',
                  padding: '8px 5px',
                  width: '7%',
                }}
              >
                SNO
              </th>

              <th
                style={{
                  border: '1px solid #B8C7D3',
                  padding: '8px 5px',
                  width: '31%',
                }}
              >
                DESCRIPTION
              </th>

              <th
                style={{
                  border: '1px solid #B8C7D3',
                  padding: '8px 5px',
                  width: '15%',
                }}
              >
                QUANTITY
              </th>

              <th
                style={{
                  border: '1px solid #B8C7D3',
                  padding: '8px 5px',
                  width: '15%',
                }}
              >
                RATE
              </th>

              <th
                style={{
                  border: '1px solid #B8C7D3',
                  padding: '8px 5px',
                  width: '15%',
                }}
              >
                PER
              </th>

              <th
                style={{
                  border: '1px solid #B8C7D3',
                  padding: '8px 5px',
                  width: '17%',
                }}
              >
                AMOUNT IN Rs.
              </th>
            </tr>
          </thead>

          <tbody>
            {i.lineItems.map((x, n) => (
              <tr
                key={n}
                style={{
                  background:
                    n % 2 === 0
                      ? '#ffffff'
                      : '#EAF2F8',
                }}
              >
                <td
                  style={{
                    border: '1px solid #B8C7D3',
                    padding: '8px',
                    textAlign: 'center',
                  }}
                >
                  {n + 1}
                </td>

                <td
                  style={{
                    border: '1px solid #B8C7D3',
                    padding: '8px',
                  }}
                >
                  {x.description}
                </td>

                <td
                  style={{
                    border: '1px solid #B8C7D3',
                    padding: '8px',
                    textAlign: 'center',
                  }}
                >
                  {x.quantity}
                </td>

                <td
                  style={{
                    border: '1px solid #B8C7D3',
                    padding: '8px',
                    textAlign: 'right',
                  }}
                >
                  {money(x.rate)}
                </td>

                <td
                  style={{
                    border: '1px solid #B8C7D3',
                    padding: '8px',
                    textAlign: 'center',
                  }}
                >
                  {x.per}
                </td>

                <td
                  style={{
                    border: '1px solid #B8C7D3',
                    padding: '8px',
                    textAlign: 'right',
                  }}
                >
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
                colSpan={5}
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

            {/* CGST */}
            <tr>
              <td
                colSpan={5}
                style={{
                  border: '1px solid #B8C7D3',
                  padding: '8px',
                  textAlign: 'right',
                  background: '#EAF2F8',
                }}
              >
                CGST {i.cgstRate}%
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

            {/* SGST */}
            <tr>
              <td
                colSpan={5}
                style={{
                  border: '1px solid #B8C7D3',
                  padding: '8px',
                  textAlign: 'right',
                  background: '#EAF2F8',
                }}
              >
                SGST {i.sgstRate}%
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

            {/* GRAND TOTAL */}
            <tr>
              <td
                colSpan={5}
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


      {/* ================= DECLARATION + BANK ================= */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          margin: '0 18px',
        }}
      >

        {/* DECLARATION */}
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
              fontSize: '12px',
              fontWeight: 800,
            }}
          >
            DECLARATION
          </div>

          <div
            style={{
              padding: '10px 12px',
              minHeight: '105px',
              fontSize: '9px',
              lineHeight: 1.5,
            }}
          >
            {COMPANY.declaration}
          </div>
        </div>


        {/* BANK DETAILS */}
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
              fontSize: '12px',
              fontWeight: 800,
            }}
          >
            COMPANY BANK DETAILS
          </div>

          <div
            style={{
              padding: '10px 12px',
              minHeight: '105px',
              fontSize: '9px',
              lineHeight: 1.55,
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
      </div>


      {/* ================= SIGNATURE ================= */}

      <div
        style={{
          margin: '6px 18px 0',
          border: '1px solid #B8C7D3',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            background: '#123F67',
            color: '#ffffff',
            padding: '7px',
            fontSize: '12px',
            fontWeight: 800,
          }}
        >
          AUTHORISED SIGNATURE
        </div>

        <div
          style={{
            padding: '10px',
            height: '55px',
            color: '#123F67',
            fontSize: '9px',
            fontWeight: 700,
          }}
        >
          ______________________________
          <br />
          GNK NAVEEN INDUSTRIAL CATERERS &amp; MAINTAINANCE
        </div>
      </div>


      {/* ================= BOTTOM BLUE / GOLD DESIGN ================= */}

      <div
        style={{
          position: 'relative',
          height: '35px',
          marginTop: '6px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '28px',
            background: '#123F67',
            borderTopRightRadius: '80%',
          }}
        />

        <div
          style={{
            position: 'absolute',
            bottom: '22px',
            left: 0,
            width: '100%',
            height: '5px',
            background: '#D9A441',
            borderTopRightRadius: '80%',
          }}
        />
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
  src="/gnk-logo-only.png"
  alt="GNK Naveen Industrial Caterers and Maintenance"
  style={{
    position: 'absolute',
    left: '28px',
    top: '12px',
    width: '360px',
    height: '125px',
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
          TAX <span style={{ color: '#D9A441' }}>INVOICE</span>
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
