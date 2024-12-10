import { Container, Loader } from "@mantine/core";
import { BrowserRouter, Link, Outlet, Route, Routes } from "react-router-dom";
import { Footer } from "../components/Footer/Footer";
import { Header } from "../components/Header/Header";
import { Login } from "./login/login-page";
import { Register } from "./register/register-page";
import { Home } from "./home/home-page";
import { LandlordDashboardPage } from "./landlord-dashboard/landlord-dashboard-page";
import { Login } from "./login/login-page";
import express from 'express';
import { fileRouter } from '../components/ImageUploader/imageUploaderQueries';
import { PropertyDetail } from "./property-detail/property-detail-page";
import { useAuth } from "../lib/auth-context";
import { PrivateRoute, PublicRoute } from "../lib/auth-routes";
import { Profile } from "./profile/profile-page";

const AppLayout = () => {
  const { isLoading } = useAuth();

  return (
    <>
      <div className="disclaimer">
        Fulda University of Applied Sciences Software Engineering Project, Fall 2024. FOR DEMONSTRATION ONLY.
      </div>
      {isLoading ? (
        <div className="app-loader">
          <Loader />
        </div>
      ) : (
        <>
          <Header />
          <Container fluid>
            <Outlet />
          </Container>
          <Footer />
        </>
      )}
    </>
  );
};

const NotFound = () => {
  return (
    <div>
      <h1>404 | Not Found</h1>
      <Link to="/">Go back home</Link>
    </div>
  );
};

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route
            path="login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route path="property/:id" element={<PropertyDetail />} />
          <Route
            path="landlord"
            element={
              <PrivateRoute userType="landlord">
                <LandlordDashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

const expressApp = express();

expressApp.use(express.json()); // Parse JSON request body
expressApp.use('/api', fileRouter); // Mount the file router at '/api'

expressApp.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});