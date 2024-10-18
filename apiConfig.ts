// apiConfig.ts

// Define types for our endpoints
type Endpoints = {
    users: string;
    drivers: string;
    createRide: string;
    getRide: (id: string | number) => string;
  };
  
  const API_BASE_URL = process.env.EXPO_PUBLIC_SERVER_URL || 'https://riidebase-dev.vercel.app';
  
  export const endpoints: Endpoints = {
    users: '/user',
    drivers: '/driver',
    createRide: 'ride',
    getRide: (id) => `/${id}`,
  };
  
  export const getFullUrl = (endpoint: string): string => `${API_BASE_URL}${endpoint}`;