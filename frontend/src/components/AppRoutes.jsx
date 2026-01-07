import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import StudentPanel from './StudentPanel';
import MentorPanel from './MentorPanel';
import AdminPanel from './AdminPanel';

const ProtectedRoute = ({ element, allowedUserTypes }) => {
  const userType = localStorage.getItem('userType');
  const isAuthenticated = !!userType;
  
  if (isAuthenticated && allowedUserTypes.includes(userType)) {
    return element;
  }
  
  return <Navigate to="/" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Login />} />
      
      {/* Protected routes */}
      <Route 
        path="/student" 
        element={<ProtectedRoute element={<StudentPanel />} allowedUserTypes={['student']} />} 
      />
      <Route 
        path="/mentor" 
        element={<ProtectedRoute element={<MentorPanel />} allowedUserTypes={['mentor']} />} 
      />
      <Route 
        path="/faculty" 
        element={<ProtectedRoute element={<MentorPanel />} allowedUserTypes={['mentor']} />} 
      />
      <Route 
        path="/admin" 
        element={<ProtectedRoute element={<AdminPanel />} allowedUserTypes={['admin']} />} 
      />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes; 