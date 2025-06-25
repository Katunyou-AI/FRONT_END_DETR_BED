/**
 * ไฟล์กำหนดค่า API สำหรับการเชื่อมต่อกับ Backend
 */

// Base URL สำหรับ API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// Timeout สำหรับ request (ms)
export const API_TIMEOUT = 15000

// Endpoints
export const API_ENDPOINTS = {
  // ผู้ใช้งาน
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },

  // กล้อง
  CAMERAS: {
    BASE: '/cameras',
    DETAIL: (id) => `/cameras/${id}`,
    STATUS: (id) => `/cameras/${id}/status`,
    STREAMS: (id) => `/cameras/${id}/streams`,
  },

  // เหตุการณ์
  EVENTS: {
    BASE: '/events',
    DETAIL: (id) => `/events/${id}`,
    BY_CAMERA: (cameraId) => `/cameras/${cameraId}/events`,
  },

  // การแจ้งเตือน
  NOTIFICATIONS: {
    BASE: '/notifications',
    READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
  },

  // การตั้งค่า
  SETTINGS: {
    BASE: '/settings',
    NOTIFICATION: '/settings/notification',
  },
}

// HTTP status codes ที่ใช้บ่อย
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
}
