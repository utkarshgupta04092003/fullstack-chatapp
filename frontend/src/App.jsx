import React, { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    if (document.cookie.includes('accessToken')) {
      setIsAuthenticated(true);
    }
  }, []);
  // You can replace this with actual authentication logic
  const authenticate = (status) => {
    setIsAuthenticated(status);
  };
  return (
    <div>
      <BrowserRouter>

        <Routes>
          <Route path="/register" element={<Register isAuthenticated={isAuthenticated}/>} />
          <Route path="/login" element={<Login authenticate={authenticate} isAuthenticated={isAuthenticated}/>} />
          <Route path='/' element={isAuthenticated ? <Home /> : <Navigate to={'/login'}/> } />
        </Routes>

      </BrowserRouter>
    </div>
  )
}
