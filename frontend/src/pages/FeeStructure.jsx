import { useEffect, useState } from 'react';
import API from '../api/axios';
import { Plus, Edit, Trash2, Layers, AlertCircle, CheckCircle } from 'lucide-react';

const FEE_HEADS = [
  'Tuition Fee',
  'Admission Fee',
  'Exam Fee',
  'Transport Fee',
  'Library Fee',
  'Computer / Lab Fee',
  'Activity Fee',
  'Other Fee',
];

const FeeStructure = () => {
  const [structures, setStructures] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    academicYearId: '',
    classId: '',
    feeHead: 'Tuition Fee',
    amount: '',
    frequency: 'Yearly',
    dueDate: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [strRes, ayRes, clsRes] = await Promise.all([
        API.get('/fees/structures'),
        API.get('/master/academic-years'),
        API.get('/master/classes'),
      ]);
      setStructures(strRes.data);
      setAcademicYears(ayRes.data);
      setClasses(clsRes.data);
      
      // Auto-select defaults in form if available
      if (ayRes.data.length > 0 && clsRes.data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          academicYearId: ayRes.data[0]._id,
          classId: clsRes.data[0]._id,
        }));
      }
    } catch (err) {
      setError('Failed to load fee structures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (struct = null) => {
    setError('');
    if (struct) {
      setEditingId(struct._id);
      setFormData({
        academicYearId: struct.academicYearId?._id || struct.academicYearId || '',
        classId: struct.classId?._id || struct.classId || '',
        feeHead: struct.feeHead,
        amount: struct.amount,
        frequency: struct.frequency,
        dueDate: struct.dueDate ? struct.dueDate.split('T')[0] : '',
      });
    } else {
      setEditingId(null);
      setFormData({
        academicYearId: academicYears[0]?._id || '',
        classId: classes[0]?._id || '',
        feeHead: 'Tuition Fee',
        amount: '',
        frequency: 'Yearly',
        dueDate: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (Number(formData.amount) <= 0) {
      setError('Amount must be positive');
      return;
    }

    try {
      if (editingId) {
        await API.put(`/fees/structures/${editingId}`, formData);
        setSuccess('Fee structure updated successfully!');
      } else {
        await API.post('/fees/structures', formData);
        setSuccess('Fee structure created successfully!');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this fee head?')) {
      try {
        await API.delete(`/fees/structures/${id}`);
        setSuccess('Fee structure deactivated');
        fetchData();
      } catch (err) {
        setError(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Fee Structure Setup</h1>
          <p className="text-sm text-gray-500">Configure fee heads, amounts, and installment frequencies per class</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" />
          Add Fee Structure
        </button>
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

      {/* Fee Structures Table */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : structures.length === 0 ? (
          <div className="text-center py-12">
            <Layers className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-sm font-medium text-gray-600">No fee structures configured yet</p>
            <p className="text-xs text-gray-400">Click "Add Fee Structure" above to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Academic Year</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Fee Head</th>
                  <th className="px-4 py-3">Frequency</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {structures.map((st) => (
                  <tr key={st._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800">{st.academicYearId?.yearName}</td>
                    <td className="px-4 py-3">{st.classId?.className} - {st.classId?.section}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{st.feeHead}</td>
                    <td className="px-4 py-3">{st.frequency}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">₹{st.amount}</td>
                    <td className="px-4 py-3">{st.dueDate ? new Date(st.dueDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        st.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {st.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(st)}
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(st._id)}
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingId ? 'Edit Fee Structure' : 'Add Fee Structure'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
  <label className="block text-xs font-semibold uppercase text-gray-600">Academic Year</label>
  <select
    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
    value={formData.academicYearId}
    onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}
    required
  >
    <option value="">Select Academic Year</option>
    {academicYears.map((ay) => (
      <option key={ay._id} value={ay._id}>{ay.yearName}</option>
    ))}
  </select>
</div>

<div>
  <label className="block text-xs font-semibold uppercase text-gray-600">Class</label>
  <select
    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
    value={formData.classId}
    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
    required
  >
    <option value="">Select Class</option>
    {classes.map((cls) => (
      <option key={cls._id} value={cls._id}>{cls.className} - {cls.section}</option>
    ))}
  </select>
</div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600">Fee Head</label>
                <select
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
                  value={formData.feeHead}
                  onChange={(e) => setFormData({ ...formData, feeHead: e.target.value })}
                  required
                >
                  {FEE_HEADS.map((head) => (
                    <option key={head} value={head}>{head}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600">Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. 15000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600">Frequency</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  >
                    <option value="Yearly">Yearly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600">Due Date (Optional)</label>
                <input
                  type="date"
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
                >
                  Save Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeStructure;