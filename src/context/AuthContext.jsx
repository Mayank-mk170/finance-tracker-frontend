import { createContext, useContext, useState } from "react";
import { loginUser, registerUser } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() =>
    localStorage.getItem("token")
  );

  const register = async (userData) => {
    return await registerUser(userData);
  };

 
const login = async (credentials) => {
  const response = await loginUser(credentials);

  localStorage.setItem("token", response.token);
  setToken(response.token);

  const userData = {
    name: response.name,
    username: response.username,
    email: response.email,
    userId: response.userId,
  };

  localStorage.setItem("user", JSON.stringify(userData));
  setUser(userData);

  return response;
};


  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        register,
        login,
        logout,
        isAuthenticated: Boolean(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);