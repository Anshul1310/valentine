// client/src/App.js
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/guards/ProtectedRoute';

// Pages
import Splash from './pages/Splash/Splash';
import Onboarding from './pages/Onboarding/Onboarding';
import Questions from './pages/Questions/Questions';
import AuthCallback from './pages/AuthCallback';
import Login from './pages/Login/Login';
import Home from './pages/Home/Home';
import Chat from './pages/Chat/Chat';
import Terms from './pages/Terms/Terms';

// Layout component to handle conditional scrolling
const Layout = ({ children }) => {
  const location = useLocation();
  
  // Define routes that should NOT scroll at the window level
  // (because they handle their own internal scrolling)
  const lockScrollRoutes = ['/chat', '/questions'];
  const shouldLockScroll = lockScrollRoutes.includes(location.pathname);

  return (
    <div 
      className={`w-full max-w-[430px] h-full bg-white shadow-2xl relative ${
        shouldLockScroll ? 'overflow-hidden' : 'overflow-y-auto'
      }`}
    >
      {children}
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout>
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
            <Route path="/home" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
          </Route>
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;