import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import InvoiceLayout from "./InvoiceLayout";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoicePage({ params }: PageProps) {
  const supabase = await createClient();
  const { id } = await params;

  // Fetch Parent Record securely on the server
  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .single();

  if (invoiceError || !invoice) {
    return notFound();
  }

  // Fetch Child Records securely on the server
  const { data: items } = await supabase
    .from("invoice_items")
    .select("*")
    .eq("invoice_id", id);

  // Pass everything down into our interactive client container layer
  return <InvoiceLayout invoice={invoice} items={items} />;
}