import { useEffect, useState } from 'react';
import API from '../api/axios';
import { Search, Printer, FileText, ChevronLeft, ChevronRight, Download } from 'lucide-react';

const Reports = () => {
  const [payments, setPayments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentModeFilter, setPaymentModeFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [feeHeadFilter, setFeeHeadFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selected Receipt for Printable View
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const clsRes = await API.get('/master/classes');
        setClasses(clsRes.data || []);
      } catch (err) {
        console.error('Failed to load classes', err);
      }
    };
    fetchMasterData();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      let url = '/payments/history?';
      if (classFilter) url += `classId=${classFilter}&`;
      if (paymentModeFilter) url += `paymentMode=${paymentModeFilter}&`;
      if (startDate && endDate) url += `startDate=${startDate}&endDate=${endDate}&`;

      const res = await API.get(url);
      setPayments(res.data || []);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    setCurrentPage(1);
  }, [classFilter, paymentModeFilter, startDate, endDate]);

  const handlePrintReceipt = async (receiptNumber) => {
    try {
      const res = await API.get(`/payments/receipt/${receiptNumber}`);
      setSelectedReceipt(res.data);
      setTimeout(() => {
        window.print();
      }, 300);
    } catch (err) {
      alert('Error fetching receipt details');
    }
  };

  const exportToCSV = () => {
    if (filteredPayments.length === 0) return;

    const headers = ['Receipt No', 'Student Name', 'GR Number', 'Installment', 'Payment Mode', 'Txn Ref', 'Amount Paid', 'Date'];
    const rows = filteredPayments.map((p) => [
      p.receiptNumber || '',
      `"${p.studentId?.firstName || ''} ${p.studentId?.lastName || ''}"`,
      p.studentId?.grNumber || '',
      `"${p.installmentId?.installmentName || ''}"`,
      p.paymentMode || '',
      p.transactionRef || 'N/A',
      p.amountPaid || 0,
      p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Fee_Collection_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Safe Filtering Logic (Handles both Populated Object & Raw ID String)
  const filteredPayments = payments.filter((p) => {
    const query = searchQuery.toLowerCase();
    const studentName = `${p.studentId?.firstName || ''} ${p.studentId?.lastName || ''}`.toLowerCase();
    const grNumber = p.studentId?.grNumber?.toLowerCase() || '';
    const receipt = p.receiptNumber?.toLowerCase() || '';
    const transactionRef = p.transactionRef?.toLowerCase() || '';

    const matchesSearch =
      studentName.includes(query) ||
      grNumber.includes(query) ||
      receipt.includes(query) ||
      transactionRef.includes(query);

    // Get Class ID safely
    const actualClassId =
      typeof p.studentId?.classId === 'object'
        ? p.studentId?.classId?._id?.toString()
        : p.studentId?.classId?.toString();

    const matchesClass = classFilter ? actualClassId === classFilter : true;

    const matchesFeeHead = feeHeadFilter
      ? (p.installmentId?.installmentName || '').toLowerCase().includes(feeHeadFilter.toLowerCase())
      : true;

    return matchesSearch && matchesClass && matchesFeeHead;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);

  const totalCollectedInView = filteredPayments.reduce((acc, curr) => acc + (curr.amountPaid || 0), 0);

  return (
    <div className="space-y-6">
      {/* Printable Receipt Layout */}
      {selectedReceipt && (
        <div className="hidden print-only p-8 bg-white text-black font-sans">
          <div className="border-2 border-gray-800 p-6 rounded-lg space-y-4">
            <div className="flex justify-between items-center border-b border-gray-300 pb-4">
              <div>
                <h1 className="text-2xl font-bold uppercase tracking-wide">School Fee Engine</h1>
                <p className="text-xs text-gray-600">Official Fee Payment Receipt</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{selectedReceipt.receiptNumber}</p>
                <p className="text-xs text-gray-500">Date: {new Date(selectedReceipt.paymentDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm py-2">
              <div>
                <p className="text-gray-500 text-xs">STUDENT NAME</p>
                <p className="font-semibold">{selectedReceipt.studentId?.firstName} {selectedReceipt.studentId?.lastName}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">GR / ADMISSION NO.</p>
                <p className="font-semibold">{selectedReceipt.studentId?.grNumber}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">CLASS & SECTION</p>
                <p className="font-semibold">{selectedReceipt.studentId?.classId?.className} - {selectedReceipt.studentId?.classId?.section}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">PAYMENT MODE</p>
                <p className="font-semibold">{selectedReceipt.paymentMode}</p>
              </div>
            </div>

            <div className="border-t border-b border-gray-300 py-3 my-2">
              <div className="flex justify-between font-bold text-base">
                <span>Fee Head / Installment</span>
                <span>Amount Paid</span>
              </div>
              <div className="flex justify-between text-sm mt-1 text-gray-700">
                <span>{selectedReceipt.installmentId?.installmentName || 'Fee Installment'}</span>
                <span>₹{selectedReceipt.amountPaid}</span>
              </div>
            </div>

            <div className="flex justify-between items-end pt-4">
              <div>
                <p className="text-xs text-gray-500">Collected By: {selectedReceipt.collectedBy?.username}</p>
                <p className="text-xs text-gray-500">Remaining Balance: ₹{selectedReceipt.remainingBalance}</p>
              </div>
              <div className="text-center border-t border-gray-400 pt-1 w-32">
                <p className="text-xs font-semibold">Authorized Signatory</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Screen */}
      <div className="no-print space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Fee Collection Reports & Search</h1>
            <p className="text-sm text-gray-500">Filter and search payment histories by student, GR number, receipt, or transaction reference</p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Student, GR Number, Receipt, or Txn Ref..."
                  className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Class Filter */}
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Class / Section</label>
              <select
                className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>{cls.className} - {cls.section}</option>
                ))}
              </select>
            </div>

            {/* Payment Mode Filter */}
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Payment Mode</label>
              <select
                className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
                value={paymentModeFilter}
                onChange={(e) => setPaymentModeFilter(e.target.value)}
              >
                <option value="">All Payment Modes</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Card">Card</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 pt-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Start Date</label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">End Date</label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {/* Summary Badge */}
            <div className="flex flex-col justify-end">
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-right">
                <span className="block text-xs font-semibold uppercase text-emerald-600">Total In Filter</span>
                <span className="text-lg font-bold text-emerald-800">₹{totalCollectedInView.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2 text-sm font-medium text-gray-600">No payment transaction records found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Receipt No</th>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3">GR Number</th>
                      <th className="px-4 py-3">Installment</th>
                      <th className="px-4 py-3">Mode</th>
                      <th className="px-4 py-3">Txn Ref</th>
                      <th className="px-4 py-3">Amount Paid</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentPayments.map((p) => (
                      <tr key={p._id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-semibold text-blue-600">{p.receiptNumber}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{p.studentId?.firstName} {p.studentId?.lastName}</td>
                        <td className="px-4 py-3">{p.studentId?.grNumber}</td>
                        <td className="px-4 py-3">{p.installmentId?.installmentName}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                            {p.paymentMode}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{p.transactionRef || 'N/A'}</td>
                        <td className="px-4 py-3 font-bold text-green-600">₹{p.amountPaid}</td>
                        <td className="px-4 py-3">{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : ''}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handlePrintReceipt(p.receiptNumber)}
                            className="inline-flex items-center gap-1 rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
                          >
                            <Printer className="h-3.5 w-3.5" /> Print
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Interactive Pagination Toolbar */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4 text-xs text-gray-500">
                <span>
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredPayments.length)} of {filteredPayments.length} entries
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 rounded border border-gray-300 px-2.5 py-1.5 hover:bg-gray-50 transition disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </button>
                  <span className="font-semibold text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 rounded border border-gray-300 px-2.5 py-1.5 hover:bg-gray-50 transition disabled:opacity-40"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;