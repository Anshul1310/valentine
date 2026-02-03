import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MobileGuard from './components/guards/MobileGuard';
import ProtectedRoute from './components/guards/ProtectedRoute'; // Import the new guard

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
    <MobileGuard>
      <Router>
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          {/* Accessible by anyone */}
          <Route path="/" element={<Splash />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* --- PROTECTED ROUTES --- */}
          {/* Only accessible if logged in. Checks for token automatically. */}
          <Route element={<ProtectedRoute />}>
            <Route path="/questions" element={<Questions />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/gender" element={<GenderSelect />} />
            <Route path="/home" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
          </Route>

        </Routes>
      </Router>
    </MobileGuard>
  );
}

export default App;