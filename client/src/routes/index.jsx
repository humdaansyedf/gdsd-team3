import { Container } from "@mantine/core";
import { BrowserRouter, Link, Outlet, Route, Routes } from "react-router-dom";
import { Footer } from "../components/Footer/Footer";
import { Header } from "../components/Header/Header";
import { CardsCarousel } from "../components/corousel/carousel";
import { Home } from "./home/home-page";
import { PropertyDetail } from "./property-detail/property-detail-page";

const AppLayout = () => {
  return (
    <>
      <Header />
      <CardsCarousel />
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
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
