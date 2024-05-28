import React from 'react'
import {BrowserRouter, Route, Routes} from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";

export default function App() {
  return (
    <div>
      <BrowserRouter>

        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
        </Routes>

      </BrowserRouter>
   </div>
  )
}
