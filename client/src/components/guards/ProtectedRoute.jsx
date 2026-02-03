import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('authToken');

  // If no token found, redirect to Onboarding (or Login)
  if (!token) {
    return <Navigate to="/onboarding" replace />;
  }

  // If token exists, render the child route (The protected page)
  return <Outlet />;
};

export default ProtectedRoute;