import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RH from './pages/RH';
import Charges from './pages/Charges';
import Scenarios from './pages/Scenarios';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/rh" element={<Layout><RH /></Layout>} />
        <Route path="/rh/services" element={<Layout><RH /></Layout>} />
        <Route path="/rh/employees" element={<Layout><RH /></Layout>} />
        <Route path="/charges" element={<Layout><Charges /></Layout>} />
        <Route path="/scenarios" element={<Layout><Scenarios /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
