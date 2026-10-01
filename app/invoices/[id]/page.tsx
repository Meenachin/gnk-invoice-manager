import InvoiceEditor from '@/components/InvoiceEditor';

export default async function InvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { id } = await params;
  const { edit } = await searchParams;

  return (
    <main className="container">
      <InvoiceEditor
        id={id}
        edit={edit === '1'}
      />
    </main>
  );
}
