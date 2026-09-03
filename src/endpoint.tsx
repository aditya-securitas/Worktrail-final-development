export const API_ENDPOINTS = {
  auth: {
    login: 'http://10.80.0.83:3000/login',
    register: 'http://10.80.0.83:3000/Register',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
  },
  menu: 'http://10.80.0.83:3000/Menu',
    payments: {
    createOrder: 'http://10.80.0.83:3000/Payment/CreateOrder',
    verify: 'http://10.80.0.83:3000/Payment/Verify',
    transaction: (orderId: string) => `http://10.80.0.83:3000/Payment/Transaction/${encodeURIComponent(orderId)}`,
  },
  users: {
    profile: '/api/users/profile',
  },
} as const

export type ApiEndpoint =
  (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS][keyof (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS]]