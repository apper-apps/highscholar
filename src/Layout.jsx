import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import { routeArray } from '@/config/routes';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const getCurrentPageTitle = () => {
    const currentRoute = routeArray.find(route => route.path === location.pathname);
    return currentRoute ? currentRoute.label : 'ScholarHub';
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="flex-shrink-0 h-16 bg-surface-50 border-b border-surface-200 z-40">
        <div className="h-full flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-surface-100 rounded-lg transition-colors"
            >
              <ApperIcon name="Menu" size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-900 rounded-lg flex items-center justify-center">
                <ApperIcon name="GraduationCap" size={20} className="text-white" />
              </div>
              <h1 className="font-display font-bold text-xl text-primary-900 hidden sm:block">
                ScholarHub
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-surface-100 rounded-lg px-3 py-2">
              <ApperIcon name="Search" size={16} className="text-surface-500" />
              <input
                type="text"
                placeholder="Search students..."
                className="bg-transparent border-none outline-none text-sm w-48"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:block text-sm text-surface-700">Welcome back, Teacher</span>
              <div className="w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center">
                <ApperIcon name="User" size={16} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 bg-surface-50 border-r border-surface-200 flex-col">
          <nav className="flex-1 p-4 space-y-2">
            {routeArray.map((route) => (
              <NavLink
                key={route.id}
                to={route.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-900 text-white shadow-sm'
                      : 'text-surface-700 hover:bg-surface-100 hover:text-primary-900'
                  }`
                }
              >
                <ApperIcon name={route.icon} size={18} />
                {route.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 bg-black/50 z-40"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="lg:hidden fixed left-0 top-16 bottom-0 w-64 bg-surface-50 border-r border-surface-200 z-50"
              >
                <nav className="p-4 space-y-2">
                  {routeArray.map((route) => (
                    <NavLink
                      key={route.id}
                      to={route.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-primary-900 text-white shadow-sm'
                            : 'text-surface-700 hover:bg-surface-100 hover:text-primary-900'
                        }`
                      }
                    >
                      <ApperIcon name={route.icon} size={18} />
                      {route.label}
                    </NavLink>
                  ))}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-display font-bold text-primary-900">
                {getCurrentPageTitle()}
              </h2>
            </div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;