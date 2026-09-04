import InvoiceEditor from '@/components/InvoiceEditor';

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main>
      <InvoiceEditor id={id} />
    </main>
  );
}
