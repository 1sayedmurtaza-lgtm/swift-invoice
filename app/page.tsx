"use client";

import InvoiceForm from "./invoices/new/InvoiceForm"; 

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <InvoiceForm />
    </main>
  );
}