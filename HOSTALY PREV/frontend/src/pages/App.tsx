import { Navigate, Route, Routes, Outlet } from 'react-router-dom';
import { useAuth } from "../state/useAuth";
import Layout from "../components/Layout";
import Dashboard from './Dashboard';
import Charges from './Charges';
import CA from './CA';
import RH from './RH';
import Resultats from './Resultats';
import Scenarios from './Scenarios';
import Ratios from './Ratios';
import Login from './Login';

function Protected({ children }: { children: JSX.Element }) {
  const token = useAuth((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function LayoutWrapper() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Protected><LayoutWrapper /></Protected>}>
        <Route index element={<Dashboard />} />
        <Route path="charges" element={<Charges />} />
        <Route path="ca" element={<CA />} />
        <Route path="rh" element={<RH />} />
        <Route path="rh/services" element={<RH />} />
        <Route path="rh/employees" element={<RH />} />
        <Route path="resultats" element={<Resultats />} />
        <Route path="scenarios" element={<Scenarios />} />
        <Route path="ratios" element={<Ratios />} />
      </Route>
    </Routes>
  );
}


