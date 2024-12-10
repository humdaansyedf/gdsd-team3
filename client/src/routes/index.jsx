import { Container } from "@mantine/core";
import { BrowserRouter, Link, Outlet, Route, Routes } from "react-router-dom";
import { Footer } from "../components/Footer/Footer";
import { Header } from "../components/Header/Header";
import { Home } from "./home/home-page";
import { PropertyDetail } from "./property-detail/property-detail-page";
import { LandlordDashboardPage } from "./landlord-dashboard/landlord-dashboard-page";
import { Login } from "./login/login-page";
import express from 'express';
import { fileRouter } from '../components/ImageUploader/imageUploaderQueries';

const AppLayout = () => {
  return (
    <>
      <div className="disclaimer">
        Fulda University of Applied Sciences Software Engineering Project, Fall 2024. FOR DEMONSTRATION ONLY.
      </div>
      <Header />
      <Container fluid>
        <Outlet />
      </Container>
      <Footer />
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
          <Route path="login" element={<Login />} />
          <Route path="property/:id" element={<PropertyDetail />} />
          <Route path="landlord" element={<LandlordDashboardPage />} />
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