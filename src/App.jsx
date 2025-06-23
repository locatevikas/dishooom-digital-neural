import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Layout from './Layout';
import { routeArray } from './config/routes';
import { useTheme } from './context/ThemeContext';
import { useEffect } from 'react';

function App() {
  const { theme } = useTheme();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <div className="h-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
        <Routes>
          <Route path="/" element={<Layout />}>
            {routeArray.map(route => (
              <Route 
                key={route.id} 
                path={route.path}
                element={<route.component />}
              />
            ))}
            <Route path="*" element={<div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">Page not found</div>} />
          </Route>
        </Routes>
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          className="z-[9999]"
          toastClassName="text-sm"
        />
      </div>
    </BrowserRouter>
  );
}

export default App;