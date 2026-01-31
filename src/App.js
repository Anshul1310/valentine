// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MobileGuard from './components/guards/MobileGuard';
import Splash from './pages/Splash/Splash';
import Onboarding from './pages/Onboarding/Onboarding';
import Questions from './pages/Questions/Questions';

function App() {
  return (
    <MobileGuard>
      <Router>
        <Routes>
          {/* The Splash handles the initial logic */}
          <Route path="/" element={<Splash />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/questions" element={<Questions />} />
        </Routes>
      </Router>
    </MobileGuard>
  );
}

export default App;