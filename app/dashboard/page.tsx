"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

interface Invoice {
  id: string;
  created_at: string;
  client_name: string;
  client_phone: string;
  total: number;
  status: "unpaid" | "paid";
  currency: string;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  CZK: "Kč",
};

export default function Dashboard() {
  const supabase = createClient();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch invoices on page load
  useEffect(() => {
    async function fetchInvoices() {
      try {
        const { data, error } = await supabase
          .from("invoices")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (data) setInvoices(data);
      } catch (err) {
        console.error("Error pulling history:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchInvoices();
  }, []);

  // Inline handler to quickly toggle payment status
  const toggleStatus = async (id: string, currentStatus: "unpaid" | "paid") => {
    const nextStatus = currentStatus === "unpaid" ? "paid" : "unpaid";
    
    // Optimistic UI update
    setInvoices(prev => 
      prev.map(inv => inv.id === id ? { ...inv, status: nextStatus } : inv)
    );

    const { error } = await supabase
      .from("invoices")
      .update({ status: nextStatus })
      .eq("id", id);

    if (error) {
      console.error("Failed to update status:", error);
      alert("Could not update status on server. Reverting.");
      // Revert if database write fails
      setInvoices(prev => 
        prev.map(inv => inv.id === id ? { ...inv, status: currentStatus } : inv)
      );
    }
  };

  const formatMoney = (amount: number, currency: string) => {
    const symbol = CURRENCY_SYMBOLS[currency] || "";
    return currency === "CZK" 
      ? `${amount.toFixed(2)} ${symbol}` 
      : `${symbol}${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-6 text-center text-sm font-medium text-gray-500">
        Loading your invoice ledger...
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 pb-24 text-gray-900">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Invoice History</h1>
          <p className="text-xs font-semibold text-gray-400 mt-0.5">Track your pipeline and cashflow</p>
        </div>
        <Link 
          href="/" 
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-sm transition-all"
        >
          + New Invoice
        </Link>
      </div>

      {/* Invoice Grid/List */}
      {invoices.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-gray-400">No invoices generated yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <div 
              key={invoice.id} 
              className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-gray-800">{invoice.client_name}</h3>
                  <p className="text-xs text-gray-400 font-medium">
                    {new Date(invoice.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900 block">
                    {formatMoney(invoice.total, invoice.currency)}
                  </span>
                </div>
              </div>

              {/* Action Rows */}
              <div className="flex justify-between items-center border-t border-gray-50 pt-3 mt-1">
                {/* Status Trigger Toggle */}
                <button
                  type="button"
                  onClick={() => toggleStatus(invoice.id, invoice.status)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all border ${
                    invoice.status === "paid"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : "bg-amber-50 text-amber-700 border-amber-100"
                  }`}
                >
                  {invoice.status === "paid" ? "✓ Paid" : "⏳ Unpaid"}
                </button>

                {/* Quick Link Out to Public Receipt view */}
                <a
                  href={`/invoice/${invoice.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-gray-400 hover:text-emerald-600 transition-colors"
                >
                  View Receipt ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}