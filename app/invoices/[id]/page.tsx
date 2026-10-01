import InvoiceEditor from '@/components/InvoiceEditor';

export default async function InvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    edit?: string;
    print?: string;
  }>;
}) {
  const { id } = await params;
  const { edit, print } = await searchParams;

  return (
    <main className="container">
      <InvoiceEditor
        id={id}
        edit={edit === '1'}
        print={print === '1'}
      />
    </main>
  );
}
