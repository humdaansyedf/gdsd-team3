import * as React from "react";

export const AuthContext = React.createContext({
  isLoading: true,
  user: null,
  logout: () => {},
});

export const useAuth = () => {
  return React.useContext(AuthContext);
};
