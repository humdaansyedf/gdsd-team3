import { BrowserRouter, Routes, Route, Outlet, Link } from "react-router-dom";
import { Home } from "./home";

const AppLayout = () => {
  return (
    <div>
      <header>
        <Link to="/">NeA</Link>
      </header>
      <main>
        <Outlet />
      </main>
      <footer>NeA</footer>
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

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
