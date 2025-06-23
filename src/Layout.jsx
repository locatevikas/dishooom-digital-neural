import { NavLink, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import React from "react";
import { routeArray, routes } from "@/config/routes";
import ApperIcon from "@/components/ApperIcon";
import { useTheme } from "./context/ThemeContext";

const Layout = () => {
  const location = useLocation();
  const { theme } = useTheme();
  
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
        <div className="flex items-center justify-center max-w-7xl mx-auto">
          <span className="text-xl font-bold text-primary">Dishooom</span>
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
                  `flex flex-col items-center py-2 px-3 min-w-0 flex-1 relative ${
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
                      className={`mb-1 ${isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                    />
                    <span className={`text-xs font-medium truncate ${
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
      </nav>
    </div>
  );
};

export default Layout;