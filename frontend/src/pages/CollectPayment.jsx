import { useEffect, useState } from 'react';
import API from '../api/axios';
import { CreditCard, CheckCircle, AlertCircle, Receipt, Search, Clock } from 'lucide-react';

const CollectPayment = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Payment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeInstallment, setActiveInstallment] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amountPaid: '',
    paymentMode: 'Cash',
    transactionRef: '',
    remarks: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [receiptDetails, setReceiptDetails] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await API.get('/master/students');
        setStudents(res.data);
      } catch (err) {
        setError('Failed to fetch students');
      }
    };
    fetchStudents();
  }, []);

  const fetchStudentFees = async (studentId) => {
    if (!studentId) {
      setAssignments([]);
      return;
    }
    try {
      setLoading(true);
      setError('');
      setReceiptDetails(null);
      const res = await API.get(`/fees/student/${studentId}`);
      setAssignments(res.data);
    } catch (err) {
      setError('Failed to fetch fee details');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentChange = (e) => {
    const id = e.target.value;
    setSelectedStudent(id);
    fetchStudentFees(id);
  };

  const openPaymentModal = (installment) => {
    setError('');
    setSuccess('');
    setReceiptDetails(null);
    setActiveInstallment(installment);
    setPaymentData({
      amountPaid: installment.pendingAmount, // Default to full pending amount
      paymentMode: 'Cash',
      transactionRef: '',
      remarks: ''
    });
    setIsModalOpen(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (Number(paymentData.amountPaid) <= 0) {
      setError('Amount must be greater than zero');
      return;
    }
    if (Number(paymentData.amountPaid) > activeInstallment.pendingAmount) {
      setError(`Cannot exceed pending balance of ₹${activeInstallment.pendingAmount}`);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await API.post('/payments/collect', {
        installmentId: activeInstallment._id,
        amountPaid: Number(paymentData.amountPaid),
        paymentMode: paymentData.paymentMode,
        transactionRef: paymentData.transactionRef,
        remarks: paymentData.remarks
      });

      setSuccess(`Payment successful! Receipt generated: ${res.data.receiptNumber}`);
      setReceiptDetails({ ...res.data.payment, receiptNumber: res.data.receiptNumber });
      setIsModalOpen(false);
      fetchStudentFees(selectedStudent); // Refresh list
    } catch (err) {
      setError(err.response?.data?.message || 'Payment processing failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PAID: 'bg-green-100 text-green-800',
      PARTIALLY_PAID: 'bg-amber-100 text-amber-800',
      PENDING: 'bg-gray-100 text-gray-800',
      OVERDUE: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Collect Payment</h1>
        <p className="text-sm text-gray-500">Process student fee payments, allow partial payments, and generate receipts</p>
      </div>

      {error && !isModalOpen && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {success && !isModalOpen && (
        <div className="flex flex-col gap-3 rounded-lg bg-green-50 p-4 text-sm text-green-700 border border-green-200 shadow-sm">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle className="h-5 w-5 text-green-600" />
            {success}
          </div>
          {receiptDetails && (
            <div className="ml-7 rounded bg-white p-3 border border-green-100 text-gray-600 print-only no-print">
              <p><strong>Receipt No:</strong> {receiptDetails.receiptNumber}</p>
              <p><strong>Amount Paid:</strong> ₹{receiptDetails.amountPaid}</p>
              <p><strong>Mode:</strong> {receiptDetails.paymentMode}</p>
              <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
              <button 
                onClick={() => window.print()}
                className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
              >
                Print Receipt
              </button>
            </div>
          )}
        </div>
      )}

      {/* Student Selection */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 no-print">
        <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Search & Select Student</label>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <select
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none appearance-none"
            value={selectedStudent}
            onChange={handleStudentChange}
          >
            <option value="">-- Select a Student --</option>
            {students.map((st) => (
              <option key={st._id} value={st._id}>
                {st.grNumber} - {st.firstName} {st.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fee Details & Installments */}
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : (
        selectedStudent && assignments.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center text-gray-500 border border-gray-100">
            No fee structures assigned to this student yet.
          </div>
        ) : (
          <div className="space-y-6 no-print">
            {assignments.map((assignment) => (
              <div key={assignment._id} className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-800">{assignment.feeStructureId?.feeHead}</h3>
                    <p className="text-xs text-gray-500">Net Payable: ₹{assignment.netPayable} | Assigned Total: ₹{assignment.totalAmount}</p>
                  </div>
                  {getStatusBadge(assignment.status)}
                </div>
                
                <div className="divide-y divide-gray-100">
                  {assignment.installments.map((inst) => (
                    <div key={inst._id} className="flex flex-col sm:flex-row items-center justify-between p-4 px-6 hover:bg-slate-50/50 transition">
                      <div className="flex-1 w-full sm:w-auto flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700 text-sm">{inst.installmentName}</span>
                          {getStatusBadge(inst.status)}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Due: {new Date(inst.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex-1 w-full sm:w-auto flex justify-between sm:justify-end items-center gap-6 mt-3 sm:mt-0">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Pending</p>
                          <p className="font-bold text-rose-500">₹{inst.pendingAmount}</p>
                        </div>
                        <button
                          onClick={() => openPaymentModal(inst)}
                          disabled={inst.status === 'PAID'}
                          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50 disabled:bg-gray-300 disabled:text-gray-500"
                        >
                          <CreditCard className="h-4 w-4" />
                          {inst.status === 'PAID' ? 'Paid' : 'Collect'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 no-print">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">Process Payment</h2>
            </div>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                {error}
              </div>
            )}

            <div className="mb-5 rounded-lg bg-slate-50 p-4 border border-slate-100">
              <p className="text-xs text-gray-500 mb-1">{activeInstallment?.installmentName}</p>
              <div className="flex justify-between items-end">
                <span className="text-sm font-medium text-gray-700">Total Pending Balance</span>
                <span className="text-xl font-bold text-rose-600">₹{activeInstallment?.pendingAmount}</span>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600">Payment Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  max={activeInstallment?.pendingAmount}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
                  value={paymentData.amountPaid}
                  onChange={(e) => setPaymentData({ ...paymentData, amountPaid: e.target.value })}
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Leave as default to pay full amount, or edit for partial payment.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600">Payment Mode</label>
                <select
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
                  value={paymentData.paymentMode}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentMode: e.target.value })}
                  required
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Card">Card</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              {['UPI', 'Card', 'Bank Transfer', 'Cheque'].includes(paymentData.paymentMode) && (
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600">Transaction Reference</label>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. UTR / Cheque Number"
                    value={paymentData.transactionRef}
                    onChange={(e) => setPaymentData({ ...paymentData, transactionRef: e.target.value })}
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600">Remarks (Optional)</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="Additional notes..."
                  value={paymentData.remarks}
                  onChange={(e) => setPaymentData({ ...paymentData, remarks: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectPayment;