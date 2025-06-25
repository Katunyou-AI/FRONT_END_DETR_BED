import { defineStore } from 'pinia'
import { ref } from 'vue'
import authService from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const isLoggedIn = ref(false)
  const isLoading = ref(false)
  const error = ref(null)

  // Check for existing session in localStorage
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    try {
      user.value = JSON.parse(storedUser)
      isLoggedIn.value = true
    } catch (e) {
      localStorage.removeItem('user')
    }
  }

  // Actions
  async function login(username, password) {
    isLoading.value = true
    error.value = null

    try {
      // เรียกใช้ service แทนโค้ด mock
      const result = await authService.login(username, password)

      // บันทึกข้อมูลผู้ใช้
      user.value = result.user
      isLoggedIn.value = true
      localStorage.setItem('user', JSON.stringify(result.user))

      return result.user
    } catch (err) {
      error.value = err.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    isLoading.value = true
    try {
      // เรียกใช้ service แทนโค้ดเดิม
      await authService.logout()
    } finally {
      // Clear state
      user.value = null
      isLoggedIn.value = false
      isLoading.value = false

      // Clear localStorage
      localStorage.removeItem('user')
      localStorage.removeItem('authToken')
    }
  }

  // ฟังก์ชันใหม่: ตรวจสอบสถานะการเข้าสู่ระบบ
  async function checkAuthStatus() {
    isLoading.value = true
    error.value = null

    try {
      const { isLoggedIn: status, user: userData } = await authService.checkAuthStatus()

      isLoggedIn.value = status
      user.value = userData

      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData))
      } else {
        localStorage.removeItem('user')
      }

      return status
    } catch (err) {
      error.value = 'เกิดข้อผิดพลาดในการตรวจสอบสถานะการเข้าสู่ระบบ'
      isLoggedIn.value = false
      user.value = null
      localStorage.removeItem('user')
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    isLoggedIn,
    isLoading,
    error,
    login,
    logout,
    checkAuthStatus,
  }
})
