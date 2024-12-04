import { BrowserRouter, Link, Outlet, Route, Routes } from "react-router-dom";
import { Container } from "@mantine/core";
import { Header } from "../components/Header/Header";
import { Footer } from "../components/Footer/Footer";
import { Home } from "./home/home-page";
import { PropertyDetail } from "./property-detail/property-detail-page";
import { LandlordDashboardPage } from "./landlord-dashboard/landlord-dashboard-page";

const AppLayout = () => {
  return (
    <>
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
          <Route path="property/:id" element={<PropertyDetail />} />
          <Route path="landlord" element={<LandlordDashboardPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
