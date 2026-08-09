import { useEffect, useState } from 'react';
import API from '../api/axios';
import { UserPlus, AlertCircle, CheckCircle, Calculator, Calendar } from 'lucide-react';

const AssignFee = () => {
  const [students, setStudents] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    studentId: '',
    feeStructureId: '',
    discountAmount: 0,
    installmentsCount: 1,
  });

  const [selectedFee, setSelectedFee] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [studRes, feeRes] = await Promise.all([
          API.get('/master/students'),
          API.get('/fees/structures'),
        ]);

        const activeFees = feeRes.data.filter((f) => f.status === 'ACTIVE');
        setStudents(studRes.data || []);
        setFeeStructures(activeFees || []);

        if (studRes.data && studRes.data.length > 0) {
          const firstStudent = studRes.data[0];
          const studentClassId = typeof firstStudent.classId === 'object' 
            ? firstStudent.classId?._id 
            : firstStudent.classId;

          // Filter fees for the initial student
          const matchingFees = activeFees.filter((f) => {
            const fClassId = typeof f.classId === 'object' ? f.classId?._id : f.classId;
            return fClassId?.toString() === studentClassId?.toString();
          });

          const initialFee = matchingFees.length > 0 ? matchingFees[0] : null;

          setFormData((prev) => ({
            ...prev,
            studentId: firstStudent._id,
            feeStructureId: initialFee ? initialFee._id : '',
          }));
          setSelectedFee(initialFee);
        }
      } catch (err) {
        setError('Failed to fetch required setup data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Retrieve currently selected student object
  const selectedStudent = students.find((s) => s._id === formData.studentId);
  const selectedStudentClassId = typeof selectedStudent?.classId === 'object'
    ? selectedStudent?.classId?._id
    : selectedStudent?.classId;

  // Dynamically filter fee structures by student's class
  const filteredFeeStructures = feeStructures.filter((f) => {
    if (!selectedStudentClassId) return true;
    const fClassId = typeof f.classId === 'object' ? f.classId?._id : f.classId;
    return fClassId?.toString() === selectedStudentClassId?.toString();
  });

  // Handle Student Selection Change
  const handleStudentChange = (e) => {
    const newStudentId = e.target.value;
    const student = students.find((s) => s._id === newStudentId);
    const studentClassId = typeof student?.classId === 'object' ? student?.classId?._id : student?.classId;

    const matchingFees = feeStructures.filter((f) => {
      const fClassId = typeof f.classId === 'object' ? f.classId?._id : f.classId;
      return fClassId?.toString() === studentClassId?.toString();
    });

    const newFee = matchingFees.length > 0 ? matchingFees[0] : null;

    setFormData((prev) => ({
      ...prev,
      studentId: newStudentId,
      feeStructureId: newFee ? newFee._id : '',
    }));
    setSelectedFee(newFee);
  };

  const handleFeeChange = (e) => {
    const feeId = e.target.value;
    const fee = feeStructures.find((f) => f._id === feeId);
    setFormData((prev) => ({ ...prev, feeStructureId: feeId }));
    setSelectedFee(fee);
  };

  const totalAmount = selectedFee ? (selectedFee.amount || selectedFee.totalAmount || 0) : 0;
  const discount = Number(formData.discountAmount) || 0;
  const netPayable = Math.max(0, totalAmount - discount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.feeStructureId) {
      setError('Please select a valid fee structure for this student');
      return;
    }
    if (discount < 0) {
      setError('Discount cannot be negative');
      return;
    }
    if (discount > totalAmount) {
      setError('Discount cannot exceed the total fee amount');
      return;
    }

    try {
      setIsSubmitting(true);
      await API.post('/fees/assign', {
        ...formData,
        discountAmount: discount,
      });
      setSuccess('Fee assigned and installments generated successfully!');
      setFormData((prev) => ({ ...prev, discountAmount: 0, installmentsCount: 1 }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign fee');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Assign Fee to Student</h1>
        <p className="text-sm text-gray-500">Allocate fee structures, apply concessions, and configure installment plans</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-sm text-green-600 border border-green-200">
          <CheckCircle className="h-5 w-5" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Assignment Form */}
        <div className="md:col-span-2 rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Select Student</label>
              <select
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                value={formData.studentId}
                onChange={handleStudentChange}
                required
              >
                {students.map((st) => (
                  <option key={st._id} value={st._id}>
                    {st.firstName} {st.lastName} ({st.grNumber}) - {st.classId?.className} {st.classId?.section}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Select Fee Structure</label>
              <select
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                value={formData.feeStructureId}
                onChange={handleFeeChange}
                required
              >
                {filteredFeeStructures.length === 0 ? (
                  <option value="">No Fee Structures Available for this Class</option>
                ) : (
                  filteredFeeStructures.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.feeHead || f.feeHeadName} - ₹{f.amount || f.totalAmount} ({f.classId?.className} {f.classId?.section})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Discount / Concession (₹)</label>
                <input
                  type="number"
                  min="0"
                  max={totalAmount}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  value={formData.discountAmount}
                  onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Installment Count</label>
                <select
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  value={formData.installmentsCount}
                  onChange={(e) => setFormData({ ...formData, installmentsCount: Number(e.target.value) })}
                >
                  <option value={1}>1 (Single Payment)</option>
                  <option value={2}>2 Installments</option>
                  <option value={3}>3 Installments</option>
                  <option value={4}>4 Quarterly Installments</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || filteredFeeStructures.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-50"
            >
              <UserPlus className="h-5 w-5" />
              {isSubmitting ? 'Assigning...' : 'Assign Fee Structure'}
            </button>
          </form>
        </div>

        {/* Calculation Summary Card */}
        <div className="rounded-xl bg-slate-900 p-6 text-white shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-400 mb-4">
              <Calculator className="h-5 w-5" />
              <h3 className="font-bold text-lg">Payable Summary</h3>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Total Fee Amount</span>
                <span className="font-semibold text-white">₹{totalAmount}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Discount Concession</span>
                <span className="font-semibold text-rose-400">- ₹{discount}</span>
              </div>
              <div className="flex justify-between pt-2 text-base font-bold">
                <span className="text-slate-200">Net Payable</span>
                <span className="text-emerald-400">₹{netPayable}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-slate-800/80 p-3 text-xs text-slate-300 flex items-start gap-2">
            <Calendar className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
            <span>
              Generating <strong>{formData.installmentsCount}</strong> installment(s) of ~<strong>₹{(netPayable / (formData.installmentsCount || 1)).toFixed(2)}</strong> each.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignFee;