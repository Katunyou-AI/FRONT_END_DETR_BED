/**
 * Service จัดการกับ API เกี่ยวกับการยืนยันตัวตนและผู้ใช้
 */
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api'

export default {
  /**
   * เข้าสู่ระบบ
   */
  login: async (username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
      }
      const data = await response.json()
      // เก็บ token และ user ลง localStorage
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      return data
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
