/**
 * Service จัดการกับ API เกี่ยวกับกล้อง
 */
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api'

// Helper to get auth token from localStorage
function getAuthToken() {
  return localStorage.getItem('authToken')
}

export default {
  /**
   * ดึงรายการกล้องทั้งหมด
   */
  getAllCameras: async () => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CAMERAS.BASE}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      })
      if (!response.ok) {
        throw new Error('Failed to fetch cameras')
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching cameras:', error)
      throw error
    }
  },

  /**
   * ดึงข้อมูลกล้องตาม ID
   */
  getCameraById: async (cameraId) => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CAMERAS.DETAIL(cameraId)}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      })
      if (!response.ok) {
        throw new Error('Failed to fetch cameras')
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error(`Error fetching camera ${cameraId}:`, error)
      throw error
    }
  },

  /**
   * เพิ่มกล้องใหม่
   */
  addCamera: async (cameraData) => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CAMERAS.BASE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(cameraData),
      })
      if (!response.ok) {
        throw new Error('Failed to add camera')
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error adding camera:', error)
      throw error
    }
  },

  /**
   * อัปเดตข้อมูลกล้อง
   */
  updateCamera: async (cameraId, cameraData) => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CAMERAS.DETAIL(cameraId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(cameraData),
      })
      if (!response.ok) {
        throw new Error('Failed to update camera')
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error(`Error updating camera ${cameraId}:`, error)
      throw error
    }
  },

  /**
   * ลบกล้อง
   */
  deleteCamera: async (cameraId) => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CAMERAS.DETAIL(cameraId)}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      })
      if (!response.ok) {
        throw new Error('Failed to delete camera')
      }
      return { success: true }
    } catch (error) {
      console.error(`Error deleting camera ${cameraId}:`, error)
      throw error
    }
  },

  // /**
  //  * อัปเดตสถานะกล้อง
  //  */
  // updateCameraStatus: async (cameraId, status) => {
  //   try {
  //     // ใช้ localStorage จนกว่าจะมี API จริง
  //     const storedCameras = localStorage.getItem('cameras')
  //     if (storedCameras) {
  //       const cameras = JSON.parse(storedCameras)
  //       const camera = cameras.find((cam) => cam.id === cameraId)

  //       if (camera) {
  //         camera.status = status
  //         localStorage.setItem('cameras', JSON.stringify(cameras))
  //         return { success: true, status }
  //       }
  //     }

  //     return { success: false }
  //   } catch (error) {
  //     console.error(`Error updating camera status ${cameraId}:`, error)
  //     throw error
  //   }
  // },

  // /**
  //  * ขอ stream URL สำหรับดูกล้องแบบเรียลไทม์
  //  */
  // getStreamUrl: async (cameraId) => {
  //   try {
  //     // ใช้ localStorage จนกว่าจะมี API จริง
  //     const storedCameras = localStorage.getItem('cameras')
  //     if (storedCameras) {
  //       const cameras = JSON.parse(storedCameras)
  //       const camera = cameras.find((cam) => cam.id === cameraId)

  //       if (camera) {
  //         return {
  //           streamUrl: camera.url || 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
  //         }
  //       }
  //     }

  //     throw new Error('Camera not found')
  //   } catch (error) {
  //     console.error(`Error getting stream for camera ${cameraId}:`, error)
  //     throw error
  //   }
  // },
}
