import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Modules from './pages/Modules';
import Lessons from './pages/Lessons';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateStaff from './pages/CreateStaff';
import UpdateProfile from './pages/UpdateProfile';
import StaffDashboard from './pages/StaffDashboard';
import StaffModuleQuestions from './pages/StaffModuleQuestions';
import ChangePassword from './pages/ChangePassword';
import Learners from './pages/Learners';
import AddLearner from './pages/AddLearner';
import Settings from './pages/Settings';
import UploadVideo from './pages/UploadVideo';
import Playground from './pages/Playground';
import type { User } from './types/index';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && token !== 'null' && savedUser && savedUser !== 'null') {
        try {
          const parsedUser = JSON.parse(savedUser);
          if (parsedUser && typeof parsedUser === 'object') {
            setIsAuthenticated(true);
            setUser(parsedUser);
          }
        } catch (e) {
          console.error("Auth parsing error", e);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    };
    checkAuth();

    // Sync state if localStorage changes (e.g., from other components/tabs)
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  useEffect(() => {
    if (user?.utype) {
      document.documentElement.setAttribute('data-role', user.utype);
    } else {
      document.documentElement.removeAttribute('data-role');
    }
  }, [user]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

  const toggleSidebarCollapse = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', newState.toString());
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) return null;

  const roleLower = user?.utype?.toLowerCase() || '';
  const isStaff = ['staff', 'admin', 'superadmin'].includes(roleLower);
  const isTrainer = ['trainer', 'teacher'].includes(roleLower);
  const isLearner = ['learner', 'student'].includes(roleLower);

  const getDefaultPath = () => {
    if (isStaff) return "/staff/dashboard";
    if (isTrainer) return "/trainer/dashboard";
    if (isLearner) return "/learner/dashboard";
    return "/login";
  };

  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={
          isAuthenticated ? <Navigate to={getDefaultPath()} replace /> : <Navigate to="/login" replace />
        } />

        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={getDefaultPath()} />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to={getDefaultPath()} />} />

        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <div className="min-h-screen bg-[var(--bg-page)] overflow-x-hidden">
                <Sidebar 
                  role={user?.utype || 'learner'} 
                  isOpen={sidebarOpen} 
                  setIsOpen={setSidebarOpen} 
                  isCollapsed={isSidebarCollapsed}
                  onToggleCollapse={toggleSidebarCollapse}
                />
                <div className={`min-h-screen ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-[var(--sidebar-width)]'} transition-[padding] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col`}>
                  <Header user={user} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} isCollapsed={isSidebarCollapsed} />
                  <main className="p-6 flex-1 mt-[72px] min-w-0">
                    <Routes>
                      {/* Dashboard Routes */}
                      <Route path="/staff/dashboard" element={<StaffDashboard />} />
                      <Route path="/trainer/dashboard" element={<Dashboard />} />
                      <Route path="/learner/dashboard" element={<Dashboard />} />

                      {/* Common Routes */}
                      <Route path="/users" element={<Users />} />
                      <Route path="/staff/modules/" element={<Modules />} />
                      <Route path="/staff/lessons/" element={<Lessons />} />
                      <Route path="/staff/modulequestion/" element={<StaffModuleQuestions />} />
                      
                      <Route path="/trainer/learner-list" element={<Learners />} />
                      
                      <Route path="/create-staff" element={<CreateStaff />} />
                      <Route path="/update-profile" element={<UpdateProfile />} />
                      <Route path="/change-password" element={<ChangePassword />} />
                      
                      {/* New Routes */}
                      <Route path="/add-learner" element={<AddLearner />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/upload-video" element={<UploadVideo />} />
                      <Route path="/playground" element={<Playground />} />

                      {/* Fallback */}
                      <Route path="*" element={<Navigate to={getDefaultPath()} />} />
                    </Routes>
                  </main>
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
