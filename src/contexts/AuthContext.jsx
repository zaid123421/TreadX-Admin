import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      // Normalize role to string for compatibility
      const normalizedUser = {
        ...action.payload.user,
        roleName: typeof action.payload.user.role === 'object' ? action.payload.user.role.name : action.payload.user.role
      };
      return { 
        ...state, 
        loading: false, 
        isAuthenticated: true, 
        user: normalizedUser,
        token: action.payload.token,
        error: null 
      };
    case 'LOGIN_FAILURE':
      return { 
        ...state, 
        loading: false, 
        isAuthenticated: false, 
        user: null,
        token: null,
        error: action.payload 
      };
    case 'LOGOUT':
      return { 
        ...state, 
        isAuthenticated: false, 
        user: null,
        token: null,
        error: null 
      };
    case 'SET_USER':
      // Normalize role to string for compatibility
      const normalizedSetUser = {
        ...action.payload,
        roleName: typeof action.payload.role === 'object' ? action.payload.role.name : action.payload.role
      };
      return { ...state, user: normalizedSetUser };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check for existing token on app load
    const token = localStorage.getItem('treadx_token');
    const user = localStorage.getItem('treadx_user');
    
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        // Normalize role to string for compatibility
        parsedUser.roleName = typeof parsedUser.role === 'object' ? parsedUser.role.name : parsedUser.role;
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: { token, user: parsedUser } 
        });
      } catch (error) {
        localStorage.removeItem('treadx_token');
        localStorage.removeItem('treadx_user');
      }
    }
  }, []);

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await authService.login(email, password);
      const { token } = response.data;
      localStorage.setItem('treadx_token', token);
      // Fetch user profile from /me endpoint
      const userResponse = await authService.getCurrentUser();
      let user = userResponse.data;
      // Normalize role to string for compatibility
      const normalizedUser = {
        ...user,
        roleName: typeof user.role === 'object' ? user.role.name : user.role
      };
      localStorage.setItem('treadx_user', JSON.stringify(normalizedUser));
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { token, user: normalizedUser } 
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: errorMessage 
      });
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('treadx_token');
    localStorage.removeItem('treadx_user');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (userData) => {
    const updatedUser = { ...state.user, ...userData };
    // Normalize role to string for compatibility
    updatedUser.roleName = typeof updatedUser.role === 'object' ? updatedUser.role.name : updatedUser.role;
    localStorage.setItem('treadx_user', JSON.stringify(updatedUser));
    dispatch({ type: 'SET_USER', payload: updatedUser });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const hasRole = (role) => {
    return state.user?.roleName === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(state.user?.roleName);
  };

  const value = {
    ...state,
    login,
    logout,
    updateUser,
    clearError,
    hasRole,
    hasAnyRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

