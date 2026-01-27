// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom'; // <--- Importar
import { useApolloClient } from '@apollo/client'; // <--- Importar para limpiar caché

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const client = useApolloClient(); // Acceso al cliente de Apollo

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // Función para actualizar los datos del usuario en tiempo real sin recargar
  const updateUserState = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    
    // 1. Limpiamos la caché de Apollo (datos en memoria) sin recargar
    await client.clearStore(); 
    
    // 2. Navegamos al login usando React Router
    navigate('/login'); 
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUserState }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);