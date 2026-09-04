import InvoiceEditor from '@/components/InvoiceEditor';
export default function EditInvoice({params}:{params:{id:string}}){return <main className="container"><InvoiceEditor id={params.id} /></main>}
