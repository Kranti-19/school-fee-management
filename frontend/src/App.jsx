import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Reports from './pages/Reports';
import CollectPayment from './pages/CollectPayment';
import AssignFee from './pages/AssignFee';
import Dashboard from './pages/Dashboard';
import FeeStructure from './pages/FeeStructure';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="structures" element={<FeeStructure />} />
            <Route path="assign-fee" element={<AssignFee />} />
            <Route path="collect" element={<CollectPayment />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;