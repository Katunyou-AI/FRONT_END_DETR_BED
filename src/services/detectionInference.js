import { API_BASE_URL, API_ENDPOINTS } from '@/config/api'

function getAuthToken() {
  return localStorage.getItem('authToken')
}

export default {
  detectionInference: async ({ camera_id, current_frame, previous_frame }) => {
    try {
        const token = getAuthToken()
        const formData = new FormData()
        formData.append('camera_id', camera_id)
        if (current_frame) formData.append('current_frame', current_frame, 'current.jpg')
        if (previous_frame) formData.append('previous_frame', previous_frame, 'previous.jpg')

        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.INFERENCE.BASE}`, {
          method: 'POST',
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: formData,
        })
        if (!response.ok) {
          throw new Error('Failed to send inference data')
        }
        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error sending inference data:', error)
        throw error
    }
  },
}