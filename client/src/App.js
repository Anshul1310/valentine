import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import MobileGuard from './components/guards/MobileGuard';
import ProtectedRoute from './components/guards/ProtectedRoute'; 

// Pages
import Splash from './pages/Splash/Splash';
import Onboarding from './pages/Onboarding/Onboarding';
import Questions from './pages/Questions/Questions';
import AuthCallback from './pages/AuthCallback';
import Login from './pages/Login/Login';
import GenderSelect from './pages/GenderSelect/GenderSelect';
import Home from './pages/Home/Home';
import Chat from './pages/Chat/Chat';
import Terms from './pages/Terms/Terms';

function App() {
  return (
    <Router>
      <Routes>
        {/* --- EXCLUDED FROM MOBILE GUARD --- */}
        {/* This route will work on Desktop and Mobile without the guard */}
        <Route path="/auth/callback" element={<AuthCallback />} />
         <Route element={<ProtectedRoute />}>
            <Route path="/questions" element={<Questions />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/gender" element={<GenderSelect />} />
            <Route path="/home" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
          </Route>

        {/* --- MOBILE GUARDED ROUTES --- */}
        {/* Everything inside this Route wrapper gets the MobileGuard */}
        <Route element={
          <MobileGuard>
            <Outlet />
          </MobileGuard>
        }>
          
          {/* Public Routes (Guarded) */}
          <Route path="/" element={<Splash />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes (Guarded) */}
         

        </Route>
      </Routes>
    </Router>
  );
}

export default App;