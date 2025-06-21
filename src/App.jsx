import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Layout from './Layout';
import { routeArray } from './config/routes';

function App() {
  return (
    <BrowserRouter>
      <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
        <Routes>
          <Route path="/" element={<Layout />}>
            {routeArray.map(route => (
              <Route 
                key={route.id} 
                path={route.path}
                element={<route.component />}
              />
            ))}
            <Route path="*" element={<div className="flex items-center justify-center h-full text-gray-500">Page not found</div>} />
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