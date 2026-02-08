import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading state
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const verifyToken = async () => {
      // If no token exists, fail immediately
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        // Verify the token matches a valid user in the database
        await axios.get('/api/user/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // If successful, allow access
        setIsAuthenticated(true);
      } catch (error) {
        // If 401 (Token Invalid) or 404 (User ID not found in DB)
        if (error.response && (error.response.status === 401 || error.response.status === 404)) {
          console.error("Auth validation failed: User not found or token invalid.");
          localStorage.removeItem('authToken'); // Clear invalid token
          setIsAuthenticated(false);
        } else {
          // For other errors (e.g., 500 Server Error), we default to blocking access 
          // to ensure safety, or you could choose to handle differently.
          // Here we treat it as an auth failure to be strict.
          setIsAuthenticated(false);
        }
      }
    };

    verifyToken();
  }, [token]);

  // Show a loading spinner or nothing while verifying
  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If validation failed, redirect to Onboarding
  if (!isAuthenticated) {
    return <Navigate to="/onboarding" replace />;
  }

  // If valid, render the protected page
  return <Outlet />;
};

export default ProtectedRoute;