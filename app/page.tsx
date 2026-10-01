import Link from 'next/link';

export default function Home() {
  return (
    <main className="container">
      <section className="hero">
        <h1>Create Invoice</h1>

        <p>
          Select the business format. Fixed company information is prefilled;
          bill and invoice details remain editable.
        </p>
      </section>

      <div className="cards">
        {/* CATERING */}
        <div className="choice">
          <div className="badge">FORMAT 01</div>

          <h2>Catering</h2>

          <p>
            Uses the supplied SBI LHO catering invoice structure with line
            items, quantity, rate, CGST/SGST and bank details.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              flexWrap: 'wrap',
              marginTop: '18px',
            }}
          >
            <Link
              className="btn"
              href="/invoices/new?type=catering"
            >
              Create Catering Invoice
            </Link>

            <Link
              className="btn"
              href="/invoices?type=catering"
            >
              Catering Bills History
            </Link>
          </div>
        </div>

        {/* HOUSEKEEPING */}
        <div className="choice">
          <div className="badge">FORMAT 02</div>

          <h2>Housekeeping</h2>

          <p>
            Uses the supplied housekeeping and maintenance GST invoice
            structure, including work period and bill description.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              flexWrap: 'wrap',
              marginTop: '18px',
            }}
          >
            <Link
              className="btn"
              href="/invoices/new?type=housekeeping"
            >
              Create Housekeeping Invoice
            </Link>

            <Link
              className="btn"
              href="/invoices?type=housekeeping"
            >
              Housekeeping Bills History
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
