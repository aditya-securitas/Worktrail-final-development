export const API_ENDPOINTS = {
  auth: {
    login: 'http://10.80.0.83:3000/login',
    register: 'http://10.80.0.83:3000/Register',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
  },
  menu: 'http://10.80.0.83:3000/Menu',
  users: {
    profile: '/api/users/profile',
  },
} as const

export type ApiEndpoint =
  (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS][keyof (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS]]