import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Search,
  Printer,
  CreditCard
} from 'lucide-react';
import { api } from '../../api.ts';
import { FeeRecord, FeeStatus, Student } from '../../types.ts';
import { Modal } from '../common/Modal.tsx';

export const AdminFees: React.FC = () => {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);

  // Forms
  const [addForm, setAddForm] = useState({
    studentId: '',
    feeType: 'Tuition Fee',
    amount: 2500,
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  });

  const [payForm, setPayForm] = useState({
    amount: 0,
    paymentMode: 'NetBanking',
    receiptNo: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [feeRes, stuRes] = await Promise.all([
        api.getFees({ status: statusFilter || undefined }),
        api.getStudents(),
      ]);
      setFees(Array.isArray(feeRes) ? feeRes : []);
      setStudents(Array.isArray(stuRes) ? stuRes : []);
    } catch (err: any) {
      console.error('Failed to load fees:', err);
      setFees([]);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const totalBilled = (fees || []).reduce((acc, f) => acc + f.amount, 0);
  const totalPaid = (fees || []).reduce((acc, f) => acc + (f.paidAmount || 0), 0);
  const totalOutstanding = totalBilled - totalPaid;

  const handleOpenAdd = () => {
    setAddForm({
      studentId: students[0]?.id || '',
      feeType: 'Semester V Tuition Fee',
      amount: 2500,
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    });
    setError(null);
    setIsAddOpen(true);
  };

  const handleOpenPay = (fee: FeeRecord) => {
    setSelectedFee(fee);
    const balance = fee.amount - (fee.paidAmount || 0);
    setPayForm({
      amount: balance,
      paymentMode: 'NetBanking',
      receiptNo: `RCPT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    });
    setError(null);
    setIsPayOpen(true);
  };

  const handleOpenReceipt = (fee: FeeRecord) => {
    setSelectedFee(fee);
    setIsReceiptOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.studentId || addForm.amount <= 0) {
      setError('Please choose a student and enter a valid amount.');
      return;
    }
    try {
      setSubmitting(true);
      await api.createFee(addForm);
      setIsAddOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create fee entry.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFee) return;
    if (payForm.amount <= 0) {
      setError('Payment amount must be greater than zero.');
      return;
    }
    try {
      setSubmitting(true);
      const updated = await api.recordFeePayment(selectedFee.id, payForm);
      setIsPayOpen(false);
      loadData();
      // Show receipt right after payment
      setSelectedFee(updated);
      setIsReceiptOpen(true);
    } catch (err: any) {
      setError(err.message || 'Failed to record payment.');
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

  const filteredFees = fees.filter((f) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      f.studentName?.toLowerCase().includes(q) ||
      f.studentRoll?.toLowerCase().includes(q) ||
      f.feeType?.toLowerCase().includes(q) ||
      f.receiptNo?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Fee Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track student tuition dues, record collections, generate official receipts, and manage finances.
          </p>
        </div>
        <button
          id="btn-create-fee"
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Issue Fee Invoice</span>
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase">Total Billed</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">${totalBilled.toLocaleString()}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Across all active students</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-emerald-600 uppercase">Total Collected</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">${totalPaid.toLocaleString()}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            {Math.round((totalPaid / (totalBilled || 1)) * 100)}% Collection Rate
          </span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-amber-600 uppercase">Outstanding Dues</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">${totalOutstanding.toLocaleString()}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Pending & Overdue invoices</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, roll number, invoice type, receipt #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="PAID">PAID</option>
          <option value="PARTIAL">PARTIAL</option>
          <option value="PENDING">PENDING</option>
          <option value="OVERDUE">OVERDUE</option>
        </select>
      </div>

      {/* Fees Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Fee Description</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Paid</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    <div className="inline-block w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-xs">Loading fee invoices...</p>
                  </td>
                </tr>
              ) : filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold text-slate-600">No fee records found</p>
                  </td>
                </tr>
              ) : (
                filteredFees.map((fee) => {
                  const badge = statusBadge[fee.status];
                  const Icon = badge.icon;
                  const isFullyPaid = fee.status === 'PAID';
                  return (
                    <tr key={fee.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {fee.id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{fee.studentName}</div>
                        <div className="font-mono text-[11px] text-indigo-600">{fee.studentRoll}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
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
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.class}`}>
                          <Icon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {!isFullyPaid && (
                            <button
                              id={`btn-pay-fee-${fee.id}`}
                              onClick={() => handleOpenPay(fee)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                            >
                              <DollarSign className="w-3 h-3" />
                              <span>Collect</span>
                            </button>
                          )}
                          {fee.paidAmount && fee.paidAmount > 0 && (
                            <button
                              id={`btn-receipt-${fee.id}`}
                              onClick={() => handleOpenReceipt(fee)}
                              className="p-1 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="Print Receipt"
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

      {/* ISSUE INVOICE MODAL */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Issue Institutional Fee Invoice" maxWidth="md">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student *</label>
            <select
              value={addForm.studentId}
              onChange={(e) => setAddForm({ ...addForm, studentId: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white"
              required
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.studentId} - {s.name} ({s.courseName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Fee Category / Description *</label>
            <input
              type="text"
              value={addForm.feeType}
              onChange={(e) => setAddForm({ ...addForm, feeType: e.target.value })}
              placeholder="e.g. Fall 2026 Tuition Fee"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Amount ($) *</label>
              <input
                type="number"
                value={addForm.amount}
                onChange={(e) => setAddForm({ ...addForm, amount: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date *</label>
              <input
                type="date"
                value={addForm.dueDate}
                onChange={(e) => setAddForm({ ...addForm, dueDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Issuing...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* RECORD PAYMENT MODAL */}
      <Modal isOpen={isPayOpen} onClose={() => setIsPayOpen(false)} title="Record Fee Payment" maxWidth="md">
        <form onSubmit={handlePaySubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {error}
            </div>
          )}

          {selectedFee && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Student:</span>
                <span className="font-bold text-slate-800">{selectedFee.studentName} ({selectedFee.studentRoll})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fee Category:</span>
                <span className="font-medium text-slate-800">{selectedFee.feeType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Invoice:</span>
                <span className="font-bold text-slate-900">${selectedFee.amount}</span>
              </div>
              <div className="flex justify-between text-amber-700">
                <span className="font-semibold">Remaining Balance:</span>
                <span className="font-bold">${selectedFee.amount - (selectedFee.paidAmount || 0)}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Amount to Collect ($) *</label>
            <input
              type="number"
              value={payForm.amount}
              onChange={(e) => setPayForm({ ...payForm, amount: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-bold"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
              <select
                value={payForm.paymentMode}
                onChange={(e) => setPayForm({ ...payForm, paymentMode: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="NetBanking">Net Banking</option>
                <option value="Cash">Cash at Counter</option>
                <option value="Card">Credit/Debit Card</option>
                <option value="UPI">UPI / Digital Wallet</option>
                <option value="Cheque">Bank Cheque / DD</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Receipt Number</label>
              <input
                type="text"
                value={payForm.receiptNo}
                onChange={(e) => setPayForm({ ...payForm, receiptNo: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsPayOpen(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Processing...' : 'Confirm Payment & Generate Receipt'}
            </button>
          </div>
        </form>
      </Modal>

      {/* OFFICIAL RECEIPT MODAL */}
      <Modal isOpen={isReceiptOpen} onClose={() => setIsReceiptOpen(false)} title="Official Fee Payment Receipt" maxWidth="md">
        {selectedFee && (
          <div className="space-y-4 text-xs">
            <div id="printable-receipt" className="border-2 border-slate-800 p-5 rounded-xl bg-white space-y-4">
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">EduManage Institute</h3>
                  <p className="text-[10px] text-slate-500">Official Fee Receipt Voucher</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-slate-900 text-xs">{selectedFee.receiptNo || 'RCPT-ONLINE'}</p>
                  <p className="text-[10px] text-slate-500">Date: {selectedFee.paidDate || new Date().toISOString().split('T')[0]}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Student Name:</span>
                  <span className="font-bold text-slate-800">{selectedFee.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Roll / Student ID:</span>
                  <span className="font-mono font-bold text-indigo-700">{selectedFee.studentRoll}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Fee Description:</span>
                  <span className="font-medium text-slate-800">{selectedFee.feeType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Payment Mode:</span>
                  <span className="font-medium text-slate-800">{selectedFee.paymentMode || 'Institutional NetBanking'}</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-sm">
                <span className="font-bold text-slate-800">Amount Paid:</span>
                <span className="font-black text-emerald-700 text-base">${selectedFee.paidAmount?.toLocaleString()}</span>
              </div>

              <div className="border-t border-dashed border-slate-200 pt-3 text-center text-[10px] text-slate-400">
                This is a computer generated institutional fee document. No signature required.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
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
