import { Container, Loader } from "@mantine/core";
import * as React from "react";
import { BrowserRouter, Link, Outlet, Route, Routes } from "react-router-dom";
import { Footer } from "../components/Footer/Footer";
import { Header } from "../components/Header/Header";
import { useAuth } from "../lib/auth-context";
import { AuthProvider, PrivateRoute, PublicOnlyRoute } from "../lib/auth-provider";
import { AdminAuthProvider } from "../lib/admin-auth-provider";

const Login = React.lazy(() => import("./login/login-page").then((mod) => ({ default: mod.Login })));
const Register = React.lazy(() => import("./register/register-page").then((mod) => ({ default: mod.Register })));
const Home = React.lazy(() => import("./home/home-page").then((mod) => ({ default: mod.Home })));
const LandlordDashboardPage = React.lazy(() =>
  import("./landlord-dashboard/landlord-dashboard-page").then((mod) => ({ default: mod.LandlordDashboardPage }))
);
const PropertyDetail = React.lazy(() =>
  import("./property-detail/property-detail-page").then((mod) => ({ default: mod.PropertyDetail }))
);
const Profile = React.lazy(() => import("./profile/profile-page").then((mod) => ({ default: mod.Profile })));
const Mymessages = React.lazy(() => import("./messaging/mymessages").then((mod) => ({ default: mod.Mymessages })));

const AppLoader = () => {
  return (
    <div className="app-loader">
      <Loader />
    </div>
  );
};

const AppLayout = () => {
  const { isLoading } = useAuth();

  return (
    <>
      <div className="disclaimer">
        Fulda University of Applied Sciences Software Engineering Project, Fall 2024. FOR DEMONSTRATION ONLY.
      </div>
      {isLoading ? (
        <AppLoader />
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

const AdminLayout = () => {
  return (
    <>
      <div className="disclaimer">
        Fulda University of Applied Sciences Software Engineering Project, Fall 2024. FOR DEMONSTRATION ONLY.
      </div>
      <Container fluid>
        <Outlet />
      </Container>
    </>
  );
};

export const App = () => {
  return (
    <React.Suspense fallback={<AppLoader />}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <AuthProvider>
                <AppLayout />
              </AuthProvider>
            }
          >
            <Route index element={<Home />} />
            <Route
              path="login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="register"
              element={
                <PublicOnlyRoute>
                  <Register />
                </PublicOnlyRoute>
              }
            />
            <Route path="property/:id" element={<PropertyDetail />} />
            <Route
              path="landlord"
              element={
                <PrivateRoute userType="LANDLORD">
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
            <Route
              path="mymessages"
              element={
                // commented for testing
                //<PublicRoute>
                <Mymessages />
                // </PublicRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route
            path="admin"
            element={
              <AdminAuthProvider>
                <AdminLayout />
              </AdminAuthProvider>
            }
          >
            <Route index element={<div>ADMIN</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </React.Suspense>
  );
};
