import React, { useState, useEffect } from 'react';
import {
  Receipt,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CreditCard,
  Printer,
  DollarSign,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { FeeRecord, FeeStatus } from '../../types.ts';
import { Modal } from '../common/Modal.tsx';

export const StudentFees: React.FC = () => {
  const { user } = useAuth();
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);

  const [payForm, setPayForm] = useState({
    amount: 0,
    paymentMode: 'NetBanking',
    receiptNo: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFees = async () => {
    try {
      setLoading(true);
      const data = await api.getFees({ studentId: user?.studentId });
      setFees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load student fees:', err);
      setFees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFees();
  }, [user]);

  const totalBilled = (fees || []).reduce((acc, f) => acc + f.amount, 0);
  const totalPaid = (fees || []).reduce((acc, f) => acc + (f.paidAmount || 0), 0);
  const totalOutstanding = totalBilled - totalPaid;

  const handleOpenPay = (fee: FeeRecord) => {
    setSelectedFee(fee);
    const balance = fee.amount - (fee.paidAmount || 0);
    setPayForm({
      amount: balance,
      paymentMode: 'NetBanking',
      receiptNo: `STU-RCPT-${Math.floor(100000 + Math.random() * 900000)}`,
    });
    setError(null);
    setIsPayOpen(true);
  };

  const handleOpenReceipt = (fee: FeeRecord) => {
    setSelectedFee(fee);
    setIsReceiptOpen(true);
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFee) return;
    try {
      setSubmitting(true);
      const updated = await api.recordFeePayment(selectedFee.id, payForm);
      setIsPayOpen(false);
      loadFees();
      setSelectedFee(updated);
      setIsReceiptOpen(true);
    } catch (err: any) {
      setError(err.message || 'Payment processing failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge: Record<FeeStatus, { label: string; class: string; icon: any }> = {
    PAID: { label: 'PAID', class: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
    PARTIAL: { label: 'PARTIAL', class: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock },
    PENDING: { label: 'PENDING', class: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
    OVERDUE: { label: 'OVERDUE', class: 'bg-rose-50 text-rose-700 border-rose-200', icon: AlertTriangle },
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Fee Ledger</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review academic tuition obligations, settled invoices, and download stamped institutional fee receipts.
        </p>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase">Total Term Fees</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">${totalBilled.toLocaleString()}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Tuition, laboratories, & library dues</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-emerald-600 uppercase">Paid & Cleared</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">${totalPaid.toLocaleString()}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            {Math.round((totalPaid / (totalBilled || 1)) * 100)}% Cleared
          </span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-amber-600 uppercase">Outstanding Balance</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">${totalOutstanding.toLocaleString()}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {totalOutstanding === 0 ? 'No outstanding dues' : 'Payment required before term finals'}
          </span>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Fee Category</th>
                <th className="py-3 px-4">Billed Amount</th>
                <th className="py-3 px-4">Paid Amount</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    <div className="inline-block w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-xs">Loading fee invoices...</p>
                  </td>
                </tr>
              ) : fees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold text-slate-600">No fee charges recorded</p>
                  </td>
                </tr>
              ) : (
                fees.map((fee) => {
                  const badge = statusBadge[fee.status];
                  const Icon = badge.icon;
                  const isFullyPaid = fee.status === 'PAID';

                  return (
                    <tr key={fee.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {fee.id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {fee.feeType}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        ${fee.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-700">
                        ${(fee.paidAmount || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {fee.dueDate}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.class}`}>
                          <Icon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {!isFullyPaid && (
                            <button
                              id={`btn-student-pay-${fee.id}`}
                              onClick={() => handleOpenPay(fee)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-colors"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Pay Online</span>
                            </button>
                          )}
                          {fee.paidAmount && fee.paidAmount > 0 && (
                            <button
                              id={`btn-student-receipt-${fee.id}`}
                              onClick={() => handleOpenReceipt(fee)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="Download Receipt"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ONLINE PAYMENT MODAL */}
      <Modal isOpen={isPayOpen} onClose={() => setIsPayOpen(false)} title="Secure Student Fee Portal" maxWidth="md">
        <form onSubmit={handlePaySubmit} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {error}
            </div>
          )}

          {selectedFee && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice:</span>
                <span className="font-semibold text-slate-900">{selectedFee.feeType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Due Date:</span>
                <span className="font-medium text-slate-800">{selectedFee.dueDate}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Amount to Pay:</span>
                <span className="text-emerald-700">${selectedFee.amount - (selectedFee.paidAmount || 0)}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Payment Gateway</label>
            <div className="grid grid-cols-3 gap-2">
              {['NetBanking', 'Card', 'UPI'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPayForm({ ...payForm, paymentMode: mode })}
                  className={`py-2 px-3 rounded-lg border text-center font-bold text-xs transition-colors ${
                    payForm.paymentMode === mode
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>256-Bit SSL Encrypted Institutional Transaction. Instant Receipt Generation.</span>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsPayOpen(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Authorizing...' : 'Confirm & Authorize Payment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* RECEIPT MODAL */}
      <Modal isOpen={isReceiptOpen} onClose={() => setIsReceiptOpen(false)} title="Institutional Fee Receipt Voucher" maxWidth="md">
        {selectedFee && (
          <div className="space-y-4 text-xs">
            <div className="border-2 border-slate-800 p-5 rounded-xl bg-white space-y-4">
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">EduManage Institute</h3>
                  <p className="text-[10px] text-slate-500">Student Copy • Paid Receipt</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-slate-900 text-xs">{selectedFee.receiptNo || 'RCPT-ONLINE'}</p>
                  <p className="text-[10px] text-slate-500">Date: {selectedFee.paidDate || new Date().toISOString().split('T')[0]}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Student Name:</span>
                  <span className="font-bold text-slate-800">{user?.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Roll ID:</span>
                  <span className="font-mono font-bold text-indigo-700">{user?.studentId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Invoice Description:</span>
                  <span className="font-medium text-slate-800">{selectedFee.feeType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Payment Mode:</span>
                  <span className="font-medium text-slate-800">{selectedFee.paymentMode || 'NetBanking'}</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-sm">
                <span className="font-bold text-slate-800">Amount Paid:</span>
                <span className="font-black text-emerald-700 text-base">${selectedFee.paidAmount?.toLocaleString()}</span>
              </div>

              <div className="border-t border-dashed border-slate-200 pt-3 text-center text-[10px] text-slate-400">
                Official electronic receipt verified by Office of Institutional Finance.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Voucher</span>
              </button>
              <button
                onClick={() => setIsReceiptOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
