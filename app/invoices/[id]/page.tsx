import InvoiceEditor from '@/components/InvoiceEditor';

export default function InvoicePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { edit?: string };
}) {
  return (
    <main className="container">
      <InvoiceEditor
        id={params.id}
        edit={searchParams.edit === '1'}
      />
    </main>
  );
}
