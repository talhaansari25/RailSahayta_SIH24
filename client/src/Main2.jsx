import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home/Home";
import ResetPassword from "./components/auth/ResetPassword";
import { useLocation } from "react-router-dom";
import Admin from './components/home/Admin.jsx'
import Staff from './components/home/Staff.jsx'
import './mindex.css'

const Main2 = () => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  if (loading) return <div className="loader"></div>;

 

  return (
    <>
      <Routes>
        <Route
          path="/staff"
          element={<Staff /> }
        />
        <Route
          path="/"
          element={<Home /> }
        />
        <Route
          path="/admin"
          element={<Admin /> }
        />
        <Route path="/resetpassword/:resetToken" element={<ResetPassword />} />
      </Routes>
    </>
  );
};

export default Main2;
