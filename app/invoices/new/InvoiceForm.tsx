"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  CZK: "Kč",
};

export default function InvoiceForm() {
  const supabase = createClient();
  
  // 1. Reactive States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [currency, setCurrency] = useState("USD"); 
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unit_price: 0 }
  ]);
  const [totals, setTotals] = useState({ subtotal: 0, total: 0 });

  // 2. Velocity Presets
  const servicePresets = [
    { name: "Diagnostic Fee", USD: 85, EUR: 80, CZK: 2000 },
    { name: "Standard Labor (Hourly)", USD: 120, EUR: 110, CZK: 2800 },
    { name: "Emergency Call-Out", USD: 150, EUR: 140, CZK: 3500 },
  ];

  // 3. Automatic Financial Ledger Recalculations (Tax-Free Logic)
  useEffect(() => {
    const subtotal = lineItems.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
    setTotals({ subtotal, total: subtotal });
  }, [lineItems]);

  // 4. Quick-Add Handler
  const handleQuickAdd = (description: string, presetPrices: Record<string, number>) => {
    const selectedPrice = presetPrices[currency] || 0;

    if (lineItems.length === 1 && lineItems[0].description === "" && lineItems[0].unit_price === 0) {
      setLineItems([{ description, quantity: 1, unit_price: selectedPrice }]);
    } else {
      setLineItems([...lineItems, { description, quantity: 1, unit_price: selectedPrice }]);
    }
  };

  // 5. Dynamic Matrix Array Updater for Manual Typing
  const updateLineItem = (index: number, fields: Partial<LineItem>) => {
    const updated = lineItems.map((item, i) => i === index ? { ...item, ...fields } : item);
    setLineItems(updated);
  };

  // 6. Submit Data Handler with Deep Structural Logs
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || lineItems.length === 0 || lineItems[0].description === "") {
      alert("Please fill out the client name and add at least one line item.");
      return;
    }
    
    setIsSubmitting(true);

    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id || "00000000-0000-0000-0000-000000000000";

      // Save parent row
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          user_id: userId,
          client_name: clientName,
          client_phone: clientPhone,
          tax_rate: 0, 
          total: totals.total,
          status: "unpaid",
          currency: currency 
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Save children rows
      const itemsToInsert = lineItems.map(item => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price
      }));

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      triggerWhatsApp(invoice.id);

    } catch (error: any) {
      // Direct raw object log dump
      console.error("Database Fault Catch:", error);
      
      // Explicit inspection criteria to break open hidden properties
      if (error && (error.message || error.details || error.hint)) {
        console.error("Supabase Detailed Diagnostic:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        alert(`Database Fault: ${error.message}\nDetails: ${error.details || "None"}`);
      } else {
        // Absolute fallback stringification protocol
        const fallbackString = JSON.stringify(error, Object.getOwnPropertyNames(error));
        console.error("Stringified Fault Output:", fallbackString);
        alert(`Database Structural Fault: ${fallbackString}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerWhatsApp = (invoiceId: string) => {
    const cleanPhone = clientPhone.replace(/\D/g, "");
    const symbol = CURRENCY_SYMBOLS[currency];
    const formattedTotal = currency === "CZK" ? `${totals.total.toFixed(2)} ${symbol}` : `${symbol}${totals.total.toFixed(2)}`;
    
    const appUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

    const message = `Hi ${clientName},\n\nThank you for choosing our service team. Your digital invoice is processed. Total due is ${formattedTotal}. View your full receipt and print your PDF here:\n👉 ${appUrl}/invoice/${invoiceId}`;
    
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.location.href = whatsappUrl;
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 pb-28 text-gray-900">
      
      {/* App Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Swift Invoice Generator</h1>
        <p className="text-xs font-semibold text-gray-400 mt-1">
          Developed by{" "}
          <a 
            href="https://www.nematy.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-emerald-600 hover:text-emerald-700 hover:underline transition-all"
          >
            Murtaza Nematy
          </a>
        </p>
      </div>

      {/* Global Configuration Panel */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4 mb-4">
        <div>
          <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Billing Currency</label>
          <div className="grid grid-cols-3 gap-2">
            {["USD", "EUR", "CZK"].map((cur) => (
              <button
                key={cur}
                type="button"
                onClick={() => setCurrency(cur)}
                className={`py-2.5 text-sm font-bold rounded-lg border transition-all ${
                  currency === cur
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {cur} ({CURRENCY_SYMBOLS[cur]})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CRM Customer Profile Block */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4 mb-4">
        <div>
          <label className="text-xs font-bold uppercase text-gray-400">Customer Details</label>
          <input
            type="text"
            required
            placeholder="Client Name"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full mt-1 p-3 border border-gray-200 rounded-lg text-sm font-medium focus:outline-emerald-500 bg-white"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-gray-400">WhatsApp Destination Phone</label>
          <input
            type="tel"
            required
            placeholder="e.g. +420123456789"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            className="w-full mt-1 p-3 border border-gray-200 rounded-lg text-sm font-medium focus:outline-emerald-500 bg-white"
          />
        </div>
      </div>

      {/* High-Velocity Presets Module */}
      <div className="mb-4">
        <label className="text-xs font-bold uppercase text-gray-400 block mb-2">⚡ Quick Add Presets ({currency})</label>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {servicePresets.map((preset, idx) => {
            const price = preset[currency as keyof typeof preset] as number;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickAdd(preset.name, { USD: preset.USD, EUR: preset.EUR, CZK: preset.CZK })}
                className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-4 py-2.5 rounded-full border border-emerald-100 whitespace-nowrap active:scale-95 transition-transform"
              >
                + {preset.name} ({currency === "CZK" ? `${price} Kč` : `${CURRENCY_SYMBOLS[currency]}${price}`})
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Ledger Item List */}
      <div className="space-y-3 mb-4">
        <label className="text-xs font-bold uppercase text-gray-400 block">Ledger Items (Tap fields to type manually)</label>
        {lineItems.map((item, index) => (
          <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2">
            <input
              type="text"
              placeholder="Item name / Custom work"
              value={item.description}
              onChange={(e) => updateLineItem(index, { description: e.target.value })}
              className="flex-1 text-sm font-medium focus:outline-none bg-white text-gray-900"
            />
            
            <div className="flex items-center gap-1 border-l pl-2 border-gray-100">
              <input
                type="number"
                min="1"
                placeholder="1"
                value={item.quantity}
                onChange={(e) => updateLineItem(index, { quantity: Math.max(1, Number(e.target.value)) })}
                className="w-8 text-xs text-gray-400 text-center focus:outline-none font-medium bg-white"
              />
              <span className="text-gray-300 text-xs">x</span>
              <span className="text-gray-400 text-sm font-medium">{CURRENCY_SYMBOLS[currency]}</span>
              <input
                type="number"
                placeholder="0"
                value={item.unit_price || ""}
                onChange={(e) => updateLineItem(index, { unit_price: Number(e.target.value) })}
                className="w-20 text-sm font-bold text-right focus:outline-none bg-white text-gray-900"
              />
            </div>
          </div>
        ))}
        
        <button
          type="button"
          onClick={() => setLineItems([...lineItems, { description: "", quantity: 1, unit_price: 0 }])}
          className="text-xs font-bold text-emerald-600 mt-1 block active:opacity-70"
        >
          + Insert Custom Manual Row
        </button>
      </div>

      {/* Cleaned Financial Matrix Calculation Display */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-2 mb-6">
        <div className="flex justify-between text-xs text-gray-500 font-medium">
          <span>Net Subtotal:</span>
          <span>
            {currency === "CZK" 
              ? `${totals.subtotal.toFixed(2)} Kč` 
              : `${CURRENCY_SYMBOLS[currency]}${totals.subtotal.toFixed(2)}`}
          </span>
        </div>
        
        <div className="flex justify-between text-sm font-bold text-gray-800 border-t pt-2 mt-2">
          <span>Total Outstanding Due:</span>
          <span className="text-emerald-600">
            {currency === "CZK" 
              ? `${totals.total.toFixed(2)} Kč` 
              : `${CURRENCY_SYMBOLS[currency]}${totals.total.toFixed(2)}`}
          </span>
        </div>
      </div>

      {/* Bottom Sticky Interactive Trigger Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 max-w-md mx-auto z-50">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-[0.99] transition-all disabled:opacity-50"
        >
          {isSubmitting ? "Processing..." : "Generate & Launch WhatsApp"}
        </button>
      </div>
    </form>
  );
}