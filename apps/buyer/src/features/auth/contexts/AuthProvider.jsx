import { useReducer, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { AuthContext } from './AuthContext';
import { authApi } from '../services/auth.api';

const initialState = {
  user: (() => {
    const savedUser = localStorage.getItem('taca_user');
    return savedUser ? JSON.parse(savedUser) : null;
  })(),
  isAuthenticated: !!localStorage.getItem('taca_user'),
  isAuthModalOpen: false,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      localStorage.setItem('taca_user', JSON.stringify(action.payload.user));
      if (action.payload.tokens) {
        localStorage.setItem('taca_access_token', action.payload.tokens.access_token);
        localStorage.setItem('taca_refresh_token', action.payload.tokens.refresh_token);
      }
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      localStorage.removeItem('taca_user');
      localStorage.removeItem('taca_access_token');
      localStorage.removeItem('taca_refresh_token');
      return {
        ...state,
        user: null,
        isAuthenticated: false,
      };
    case 'OPEN_MODAL':
      return { ...state, isAuthModalOpen: true };
    case 'CLOSE_MODAL':
      return { ...state, isAuthModalOpen: false };
    default:
      return state;
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = useCallback((userData, tokens) => {
    dispatch({ type: 'LOGIN', payload: { user: userData, tokens } });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  useEffect(() => {
    const handleAuthLogout = () => {
      dispatch({ type: 'LOGOUT' });
    };
    
    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, []);

  const openAuthModal = useCallback(() => dispatch({ type: 'OPEN_MODAL' }), []);
  const closeAuthModal = useCallback(() => dispatch({ type: 'CLOSE_MODAL' }), []);

  const contextValue = useMemo(() => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isAuthModalOpen: state.isAuthModalOpen,
    login,
    logout,
    openAuthModal,
    closeAuthModal
  }), [state.user, state.isAuthenticated, state.isAuthModalOpen, login, logout, openAuthModal, closeAuthModal]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
