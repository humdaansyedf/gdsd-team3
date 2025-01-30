import { Container, Loader } from "@mantine/core";
import * as React from "react";
import { BrowserRouter, Link, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider, PrivateRoute, PublicOnlyRoute } from "../lib/auth-provider";
import { AdminAuthProvider } from "../lib/admin-auth-provider";
import { AppLayout } from "../components/AppLayout/AppLayout.jsx";

const Login = React.lazy(() => import("./login/login-page").then((mod) => ({ default: mod.Login })));
const Register = React.lazy(() => import("./register/register-page").then((mod) => ({ default: mod.Register })));
const Home = React.lazy(() => import("./home/home-page").then((mod) => ({ default: mod.Home })));
const CreatorDashboardPage = React.lazy(() =>
  import("./creator-dashboard/creator-dashboard-page").then((mod) => ({
    default: mod.CreatorDashboardPage,
  }))
);
const CreateAdPage = React.lazy(() =>
  import("./create-ad/create-ad-page.jsx").then((mod) => ({
    default: mod.CreateAdPage,
  }))
);
const EditAdPage = React.lazy(() =>
    import("./edit-ad/edit-ad-page.jsx").then((mod) => ({
        default: mod.EditAdPage,
    }))
);
const AdConfirmation = React.lazy(() =>
  import("./ad-confirmation/ad-confirmation-page.jsx").then((mod) => ({
    default: mod.AdConfirmation,
  }))
);
const PropertyDetail = React.lazy(() =>
  import("./property-detail/property-detail-page").then((mod) => ({
    default: mod.PropertyDetail,
  }))
);
const Profile = React.lazy(() => import("./profile/profile-page").then((mod) => ({ default: mod.Profile })));
const Mymessages = React.lazy(() => import("./messaging/mymessages").then((mod) => ({ default: mod.Mymessages })));

const AdminDashboard = React.lazy(() =>
  import("./admin/admin-dashboard-page").then((mod) => ({
    default: mod.AdminDashboard,
  }))
);
const AdminProperty = React.lazy(() =>
  import("./admin/admin-property-page").then((mod) => ({
    default: mod.AdminProperty,
  }))
);

const WishlistPage = React.lazy(() =>
  import("./wishlist/wishlist-page").then((mod) => ({
    default: mod.WishlistPage,
  }))
);

const AppLoader = () => {
  return (
    <div className="app-loader">
      <Loader />
    </div>
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
            <Route
              path="wishlist"
              element={
                <PrivateRoute userType="STUDENT">
                  {" "}
                  {/*Ensure only students can access */}
                  <WishlistPage />
                </PrivateRoute>
              }
            />
            <Route
              path="dashboard"
              element={
                <PrivateRoute>
                  <CreatorDashboardPage />
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
              path="messages"
              element={
                <PrivateRoute>
                  <Mymessages />
                </PrivateRoute>
              }
            />
            <Route
              path="property/new"
              element={
                <PrivateRoute>
                  <CreateAdPage />
                </PrivateRoute>
              }
            />
              <Route
                  path="property/:id/edit"
                  element={
                      <PrivateRoute>
                          <EditAdPage />
                      </PrivateRoute>
                  }
              />
            <Route
              path="property/submission-confirmation"
              element={
                <PrivateRoute>
                  <AdConfirmation />
                </PrivateRoute>
              }
            />
            <Route path="property/:id" element={<PropertyDetail />} />
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
            <Route index element={<AdminDashboard />} />
            <Route path="property/:id" element={<AdminProperty />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </React.Suspense>
  );
};
