import { defineStore } from 'pinia'
import { ref, onMounted } from 'vue'
import authService from '@/services/authService'
import firebaseAuthService from '@/services/firebaseAuthService'

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

    // เพิ่มฟังก์ชันเข้าสู่ระบบด้วย Google
    async function loginWithGoogle() {
        isLoading.value = true
        error.value = null

        try {
            const result = await firebaseAuthService.signInWithGoogle()

            // บันทึกข้อมูลผู้ใช้
            user.value = result.user
            isLoggedIn.value = true
            localStorage.setItem('user', JSON.stringify(result.user))
            localStorage.setItem('authToken', result.token)

            return result.user
        } catch (err) {
            error.value = err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google'
            throw error.value
        } finally {
            isLoading.value = false
        }
    }

    // เพิ่มฟังก์ชันเข้าสู่ระบบด้วย Google Redirect (สำหรับมือถือ)
    async function loginWithGoogleRedirect() {
        isLoading.value = true
        error.value = null

        try {
            await firebaseAuthService.signInWithGoogleRedirect()
        } catch (err) {
            error.value = err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google'
            isLoading.value = false
            throw error.value
        }
    }

    // ตรวจสอบผลลัพธ์จาก Google redirect
    async function checkGoogleRedirectResult() {
        try {
            const result = await firebaseAuthService.getRedirectResult()
            if (result) {
                user.value = result.user
                isLoggedIn.value = true
                localStorage.setItem('user', JSON.stringify(result.user))
                localStorage.setItem('authToken', result.token)
                return result.user
            }
            return null
        } catch (err) {
            error.value = err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google'
            return null
        }
    }

    async function logout() {
        isLoading.value = true
        try {
            // ออกจากระบบ Firebase ด้วย
            await firebaseAuthService.signOut()

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

    // ติดตามสถานะ Firebase Auth
    function initFirebaseAuthListener() {
        firebaseAuthService.onAuthStateChanged(async(firebaseUser) => {
            if (firebaseUser && !user.value) {
                // ผู้ใช้เข้าสู่ระบบ Firebase แต่ยังไม่มีข้อมูลใน store
                try {
                    const userData = {
                        id: firebaseUser.uid,
                        email: firebaseUser.email,
                        name: firebaseUser.displayName,
                        avatar: firebaseUser.photoURL,
                        provider: 'google',
                        emailVerified: firebaseUser.emailVerified,
                    }

                    user.value = userData
                    isLoggedIn.value = true
                    localStorage.setItem('user', JSON.stringify(userData))

                    const token = await firebaseUser.getIdToken()
                    localStorage.setItem('authToken', token)
                } catch (err) {
                    console.error('Error handling Firebase auth state change:', err)
                }
            } else if (!firebaseUser && user.value && user.value.provider === 'google') {
                // ผู้ใช้ออกจากระบบ Firebase
                user.value = null
                isLoggedIn.value = false
                localStorage.removeItem('user')
                localStorage.removeItem('authToken')
            }
        })
    }

    return {
        user,
        isLoggedIn,
        isLoading,
        error,
        login,
        loginWithGoogle,
        loginWithGoogleRedirect,
        checkGoogleRedirectResult,
        logout,
        checkAuthStatus,
        initFirebaseAuthListener,
    }
})
