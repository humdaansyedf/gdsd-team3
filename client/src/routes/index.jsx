import { BrowserRouter, Link, Outlet, Route, Routes } from "react-router-dom";
import { FooterLinks } from "../Components/Footer/FooterLinks";
import { HeaderSearch } from "../Components/Header/HeaderSeach";
import { Home } from "./home/home-page";
import { PropertyDetail } from "./property-detail/property-detail-page";

const AppLayout = () => {
  return (
    <>
      <HeaderSearch> </HeaderSearch> 
      <div className="content">
        <main>
          <Outlet />                
        </main>
        <FooterLinks></FooterLinks>
      </div>
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
