import { NavLink, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import React from "react";
import { routeArray, routes } from "@/config/routes";
import ApperIcon from "@/components/ApperIcon";
const Layout = () => {
  const location = useLocation();
  
  // Create navigation items from routes configuration
  const navItems = routes.filter(route => route.showInNav !== false).map(route => ({
    id: route.path,
    path: route.path,
    label: route.label || route.name,
    icon: route.icon
  }));

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Main content area */}
      <div className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </div>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex justify-around py-2">
          {navItems.map(item => {
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