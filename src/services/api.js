/**
 * Service สำหรับการสื่อสารกับ Backend API
 */
import { API_BASE_URL, API_TIMEOUT } from '@/config/api'

// เพิ่มการตรวจสอบสภาพแวดล้อมการพัฒนา
const isDevelopment = import.meta.env.DEV

// ตัวแปรเก็บ token เพื่อส่งเป็น Authorization Header
let authToken = localStorage.getItem('authToken') || null

/**
 * ตั้งค่า Auth Token
 */
export function setAuthToken(token) {
  authToken = token
  localStorage.setItem('authToken', token)
}

/**
 * ล้าง Auth Token
 */
export function resetAuthToken() {
  authToken = null
  localStorage.removeItem('authToken')
}

/**
 * ทำ fetch request พร้อมกำหนด timeout
 */
async function fetchWithTimeout(url, options = {}, timeout = API_TIMEOUT) {
  // ถ้าอยู่ในโหมดพัฒนา และไม่มี API จริง ให้จำลองการเรียก API
  if (isDevelopment && !window._hasRealAPI) {
    console.log(`[DEV] Mock fetch to: ${url}`, options)
    // จำลองการรอเวลาเพื่อให้เหมือนกับการเรียก API จริง
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, message: 'Mock API Response' }),
          }),
        300,
      ),
    )
  }

  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })

    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`)
      error.status = response.status
      throw error
    }

    return response
  } catch (error) {
    // ถ้าการเรียก API ล้มเหลวในครั้งแรก แล้วอยู่ในโหมดพัฒนา ให้สลับไปใช้โหมดจำลอง API
    if (isDevelopment) {
      console.warn('[API] Failed to connect to real API, switching to mock mode')
      window._hasRealAPI = false
      // ลองใหม่ด้วยโหมดจำลอง
      return fetchWithTimeout(url, options, timeout)
    }
    throw error
  } finally {
    clearTimeout(id)
  }
}

/**
 * ฟังก์ชั่นพื้นฐานสำหรับการส่ง request
 */
async function request(endpoint, method = 'GET', data = null, withAuth = true) {
  const url = `${API_BASE_URL}${endpoint}`
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  }

  if (withAuth && authToken) {
    options.headers['Authorization'] = `Bearer ${authToken}`
  }

  // เพิ่ม body สำหรับ POST, PUT requests
  if (data && ['POST', 'PUT'].includes(method)) {
    options.body = JSON.stringify(data)
  }

  try {
    const response = await fetchWithTimeout(url, options)
    const result = await response.json().catch(() => ({}))
    return result
  } catch (error) {
    // จัดการกับ token หมดอายุ (401 Unauthorized)
    if (error.status === 401) {
      // ลองทำการ refresh token
      if (endpoint !== '/auth/refresh') {
        try {
          const refreshResult = await refreshToken()
          if (refreshResult) {
            // ทำ request ใหม่อีกครั้งด้วย token ใหม่
            return await request(endpoint, method, data, withAuth)
          }
        } catch (refreshError) {
          // Logout เมื่อไม่สามารถ refresh token ได้
          resetAuthToken()
          window.location.href = '/' // redirect กลับไปที่ login
        }
      } else {
        // กรณีที่ refresh token ไม่สำเร็จ
        resetAuthToken()
      }
    }

    throw error
  }
}

/**
 * ฟังก์ชันพยายาม refresh token
 */
async function refreshToken() {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include', // จำเป็นสำหรับส่ง cookies ที่มี refresh token
    })

    const data = await response.json()
    if (data.token) {
      setAuthToken(data.token)
      return true
    }
    return false
  } catch (error) {
    return false
  }
}

/**
 * Export API methods
 */
export default {
  // GET request
  get: async (endpoint, withAuth = true) => {
    try {
      return await request(endpoint, 'GET', null, withAuth)
    } catch (error) {
      console.error(`[API] GET ${endpoint} failed:`, error)
      return {}
    }
  },

  // POST request
  post: async (endpoint, data, withAuth = true) => {
    try {
      return await request(endpoint, 'POST', data, withAuth)
    } catch (error) {
      console.error(`[API] POST ${endpoint} failed:`, error)
      return {}
    }
  },

  // PUT request
  put: async (endpoint, data, withAuth = true) => {
    try {
      return await request(endpoint, 'PUT', data, withAuth)
    } catch (error) {
      console.error(`[API] PUT ${endpoint} failed:`, error)
      return {}
    }
  },

  // DELETE request
  delete: async (endpoint, withAuth = true) => {
    try {
      return await request(endpoint, 'DELETE', null, withAuth)
    } catch (error) {
      console.error(`[API] DELETE ${endpoint} failed:`, error)
      return {}
    }
  },

  // Upload file
  upload: async (endpoint, file, onProgress, withAuth = true) => {
    const url = `${API_BASE_URL}${endpoint}`

    const formData = new FormData()
    formData.append('file', file)

    const xhr = new XMLHttpRequest()

    // สร้าง Promise สำหรับ XHR
    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          onProgress(percentComplete)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            resolve(response)
          } catch (e) {
            resolve({})
          }
        } else {
          reject({
            status: xhr.status,
            statusText: xhr.statusText,
          })
        }
      })

      xhr.addEventListener('error', () => {
        reject({
          status: xhr.status,
          statusText: 'Network error occurred',
        })
      })

      xhr.addEventListener('abort', () => {
        reject({
          status: xhr.status,
          statusText: 'Request aborted',
        })
      })

      xhr.open('POST', url)

      if (withAuth && authToken) {
        xhr.setRequestHeader('Authorization', `Bearer ${authToken}`)
      }

      xhr.send(formData)
    })
  },
}
