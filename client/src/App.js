import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
      {/* GLOBAL BACKGROUND */}
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        
        {/* MOBILE CONTAINER 
          1. max-w-[430px]: Forces mobile width
          2. transform: translateZ(0): THIS IS THE FIX. 
             It creates a new "stacking context" that forces 'fixed' children 
             (like headers or loaders) to stay inside this box.
        */}
        <div 
          className="w-full max-w-[430px] h-[100dvh] bg-white shadow-2xl relative overflow-hidden"
          style={{ transform: 'translateZ(0)' }} 
        >
          <Routes>
            {/* --- PUBLIC ROUTES --- */}
            <Route path="/" element={<Splash />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/login" element={<Login />} />
            
            {/* Now safe from expanding to desktop width */}
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* --- PROTECTED ROUTES --- */}
            <Route element={<ProtectedRoute />}>
              <Route path="/questions" element={<Questions />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/gender" element={<GenderSelect />} />
              <Route path="/home" element={<Home />} />
              <Route path="/chat" element={<Chat />} />
            </Route>
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;