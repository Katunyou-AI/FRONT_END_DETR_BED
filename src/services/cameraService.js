/**
 * Service จัดการกับ API เกี่ยวกับกล้อง
 */
import { API_ENDPOINTS } from '@/config/api'

export default {
  /**
   * ดึงรายการกล้องทั้งหมด
   */
  getAllCameras: async () => {
    try {
      // ดึงข้อมูลจาก localStorage เป็น fallback
      const storedCameras = localStorage.getItem('cameras')
      let mockCameras = []

      if (storedCameras) {
        mockCameras = JSON.parse(storedCameras)
      }

      return mockCameras
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
      // ดึงข้อมูลจาก localStorage เป็น fallback
      const storedCameras = localStorage.getItem('cameras')
      if (storedCameras) {
        const cameras = JSON.parse(storedCameras)
        const camera = cameras.find((cam) => cam.id === cameraId)
        if (camera) {
          return camera
        }
      }

      throw new Error('Camera not found')
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
      // แต่ตอนนี้จะใช้ข้อมูลจาก localStorage ก่อน
      const storedCameras = localStorage.getItem('cameras')
      let cameras = []

      if (storedCameras) {
        cameras = JSON.parse(storedCameras)
      }

      // เพิ่มกล้องใหม่
      cameras.push(cameraData)

      // บันทึกกลับไป localStorage
      localStorage.setItem('cameras', JSON.stringify(cameras))

      return cameraData
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
      // ใช้ localStorage จนกว่าจะมี API จริง
      const storedCameras = localStorage.getItem('cameras')
      if (storedCameras) {
        const cameras = JSON.parse(storedCameras)
        const index = cameras.findIndex((cam) => cam.id === cameraId)

        if (index !== -1) {
          cameras[index] = { ...cameras[index], ...cameraData }
          localStorage.setItem('cameras', JSON.stringify(cameras))
          return cameras[index]
        }
      }

      throw new Error('Camera not found')
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
      // ใช้ localStorage จนกว่าจะมี API จริง
      const storedCameras = localStorage.getItem('cameras')
      if (storedCameras) {
        const cameras = JSON.parse(storedCameras)
        const newCameras = cameras.filter((cam) => cam.id !== cameraId)
        localStorage.setItem('cameras', JSON.stringify(newCameras))
        return { success: true }
      }

      return { success: false }
    } catch (error) {
      console.error(`Error deleting camera ${cameraId}:`, error)
      throw error
    }
  },

  /**
   * อัปเดตสถานะกล้อง
   */
  updateCameraStatus: async (cameraId, status) => {
    try {
      // ใช้ localStorage จนกว่าจะมี API จริง
      const storedCameras = localStorage.getItem('cameras')
      if (storedCameras) {
        const cameras = JSON.parse(storedCameras)
        const camera = cameras.find((cam) => cam.id === cameraId)

        if (camera) {
          camera.status = status
          localStorage.setItem('cameras', JSON.stringify(cameras))
          return { success: true, status }
        }
      }

      return { success: false }
    } catch (error) {
      console.error(`Error updating camera status ${cameraId}:`, error)
      throw error
    }
  },

  /**
   * ขอ stream URL สำหรับดูกล้องแบบเรียลไทม์
   */
  getStreamUrl: async (cameraId) => {
    try {
      // ใช้ localStorage จนกว่าจะมี API จริง
      const storedCameras = localStorage.getItem('cameras')
      if (storedCameras) {
        const cameras = JSON.parse(storedCameras)
        const camera = cameras.find((cam) => cam.id === cameraId)

        if (camera) {
          return {
            streamUrl: camera.url || 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
          }
        }
      }

      throw new Error('Camera not found')
    } catch (error) {
      console.error(`Error getting stream for camera ${cameraId}:`, error)
      throw error
    }
  },
}
