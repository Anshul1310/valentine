import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/guards/ProtectedRoute';

// Pages
import Splash from './pages/Splash/Splash';
import Onboarding from './pages/Onboarding/Onboarding';
import Questions from './pages/Questions/Questions';
import AuthCallback from './pages/AuthCallback';
import Login from './pages/Login/Login';
// GenderSelect removed
import Home from './pages/Home/Home';
import Chat from './pages/Chat/Chat';
import Terms from './pages/Terms/Terms';

function App() {
  return (
    <Router>
      {/* CONTAINER:
        - w-full max-w-[430px]: Forces Mobile Width
        - h-full: Fills the locked body height
        - overflow-y-auto: Allows scrolling INSIDE the app, not the body
      */}
      <div className="w-full max-w-[430px] h-full bg-white shadow-2xl relative overflow-y-auto overflow-x-hidden">
        
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<Splash />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* --- PROTECTED ROUTES --- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/questions" element={<Questions />} />
            <Route path="/terms" element={<Terms />} />
            {/* Gender Route Removed */}
            <Route path="/home" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
          </Route>
        </Routes>

      </div>
    </Router>
  );
}

export default App;