import { NavLink, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
import { routeArray, routes } from "@/config/routes";
import ApperIcon from "@/components/ApperIcon";
import { useTheme } from "./context/ThemeContext";

const STORAGE_KEY = 'dishooom_settings';

const Layout = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [businessName, setBusinessName] = useState('Dishooom');
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    // Load business name and logo from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const settings = JSON.parse(stored);
        setBusinessName(settings?.profile?.businessName || 'Dishooom');
        setLogo(settings?.profile?.logo || null);
      }
    } catch (e) {
      setBusinessName('Dishooom');
      setLogo(null);
    }
  }, []);

  // Create navigation items from routes configuration
  const allNavItems = routeArray.filter(route => route.showInNav !== false).map(route => ({
    id: route.path,
    path: route.path,
    label: route.label || route.name,
    icon: route.icon,
    showInMobileNav: route.showInMobileNav
  }));

  // Filter items for mobile navigation (exclude items with showInMobileNav: false)
  const mobileNavItems = allNavItems.filter(item => item.showInMobileNav !== false);
  
  // Desktop navigation shows all items
  const desktopNavItems = allNavItems;

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${theme === 'dark' ? 'dark bg-gray-900 text-white' : 'bg-gray-50'}`}>
      {/* Desktop Header */}
      <div className="hidden md:block bg-white border-b border-gray-200 px-6 py-3 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo Left */}
          <div className="flex items-center min-w-[56px]">
            {logo ? (
              <img src={logo} alt="Logo" className="h-12 max-h-12 object-contain rounded-lg bg-white dark:bg-gray-800" style={{ maxWidth: 120 }} />
            ) : (
              <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 text-primary font-bold text-xl">
                D
              </div>
            )}
          </div>
          {/* Brand Name Centered */}
          <div className="flex-1 flex justify-center">
            <span className="text-xl font-bold text-primary dark:text-white">{businessName}</span>
          </div>
          {/* Dark/Light Mode Toggle Right */}
          <div className="flex items-center justify-end min-w-[56px]">
            <button
              onClick={toggleTheme}
              className={`relative w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-300 focus:outline-none ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} group`}
              aria-label="Toggle dark mode"
            >
              <AnimatePresence initial={false} mode="wait">
                {theme === 'dark' ? (
                  <motion.span
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center"
                  >
                    <ApperIcon name="Moon" size={22} className="text-yellow-300" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center"
                  >
                    <ApperIcon name="Sun" size={22} className="text-yellow-500" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Header */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-2 dark:bg-gray-800 dark:border-gray-700 flex items-center justify-between">
        {/* Logo Left */}
        <div className="flex items-center min-w-[44px]">
          {logo ? (
            <img src={logo} alt="Logo" className="h-10 max-h-10 object-contain rounded-lg bg-white dark:bg-gray-800" style={{ maxWidth: 80 }} />
          ) : (
            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 text-primary font-bold text-lg">
              D
            </div>
          )}
        </div>
        {/* Brand Name Centered */}
        <div className="flex-1 flex justify-center">
          <span className="text-lg font-bold text-primary dark:text-white">{businessName}</span>
        </div>
        {/* Dark/Light Mode Toggle Right */}
        <div className="flex items-center justify-end min-w-[44px]">
          <button
            onClick={toggleTheme}
            className={`relative w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-300 focus:outline-none ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} group`}
            aria-label="Toggle dark mode"
          >
            <AnimatePresence initial={false} mode="wait">
              {theme === 'dark' ? (
                <motion.span
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center"
                >
                  <ApperIcon name="Moon" size={20} className="text-yellow-300" />
                </motion.span>
              ) : (
                <motion.span
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center"
                >
                  <ApperIcon name="Sun" size={20} className="text-yellow-500" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </div>

      {/* Desktop Bottom Navigation */}
      <nav className="hidden md:block bg-white border-t border-gray-200 px-6 py-3 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-center max-w-7xl mx-auto">
          <div className="flex space-x-8">
            {desktopNavItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={({ isActive }) => 
                    `flex flex-col items-center py-2 px-4 min-w-0 relative ${
                      isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
                    } transition-colors hover:text-primary`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="activeDesktopTab"
                          className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full"
                          initial={false}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                      <ApperIcon 
                        name={item.icon} 
                        size={20} 
                        className={`mb-1 ${isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                      />
                      <span className={`text-xs font-medium ${
                        isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>
      {/* Mobile Bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex justify-around py-2">
          {mobileNavItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => 
                  `flex flex-col items-center py-1 px-1 min-w-0 flex-1 relative ${
                    isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
                  } transition-colors`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    <ApperIcon 
                      name={item.icon} 
                      size={20} 
                      className={`mb-0.5 ${isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                    />
                    <span className={`text-[11px] font-medium leading-tight whitespace-normal text-center ${
                      isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
                    }`} style={{maxWidth: 60, wordBreak: 'break-word'}}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;