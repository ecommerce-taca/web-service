import { useState } from 'react';
import PropTypes from 'prop-types';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('taca_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const login = (userData, tokens) => {
    setUser(userData);
    localStorage.setItem('taca_user', JSON.stringify(userData));
    if (tokens) {
      localStorage.setItem('taca_access_token', tokens.access_token);
      localStorage.setItem('taca_refresh_token', tokens.refresh_token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('taca_user');
    localStorage.removeItem('taca_access_token');
    localStorage.removeItem('taca_refresh_token');
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthModalOpen,
      openAuthModal,
      closeAuthModal
    }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
