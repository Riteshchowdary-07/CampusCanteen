import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { FileText, Printer } from 'lucide-react';

export const StudentInvoices: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/invoices');
      setInvoices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenPrintableInvoice = (invoiceId: number) => {
    const url = `/api/invoices/${invoiceId}/html`;

    api.get(url, { responseType: 'text' })
      .then((res) => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(res.data);
          printWindow.document.close();
        }
      })
      .catch((err) => {
        alert(err.response?.data?.detail || 'Failed to generate printable invoice.');
      });
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8 max-w-5xl">
          
          <h1 className="text-2xl font-black text-white tracking-tight mb-2 flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-400" /> Invoices & Itemized Digital Receipts
          </h1>
          <p className="text-xs text-stone-400 mb-8">View itemized billing records with 5% GST breakdown and Razorpay Payment IDs.</p>

          <div className="space-y-4">
            {invoices.map((inv) => (
              <div key={inv.id} className="p-5 bg-stone-900 border border-stone-800 rounded-2xl flex items-center justify-between shadow-lg">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-bold text-amber-400 text-sm">{inv.invoice_number}</span>
                    <span className="text-xs font-semibold text-stone-400">Order #{inv.order_number}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {inv.payment_method || 'RAZORPAY_SANDBOX'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-1">
                    Issued: {new Date(inv.issue_date).toLocaleString()} • Customer: {inv.customer_name}
                  </p>
                  {inv.razorpay_payment_id && (
                    <span className="text-[10px] text-stone-500 font-mono mt-0.5 block">
                      Razorpay Payment Ref: {inv.razorpay_payment_id}
                    </span>
                  )}
                </div>

                <div className="text-right flex items-center space-x-6">
                  <div>
                    <span className="font-black text-base text-amber-400 block">₹{inv.amount}</span>
                    <span className="text-[10px] text-stone-400 font-semibold uppercase">Status: {inv.status}</span>
                  </div>

                  <button
                    onClick={() => handleOpenPrintableInvoice(inv.id)}
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                    title="Print / Save PDF Invoice"
                  >
                    <Printer className="w-4 h-4 text-amber-400" /> Print PDF Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>

        </main>
      </div>
    </div>
  );
};
