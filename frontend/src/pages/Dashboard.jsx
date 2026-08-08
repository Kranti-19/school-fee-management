import { useEffect, useState } from 'react';
import API from '../api/axios';
import { Users, DollarSign, Wallet, AlertCircle, Clock, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalAssigned: 0,
    totalCollected: 0,
    totalPending: 0,
    todayCollection: 0,
    overdueAmount: 0
  });
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, paymentsRes] = await Promise.all([
          API.get('/dashboard/stats'),
          API.get('/payments/history?limit=5')
        ]);
        setStats(statsRes.data);
        setRecentPayments(paymentsRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Fee Dashboard</h1>
          <p className="text-sm text-gray-500">Real-time overview of school fee collections and outstanding balances</p>
        </div>
        <Link
          to="/collect"
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
        >
          <CreditCard className="h-4 w-4" />
          Quick Collect Fee
        </Link>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Total Students</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalStudents}</p>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Total Collected</p>
            <p className="text-2xl font-bold text-emerald-600">₹{stats.totalCollected?.toLocaleString() || 0}</p>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Total Pending</p>
            <p className="text-2xl font-bold text-amber-600">₹{stats.totalPending?.toLocaleString() || 0}</p>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Today's Collection</p>
            <p className="text-2xl font-bold text-indigo-600">₹{stats.todayCollection?.toLocaleString() || 0}</p>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="rounded-lg bg-rose-50 p-3 text-rose-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Overdue Fees</p>
            <p className="text-2xl font-bold text-rose-600">₹{stats.overdueAmount?.toLocaleString() || 0}</p>
          </div>
        </div>
      </div>

      {/* Collection Overview Visual Breakdown */}
<div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
  <h2 className="text-lg font-bold text-gray-800">Fee Collection Overview</h2>
  <div className="space-y-3">
    <div>
      <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
        <span>Collected Fees</span>
        <span>₹{stats.totalCollected?.toLocaleString() || 0}</span>
      </div>
      <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
        <div 
          className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
          style={{ width: `${Math.min(100, (stats.totalCollected / (stats.totalAssigned || 1)) * 100)}%` }}
        ></div>
      </div>
    </div>

    <div>
      <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
        <span>Pending Fees</span>
        <span>₹{stats.totalPending?.toLocaleString() || 0}</span>
      </div>
      <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
        <div 
          className="h-full bg-rose-500 rounded-full transition-all duration-500" 
          style={{ width: `${Math.min(100, (stats.totalPending / (stats.totalAssigned || 1)) * 100)}%` }}
        ></div>
      </div>
    </div>
  </div>
</div>
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Fee Collection Overview</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
              <span>Collected Fees ({Math.round(((stats.totalCollected || 0) / (stats.totalAssigned || 1)) * 100)}%)</span>
              <span>₹{stats.totalCollected?.toLocaleString() || 0} / ₹{stats.totalAssigned?.toLocaleString() || 0}</span>
            </div>
            <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, ((stats.totalCollected || 0) / (stats.totalAssigned || 1)) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
              <span>Pending Balance ({Math.round(((stats.totalPending || 0) / (stats.totalAssigned || 1)) * 100)}%)</span>
              <span>₹{stats.totalPending?.toLocaleString() || 0} / ₹{stats.totalAssigned?.toLocaleString() || 0}</span>
            </div>
            <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
              <div 
                className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, ((stats.totalPending || 0) / (stats.totalAssigned || 1)) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payments Table */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Payments</h2>
        {recentPayments.length === 0 ? (
          <p className="text-sm text-gray-500">No payment transactions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Receipt No</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3">Amount Paid</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentPayments.map((p) => (
                  <tr key={p._id}>
                    <td className="px-4 py-3 font-semibold text-blue-600">{p.receiptNumber}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{p.studentId?.firstName} {p.studentId?.lastName}</td>
                    <td className="px-4 py-3">{p.paymentMode}</td>
                    <td className="px-4 py-3 font-bold text-green-600">₹{p.amountPaid}</td>
                    <td className="px-4 py-3">{new Date(p.paymentDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;