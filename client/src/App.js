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
      {/* --- GLOBAL MOBILE LAYOUT --- */}
      {/* This outer div creates the gray background and centers the content */}
      <div className="min-h-screen bg-gray-100 flex justify-center">
        
        {/* This inner div forces the 'Mobile App' width and height */}
        <div className="w-full max-w-[430px] min-h-screen bg-white shadow-xl relative overflow-hidden">
          
          <Routes>
            {/* --- PUBLIC ROUTES --- */}
            <Route path="/" element={<Splash />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/login" element={<Login />} />
            
            {/* The AuthCallback is now inside the mobile layout container,
               so it will remain mobile-sized while processing.
            */}
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