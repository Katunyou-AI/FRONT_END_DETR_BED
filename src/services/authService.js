/**
 * Service จัดการกับ API เกี่ยวกับการยืนยันตัวตนและผู้ใช้
 */
import { API_ENDPOINTS } from '@/config/api'

export default {
  /**
   * เข้าสู่ระบบ
   */
  login: async (username, password) => {
    try {
      // ใช้การจำลองถ้ายังไม่มี API จริง
      if (username === 'admin' && password === 'admin123') {
        const response = {
          token: 'mock-jwt-token-' + Date.now(),
          user: {
            id: 1,
            username: 'admin',
            name: 'ผู้ดูแลระบบ',
            role: 'admin',
          },
        }

        // เก็บ token ลง localStorage เพื่อใช้งานต่อไป
        localStorage.setItem('authToken', response.token)
        return response
      }

      throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
    } catch (error) {
      throw new Error(error.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
    }
  },

  /**
   * ออกจากระบบ
   */
  logout: async () => {
    try {
      // ล้าง token และข้อมูลผู้ใช้
      localStorage.removeItem('authToken')
    } catch (error) {
      console.warn('Logout failed', error)
    }
  },

  /**
   * ตรวจสอบสถานะการเข้าสู่ระบบ
   */
  checkAuthStatus: async () => {
    try {
      // ตรวจสอบว่ามี token อยู่หรือไม่
      const token = localStorage.getItem('authToken')
      const mockUser = JSON.parse(localStorage.getItem('user'))

      if (token && mockUser) {
        return { isLoggedIn: true, user: mockUser }
      }

      return { isLoggedIn: false, user: null }
    } catch (error) {
      return { isLoggedIn: false, user: null }
    }
  },
}
