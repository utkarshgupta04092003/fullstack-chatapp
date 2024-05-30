import React, { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import { Provider } from 'react-redux';
import store from './redux/store';


export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    if (localStorage.getItem('user') && document.cookie.includes('accessToken')) {
      console.log('checked auth', true);
      setIsAuthenticated(true);
    }
  }, []);
  // You can replace this with actual authentication logic
  const authenticate = (status) => {
    setIsAuthenticated(status);
  };
  return (
    <div>
      <Provider store={store}>
        <BrowserRouter>

          <Routes>
            <Route path="/register" element={<Register isAuthenticated={isAuthenticated} />} />
            <Route path="/login" element={<Login authenticate={authenticate} isAuthenticated={isAuthenticated} />} />
            <Route path='/' element={isAuthenticated ? <Home /> : <Navigate to={'/login'} />} />
            <Route path='/c/:receiverId' element={isAuthenticated ? <Home /> : <Navigate to={'/login'} />} />
          </Routes>

        </BrowserRouter>
      </Provider>
    </div>
  )
}
