import {
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    signOut,
    onAuthStateChanged
} from 'firebase/auth'
import { auth, googleProvider } from '@/config/firebase'

export default {
    /**
     * เข้าสู่ระบบด้วย Google (Popup)
     */
    async signInWithGoogle() {
        try {
            const result = await signInWithPopup(auth, googleProvider)
            const user = result.user

            // สร้างข้อมูลผู้ใช้ในรูปแบบที่แอปต้องการ
            const userData = {
                id: user.uid,
                email: user.email,
                name: user.displayName,
                avatar: user.photoURL,
                provider: 'google',
                emailVerified: user.emailVerified,
            }

            return {
                user: userData,
                token: await user.getIdToken(), // Firebase ID Token
            }
        } catch (error) {
            console.error('Google sign-in error:', error)

            // จัดการข้อผิดพลาดต่างๆ
            if (error.code === 'auth/popup-closed-by-user') {
                throw new Error('การเข้าสู่ระบบถูกยกเลิก')
            } else if (error.code === 'auth/popup-blocked') {
                throw new Error('Popup ถูกบล็อก กรุณาอนุญาต popup สำหรับเว็บไซต์นี้')
            } else if (error.code === 'auth/cancelled-popup-request') {
                throw new Error('การเข้าสู่ระบบถูกยกเลิก')
            } else {
                throw new Error('เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google')
            }
        }
    },

    /**
     * เข้าสู่ระบบด้วย Google (Redirect) - สำหรับมือถือ
     */
    async signInWithGoogleRedirect() {
        try {
            await signInWithRedirect(auth, googleProvider)
        } catch (error) {
            console.error('Google redirect sign-in error:', error)
            throw new Error('เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google')
        }
    },

    /**
     * ตรวจสอบผลลัพธ์จาก redirect
     */
    async getRedirectResult() {
        try {
            const result = await getRedirectResult(auth)
            if (result) {
                const user = result.user
                const userData = {
                    id: user.uid,
                    email: user.email,
                    name: user.displayName,
                    avatar: user.photoURL,
                    provider: 'google',
                    emailVerified: user.emailVerified,
                }

                return {
                    user: userData,
                    token: await user.getIdToken(),
                }
            }
            return null
        } catch (error) {
            console.error('Redirect result error:', error)
            throw new Error('เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google')
        }
    },

    /**
     * ออกจากระบบ Firebase
     */
    async signOut() {
        try {
            await signOut(auth)
        } catch (error) {
            console.error('Sign out error:', error)
            throw new Error('เกิดข้อผิดพลาดในการออกจากระบบ')
        }
    },

    /**
     * ติดตามสถานะการเข้าสู่ระบบ
     */
    onAuthStateChanged(callback) {
        return onAuthStateChanged(auth, callback)
    },

    /**
     * ได้ผู้ใช้ปัจจุบัน
     */
    getCurrentUser() {
        return auth.currentUser
    },

    /**
     * ได้ token ปัจจุบัน
     */
    async getCurrentToken() {
        const user = auth.currentUser
        if (user) {
            return await user.getIdToken()
        }
        return null
    }
}
