// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MobileGuard from './components/guards/MobileGuard';
import Splash from './pages/Splash/Splash';
import Onboarding from './pages/Onboarding/Onboarding';
import Questions from './pages/Questions/Questions';
import AuthCallback from './pages/AuthCallback';
import Login from './pages/Login/Login';
import GenderSelect from './pages/GenderSelect/GenderSelect';
import Home from './pages/Home/Home';

// ... inside <Routes>

function App() {
  return (
    <MobileGuard>
      <Router>
        <Routes>
          {/* The Splash handles the initial logic */}
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/gender" element={<GenderSelect />} />
 <Route path="/home" element={< Home />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </Router>
    </MobileGuard>
  );
}

export default App;