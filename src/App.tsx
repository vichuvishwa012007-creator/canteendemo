import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from './store/useStore';
import { HomePage } from './pages/HomePage';
import { StudentLogin } from './pages/StudentLogin';
import { AdminLogin } from './pages/AdminLogin';
import { StudentMenu } from './pages/StudentMenu';
import { StudentCheckout } from './pages/StudentCheckout';
import { StudentOrderStatus } from './pages/StudentOrderStatus';
import { StudentOrders } from './pages/StudentOrders';
import { AdminLayout } from './layouts/AdminLayout';

const PageTransition: React.FC<{ children: React.ReactNode; pageKey: string }> = ({ children, pageKey }) => (
  <motion.div
    key={pageKey}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    className="min-h-screen"
  >
    {children}
  </motion.div>
);

function App() {
  const { currentPage, isAuthenticated, currentUser, setPage } = useStore();

  // Route guards
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      if (currentUser.role === 'admin' && !currentPage.startsWith('admin')) {
        setPage('admin-dashboard');
      }
    }
  }, [isAuthenticated, currentUser]);

  const renderPage = () => {
    // Admin routes
    if (currentPage === 'admin-dashboard' || currentPage === 'admin-login' && isAuthenticated && currentUser?.role === 'admin') {
      if (isAuthenticated && currentUser?.role === 'admin') {
        return <AdminLayout />;
      }
    }

    switch (currentPage) {
      case 'home':
        return (
          <PageTransition pageKey="home">
            <HomePage />
          </PageTransition>
        );

      case 'student-login':
        return (
          <PageTransition pageKey="student-login">
            <StudentLogin />
          </PageTransition>
        );

      case 'admin-login':
        return (
          <PageTransition pageKey="admin-login">
            <AdminLogin />
          </PageTransition>
        );

      case 'admin-dashboard':
        if (!isAuthenticated || currentUser?.role !== 'admin') {
          setPage('admin-login');
          return <PageTransition pageKey="admin-login"><AdminLogin /></PageTransition>;
        }
        return <AdminLayout />;

      case 'student-menu':
        if (!isAuthenticated) {
          setPage('student-login');
          return <PageTransition pageKey="student-login"><StudentLogin /></PageTransition>;
        }
        if (currentUser?.role === 'admin') {
          setPage('admin-dashboard');
          return <AdminLayout />;
        }
        return (
          <PageTransition pageKey="student-menu">
            <StudentMenu />
          </PageTransition>
        );

      case 'student-checkout':
        if (!isAuthenticated) {
          setPage('student-login');
          return <PageTransition pageKey="student-login"><StudentLogin /></PageTransition>;
        }
        return (
          <PageTransition pageKey="student-checkout">
            <StudentCheckout />
          </PageTransition>
        );

      case 'student-order-status':
        if (!isAuthenticated) {
          setPage('student-login');
          return <PageTransition pageKey="student-login"><StudentLogin /></PageTransition>;
        }
        return (
          <PageTransition pageKey="student-order-status">
            <StudentOrderStatus />
          </PageTransition>
        );

      case 'student-orders':
        if (!isAuthenticated) {
          setPage('student-login');
          return <PageTransition pageKey="student-login"><StudentLogin /></PageTransition>;
        }
        return (
          <PageTransition pageKey="student-orders">
            <StudentOrders />
          </PageTransition>
        );

      default:
        return (
          <PageTransition pageKey="home">
            <HomePage />
          </PageTransition>
        );
    }
  };

  return (
    <div className="antialiased">
      <AnimatePresence mode="wait">
        {renderPage()}
      </AnimatePresence>
    </div>
  );
}

export default App;
