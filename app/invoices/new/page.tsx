import InvoiceForm from "./InvoiceForm";

export default function NewInvoicePage() {
  // This is a Server Component. Later, we will fetch user logins here.
  return (
    <div className="bg-gray-100 min-h-screen">
      <InvoiceForm />
    </div>
  );
}