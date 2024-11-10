import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './Components/contexts/AuthContext';
import Login from './Components/Auth/Login';
import Dashboard from './Components/Dashboard/Dashboard';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute';
import ProductList from './Components/Products/ProductList';
import SalesForm from './Components/Sales/SalesForm';
import DailyTotal from './Components/Sales/DailyTotal';

function App() {
  return (
    <Router>
      <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/dashboard/*" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                  <Routes>
                    <Route path="products" element={<ProductList />} />
                    <Route path="sales" element={<SalesForm />} />
                    <Route path="daily-total" element={<DailyTotal />} />
                  </Routes>
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;