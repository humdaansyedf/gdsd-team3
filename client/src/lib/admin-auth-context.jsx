import * as React from "react";

export const AdminAuthContext = React.createContext({
  admin: null,
  logout: () => {},
});

export const useAdminAuth = () => {
  return React.useContext(AdminAuthContext);
};
