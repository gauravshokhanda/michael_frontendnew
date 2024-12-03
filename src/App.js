import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "./redux/store";
import Layout from "./components/Layout/Layout";
import Login from "./components/Login/Login";
import Dashboard from "./components/Dashboard/Dashboard";
import Blogs from "./components/Blogs/Blogs";
import Page from "./components/Page/Page";
import Forms from "./components/Forms/Forms";
import CMS from "./components/cms/Cms";
import GeneralSetting from "./components/GeneralSetting/GeneralSetting";
import Client from "./components/Client/client";

// ProtectedRoute Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const token = useSelector((state) => state.auth.token);

  // Check if the user is authenticated or has a valid token
  if (isAuthenticated && token) {
    return children; // Allow access to protected routes
  }

  // Redirect to login if not authenticated or token is missing
  return <Navigate to="/login" />;
};

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <Routes>
            {/* Login Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="blogs" element={<Blogs />} />
              <Route path="page" element={<Page />} />
              <Route path="cms" element={<CMS />} />
              <Route path="forms" element={<Forms />} />
              <Route path="client" element={<Client />} />
              <Route path="generalSetting" element={<GeneralSetting />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
};

export default App;
