import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, useToast } from './context/ToastContext';

// Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import TaskFormModal from './components/TaskFormModal';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import CalendarPage from './pages/Calendar';
import FocusTimer from './pages/FocusTimer';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

import { remindersApi, tasksApi } from './services/api';

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Global Quick Add Task modal state
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddLoading, setQuickAddLoading] = useState(false);

  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchUnreadCount = async () => {
    try {
      const data = await remindersApi.getReminders();
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Quiet fail if not yet authenticated
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    // Poll notifications every 60 seconds while app is open
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleGlobalCreateTask = async (formData) => {
    setQuickAddLoading(true);
    try {
      await tasksApi.createTask(formData);
      addToast('New study task scheduled successfully!', 'success');
      setIsQuickAddOpen(false);
      fetchUnreadCount();
      // If currently on tasks or calendar, navigate to refresh or let component pick up
      navigate('/tasks');
    } catch (err) {
      addToast(err.message || 'Failed to create task', 'error');
    } finally {
      setQuickAddLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex transition-colors">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        unreadCount={unreadCount}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Navbar
          onOpenMobileMenu={() => setMobileOpen(true)}
          onOpenNewTask={() => setIsQuickAddOpen(true)}
          unreadCount={unreadCount}
          onRefreshReminders={fetchUnreadCount}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ onOpenNewTask: () => setIsQuickAddOpen(true), refreshReminders: fetchUnreadCount }} />
        </main>
      </div>

      {/* Global Quick Add Task Modal */}
      <TaskFormModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSubmit={handleGlobalCreateTask}
        loading={quickAddLoading}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Student Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route index element={<Dashboard onOpenNewTask={() => {}} />} />
                  <Route path="tasks" element={<Tasks />} />
                  <Route path="calendar" element={<CalendarPage onOpenNewTask={() => {}} />} />
                  <Route path="timer" element={<FocusTimer />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="notifications" element={<Notifications onRefreshReminders={() => {}} />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
