import InvoiceEditor from '@/components/InvoiceEditor';

export default function NewInvoice({
  searchParams,
}: {
  searchParams: {
    type?: string;
  };
}) {
  const type =
    searchParams.type === 'housekeeping'
      ? 'housekeeping'
      : 'catering';

  return (
    <main className="invoice-shell">
      <InvoiceEditor type={type} />
    </main>
  );
}
