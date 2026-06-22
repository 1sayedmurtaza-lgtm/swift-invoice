"use client";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
}

interface Invoice {
  id: string;
  invoice_number: number;
  status: string;
  client_name: string;
  client_phone: string;
  currency: string;
  created_at: string;
  total: number;
}

interface InvoiceLayoutProps {
  invoice: Invoice;
  items: LineItem[] | null;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  CZK: "Kč",
};

export default function InvoiceLayout({ invoice, items }: InvoiceLayoutProps) {
  const symbol = CURRENCY_SYMBOLS[invoice.currency || "USD"];
  const subtotal = invoice.total / 1.08; 
  const tax = invoice.total - subtotal;

  return (
    // Cleaned container classes: stripped min-h-screen and bg-gray-100 to let root layout footer display gracefully
    <main className="py-10 px-4 print:bg-white print:py-0 text-gray-900">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-8 print:shadow-none print:border-none print:p-0">
        
        {/* Print Action Bar */}
        <div className="flex justify-between items-center mb-8 pb-6 border-b print:hidden">
          <div>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              {invoice.status}
            </span>
          </div>
          <button 
            onClick={() => window.print()} // Safely works here because it's a Client Component!
            className="bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow transition-all active:scale-95"
          >
            🖨️ Print or Save as PDF
          </button>
        </div>

        {/* Invoice Layout Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">INVOICE</h1>
            <p className="text-xs font-medium text-gray-400 mt-1">Invoice Reference ID: #{invoice.invoice_number}</p>
          </div>
          <div className="text-right">
            <h2 className="text-base font-bold text-gray-800">Field Service Pro</h2>
            <p className="text-xs text-gray-400 mt-0.5">Support Desk & Maintenance</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-4 mb-8">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Billed To</span>
            <span className="text-sm font-bold text-gray-800 mt-1 block">{invoice.client_name}</span>
            <span className="text-xs font-medium text-gray-500 mt-0.5 block">{invoice.client_phone}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Date Issued</span>
            <span className="text-sm font-bold text-gray-800 mt-1 block">
              {new Date(invoice.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3">Description</th>
                <th className="py-3 text-center">Qty</th>
                <th className="py-3 text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-700">
              {items?.map((item) => (
                <tr key={item.id}>
                  <td className="py-4 text-gray-900 font-semibold">{item.description}</td>
                  <td className="py-4 text-center text-gray-400 font-bold">{item.quantity}</td>
                  <td className="py-4 text-right text-gray-900 font-bold">
                    {invoice.currency === "CZK" ? `${item.unit_price} ${symbol}` : `${symbol}${item.unit_price}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculations */}
        <div className="border-t border-gray-100 pt-4 flex justify-end">
          <div className="w-64 space-y-2 text-sm font-medium">
            <div className="flex justify-between text-gray-400">
              <span>Net Subtotal:</span>
              <span>{invoice.currency === "CZK" ? `${subtotal.toFixed(2)} Kč` : `${symbol}${subtotal.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>VAT / Tax (8.00%):</span>
              <span>{invoice.currency === "CZK" ? `${tax.toFixed(2)} Kč` : `${symbol}${tax.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-dashed">
              <span>Amount Paid:</span>
              <span className="text-emerald-600">
                {invoice.currency === "CZK" ? `${invoice.total.toFixed(2)} Kč` : `${symbol}${invoice.total.toFixed(2)}`}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-100 text-center text-xs font-semibold text-gray-400">
          Thank you for your business! Payment was processed upon field execution service completion.
        </div>

      </div>
    </main>
  );
}