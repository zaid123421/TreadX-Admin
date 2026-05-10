import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '@/features/auth/services/authService';
import { AUTH_TOKENS_REFRESHED_EVENT } from '@/shared/services/refreshTokenClient';

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
    case 'INIT_DONE':
      return { ...state, loading: false };
    case 'TOKENS_REFRESHED':
      return { ...state, token: action.payload.token };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
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
    dispatch({ type: 'INIT_DONE' });
  }, []);

  useEffect(() => {
    const onTokensRefreshed = (e) => {
      const token = e.detail?.accessToken ?? localStorage.getItem('treadx_token');
      if (token) {
        dispatch({ type: 'TOKENS_REFRESHED', payload: { token } });
      }
    };
    window.addEventListener(AUTH_TOKENS_REFRESHED_EVENT, onTokensRefreshed);
    return () => window.removeEventListener(AUTH_TOKENS_REFRESHED_EVENT, onTokensRefreshed);
  }, []);

  const login = async (email, password) => {
  dispatch({ type: 'LOGIN_START' });
  
  try {
    const response = await authService.login(email, password);
    
    // authService.login يرجع data مباشرة (ليس axios response.data)
    const {
      accessToken: accessTokenFromServer,
      access_token: accessTokenFromSnake,
      refreshToken: refreshTokenFromServer,
      refresh_token: refreshTokenFromSnake,
      token: tokenFromServer,
      // $rest يمثل بيانات المستخدم/الخصائص الأخرى التي يعيدها السيرفر
      ...userData
    } = response;

    const accessToken = accessTokenFromServer ?? tokenFromServer ?? accessTokenFromSnake ?? null;
    const refreshToken = refreshTokenFromServer ?? refreshTokenFromSnake ?? null;

    if (!accessToken) {
      throw new Error("Access token missing from server response");
    }

    // 1. تخزين التوكنات في LocalStorage
    localStorage.setItem('treadx_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('treadx_refresh_token', refreshToken);
    }

    // 2. تجهيز بيانات المستخدم وتخزينها
    const currentUser = await authService.getCurrentUser();
    const mergedUser = currentUser ?? userData;

    const normalizedUser = {
      ...mergedUser,
      roleName: typeof mergedUser.role === 'object' ? mergedUser.role.name : mergedUser.role,
    };
    
    localStorage.setItem('treadx_user', JSON.stringify(normalizedUser));

    // 3. تحديث حالة الـ Auth في التطبيق
    dispatch({ 
      type: 'LOGIN_SUCCESS', 
      payload: { token: accessToken, user: normalizedUser } 
    });

    return { success: true };

  } catch (error) {
    // التقاط رسالة الخطأ سواء من السيرفر أو خطأ برمجبي
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      (typeof error === 'string' ? error : JSON.stringify(error)) ||
      'Login failed';
    
    dispatch({ 
      type: 'LOGIN_FAILURE', 
      payload: errorMessage 
    });
    
    return { success: false, error: errorMessage };
  }
};

  const logout = async () => {
    await authService.logout();
    localStorage.removeItem('treadx_token');
    localStorage.removeItem('treadx_user');
    localStorage.removeItem('treadx_refresh_token');
    localStorage.removeItem('treadx_territory_code');
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

