import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'GNK Invoice Manager',
  description: 'Catering and housekeeping invoice management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <header className="topbar">
            <Link
              href="/"
              className="brand"
              style={{
                color: 'white',
                textDecoration: 'none',
              }}
            >
              GNK Invoice Manager
              <small>Catering &amp; Housekeeping</small>
            </Link>

            <nav className="nav">
              <Link href="/invoices">Invoices</Link>
            </nav>
          </header>

          {children}
        </div>
      </body>
    </html>
  );
}
