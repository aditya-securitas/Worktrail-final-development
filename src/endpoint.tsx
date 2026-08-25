export const API_ENDPOINTS = {
  auth: {
    login: 'http://localhost:3000/Login',
    register: 'http://localhost:3000/Register',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
  },
  menu: 'http://localhost:3000/Menu',
  users: {
    profile: '/api/users/profile',
  },
} as const

export type ApiEndpoint =
  (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS][keyof (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS]]