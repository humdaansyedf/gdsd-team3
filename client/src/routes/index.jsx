import { BrowserRouter, Routes, Route, Outlet, Link } from "react-router-dom";
import { Home } from "./home";
import { PropertyDetail } from "./property-detail";

const AppLayout = () => {
  return (
    <>
      <div className="disclaimer">
        Fulda University of Applied Sciences Software Engineering Project, Fall 2024. FOR DEMONSTRATION ONLY.
      </div>
      <div className="content">
        <header>
          <Link to="/">NeuAnfang</Link>
        </header>
        <main>
          <Outlet />
        </main>
        <footer>NeuAnfang</footer>
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
