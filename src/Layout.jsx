import { NavLink, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import React from "react";
import { routeArray, routes } from "@/config/routes";
import ApperIcon from "@/components/ApperIcon";
const Layout = () => {
  const location = useLocation();
  
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
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Desktop Navigation Header */}
      <nav className="hidden md:block bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <span className="text-xl font-bold text-primary">Dishooom</span>
            </div>
            <div className="flex space-x-6">
              {desktopNavItems.slice(0, -1).map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) => 
                      `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive 
                          ? 'text-primary bg-primary/10' 
                          : 'text-gray-700 hover:text-primary hover:bg-gray-100'
                      }`
                    }
                  >
                    <ApperIcon name={item.icon} size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
          <div className="flex items-center">
            {/* More menu for desktop */}
            {desktopNavItems.slice(-1).map(item => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive 
                        ? 'text-primary bg-primary/10' 
                        : 'text-gray-700 hover:text-primary hover:bg-gray-100'
                    }`
                  }
                >
                  <ApperIcon name={item.icon} size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto md:pb-0 pb-20">
        <Outlet />
      </div>
{/* Mobile Bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex justify-around py-2">
          {mobileNavItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => 
                  `flex flex-col items-center py-2 px-3 min-w-0 flex-1 relative ${
                    isActive ? 'text-primary' : 'text-gray-500'
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
                      className={`mb-1 ${isActive ? 'text-primary' : 'text-gray-500'}`}
                    />
                    <span className={`text-xs font-medium truncate ${
                      isActive ? 'text-primary' : 'text-gray-500'
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