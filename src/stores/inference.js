import { defineStore } from 'pinia'
import { ref } from 'vue'
import detectionInferenceService from '@/services/detectionInference'

export const useInferenceStore = defineStore('inference', () => {
  const isLoading = ref(false)
  const error = ref(null)
  const result = ref(null)

  async function sendToInference({ camera_id, current_frame, previous_frame }) {
    isLoading.value = true
    error.value = null
    result.value = null
    try {
      const res = await detectionInferenceService.detectionInference({ camera_id, current_frame, previous_frame })
      result.value = res
      return res
    } catch (err) {
      error.value = err.message || 'เกิดข้อผิดพลาดในการส่งภาพไป inference'
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    result,
    sendToInference,
  }
})
