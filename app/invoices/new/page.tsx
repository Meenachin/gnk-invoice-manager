import InvoiceEditor from '@/components/InvoiceEditor';

export default function NewInvoice({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  return (
    <InvoiceEditor
      type={
        searchParams.type === 'housekeeping'
          ? 'housekeeping'
          : 'catering'
      }
    />
  );
}
