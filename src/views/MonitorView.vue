<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCameraStore } from '@/stores/camera'
import { useNotificationStore } from '@/stores/notification'
import { useAuthStore } from '@/stores/auth'
import IconAlert from '@/components/icons/IconAlert.vue'
import IconCamera from '@/components/icons/IconCamera.vue'

const cameraStore = useCameraStore()
const notificationStore = useNotificationStore()
const authStore = useAuthStore()
const router = useRouter()

// State
const activeMonitors = ref({})
const motionDetected = ref({})
const riskLevel = ref({})
const logs = ref([])
const fullscreenCamera = ref(null) // เพิ่มตัวแปรสำหรับเก็บกล้องที่กำลังแสดงแบบเต็มจอ

// Notification settings
const notificationPeriod = ref({
  start: '00:00',
  end: '23:59',
  enabled: true,
})

// Timer references
const monitoringTimers = ref({})
const motionSimulationTimers = ref({})

// Computed properties
const cameras = computed(() => cameraStore.cameras)
const hasCameras = computed(() => cameras.value.length > 0)
const eventCount = computed(() => logs.value.length)
const alertCount = computed(() => logs.value.filter((log) => log.type === 'alert').length)

onMounted(() => {
  // Redirect if not logged in
  if (!authStore.isLoggedIn) {
    router.push('/')
    return
  }

  // Load cameras
  cameraStore.loadCameras()

  // Load saved notification settings if any
  const savedSettings = localStorage.getItem('notificationSettings')
  if (savedSettings) {
    notificationPeriod.value = JSON.parse(savedSettings)
  }

  // Initialize state for each camera
  cameras.value.forEach((camera) => {
    motionDetected.value[camera.id] = false
    riskLevel.value[camera.id] = 0
    activeMonitors.value[camera.id] = false
  })
})

onBeforeUnmount(() => {
  // Clean up all timers
  Object.keys(monitoringTimers.value).forEach((cameraId) => {
    clearTimeout(monitoringTimers.value[cameraId])
  })

  Object.keys(motionSimulationTimers.value).forEach((cameraId) => {
    clearTimeout(motionSimulationTimers.value[cameraId])
  })
})

// Start monitoring for a specific camera
function startMonitoring(camera) {
  activeMonitors.value[camera.id] = true

  // Simulate connecting to camera
  camera.status = 'connecting'

  // Add log
  addLog('info', `เริ่มการตรวจจับบนกล้อง ${camera.name}`)

  // Simulate connection after 2 seconds
  monitoringTimers.value[camera.id] = setTimeout(() => {
    camera.status = 'online'
    addLog('info', `เชื่อมต่อกับกล้อง ${camera.name} สำเร็จ`)

    // Start periodic monitoring (simulate motion detection at random intervals)
    startMotionSimulation(camera)
  }, 2000)
}

// Stop monitoring for a specific camera
function stopMonitoring(camera) {
  activeMonitors.value[camera.id] = false
  motionDetected.value[camera.id] = false
  riskLevel.value[camera.id] = 0

  // Clear timers
  if (monitoringTimers.value[camera.id]) {
    clearTimeout(monitoringTimers.value[camera.id])
  }

  if (motionSimulationTimers.value[camera.id]) {
    clearTimeout(motionSimulationTimers.value[camera.id])
  }

  // Set camera status
  camera.status = 'offline'
  addLog('info', `หยุดการตรวจจับบนกล้อง ${camera.name}`)
}

// Simulate motion detection for a camera
function startMotionSimulation(camera) {
  // Clear any existing timer for this camera
  if (motionSimulationTimers.value[camera.id]) {
    clearTimeout(motionSimulationTimers.value[camera.id])
  }

  // Set a random interval (5-15 seconds)
  const interval = Math.random() * 10000 + 5000

  motionSimulationTimers.value[camera.id] = setTimeout(() => {
    if (!activeMonitors.value[camera.id]) return

    // Simulate motion detection (50% chance)
    if (Math.random() > 0.5) {
      detectMotion(camera)
    }

    // Continue the simulation
    startMotionSimulation(camera)
  }, interval)
}

// Handle motion detection
function detectMotion(camera) {
  motionDetected.value[camera.id] = true

  // Calculate risk level (1-10)
  const currentRiskLevel = Math.floor(Math.random() * 10) + 1
  riskLevel.value[camera.id] = currentRiskLevel

  // Log the motion event
  addLog(
    'motion',
    `ตรวจพบการเคลื่อนไหวจากกล้อง ${camera.name} (ระดับความเสี่ยง: ${currentRiskLevel}/10)`,
  )

  // Check if risk level is high enough for alert (> 7)
  if (currentRiskLevel > 7) {
    // Check if notifications are enabled for this time period
    if (isWithinNotificationPeriod() && notificationPeriod.value.enabled) {
      triggerAlert(camera, currentRiskLevel)
    } else {
      addLog('info', `การแจ้งเตือนจาก ${camera.name} ถูกข้ามเนื่องจากอยู่นอกช่วงเวลาที่กำหนด`)
    }
  }

  // Reset motion detection after 3 seconds
  setTimeout(() => {
    motionDetected.value[camera.id] = false
    riskLevel.value[camera.id] = 0
  }, 3000)
}

// Trigger an alert notification
function triggerAlert(camera, riskLevel) {
  addLog('alert', `การแจ้งเตือน: ตรวจพบความเคลื่อนไหวที่น่าสงสัยจากกล้อง ${camera.name}!`)

  // Use notification store to create notification
  notificationStore.sendNotification({
    title: 'การแจ้งเตือนความปลอดภัย',
    message: `ตรวจพบความเคลื่อนไหวที่น่าสงสัยจากกล้อง ${camera.name} (ความเสี่ยง: ${riskLevel}/10)`,
    type: 'warning',
    timestamp: new Date(),
  })

  // Simulate taking a snapshot
  addLog('info', `บันทึกภาพจากกล้อง ${camera.name} สำหรับการแจ้งเตือนแล้ว`)
}

// Add a log entry
function addLog(type, message) {
  logs.value.unshift({
    id: Date.now(),
    type,
    message,
    timestamp: new Date().toLocaleTimeString(),
  })

  // Keep only the last 50 logs
  if (logs.value.length > 50) {
    logs.value = logs.value.slice(0, 50)
  }
}

// Check if current time is within notification period
function isWithinNotificationPeriod() {
  const now = new Date()
  const currentHours = now.getHours()
  const currentMinutes = now.getMinutes()

  const [startHours, startMinutes] = notificationPeriod.value.start.split(':').map(Number)
  const [endHours, endMinutes] = notificationPeriod.value.end.split(':').map(Number)

  const currentTimeInMinutes = currentHours * 60 + currentMinutes
  const startTimeInMinutes = startHours * 60 + startMinutes
  const endTimeInMinutes = endHours * 60 + endMinutes

  if (startTimeInMinutes <= endTimeInMinutes) {
    // Simple case: start time is earlier than end time
    return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes
  } else {
    // Case where period spans midnight
    return currentTimeInMinutes >= startTimeInMinutes || currentTimeInMinutes <= endTimeInMinutes
  }
}

// Save notification settings to localStorage
function saveNotificationSettings() {
  localStorage.setItem('notificationSettings', JSON.stringify(notificationPeriod.value))
  addLog('info', 'บันทึกการตั้งค่าการแจ้งเตือนแล้ว')
}

// Go to camera management
function goToAddCamera() {
  router.push('/camera')
}

// Clear all logs
function clearLogs() {
  logs.value = []
}

// Get risk status text
function getRiskStatusText(level) {
  if (level < 3) return 'ต่ำ'
  if (level < 7) return 'ปานกลาง'
  return 'สูง'
}

// Get risk status class
function getRiskStatusClass(level) {
  if (level < 3) return 'risk-low'
  if (level < 7) return 'risk-medium'
  return 'risk-high'
}

// ฟังก์ชั่นสำหรับเปิด/ปิดโหมดเต็มจอของกล้อง
function toggleFullscreen(camera) {
  if (fullscreenCamera.value === camera.id) {
    fullscreenCamera.value = null
  } else {
    fullscreenCamera.value = camera.id
    addLog('info', `กำลังดูกล้อง ${camera.name} แบบเต็มจอ`)
  }
}
</script>

<template>
  <div class="monitor-view">
    <div class="page-header">
      <h1 class="page-title">ระบบมอนิเตอร์</h1>
      <button @click="goToAddCamera" class="btn btn-primary">
        <IconCamera class="btn-icon" /> เพิ่มกล้องใหม่
      </button>
    </div>

    <div v-if="!hasCameras" class="no-camera">
      <div class="no-camera-content">
        <IconCamera class="no-camera-icon" />
        <p>ยังไม่มีกล้องในระบบ กรุณาเพิ่มกล้องก่อนใช้งานระบบมอนิเตอร์</p>
        <button @click="goToAddCamera" class="btn btn-primary">เพิ่มกล้อง</button>
      </div>
    </div>

    <div v-else class="dashboard">
      <div class="main-content">
        <!-- กริดแสดงกล้อง -->
        <div class="cameras-grid" :class="{ 'fullscreen-mode': fullscreenCamera }">
          <div
            v-for="camera in cameras"
            :key="camera.id"
            class="camera-card"
            :class="{
              'motion-detected': motionDetected[camera.id],
              'camera-fullscreen': fullscreenCamera === camera.id,
              'camera-hidden': fullscreenCamera && fullscreenCamera !== camera.id,
            }"
          >
            <div class="camera-header">
              <h3 class="camera-title">{{ camera.name }}</h3>
              <div class="camera-header-controls">
                <span class="camera-status" :class="camera.status">
                  {{
                    camera.status === 'online'
                      ? 'ออนไลน์'
                      : camera.status === 'connecting'
                        ? 'กำลังเชื่อมต่อ'
                        : 'ออฟไลน์'
                  }}
                </span>
                <!-- เพิ่มปุ่มขยายเต็มจอ -->
                <button
                  @click="toggleFullscreen(camera)"
                  class="btn-icon fullscreen-toggle"
                  :title="fullscreenCamera === camera.id ? 'ออกจากโหมดเต็มจอ' : 'ขยายเต็มจอ'"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path
                      v-if="fullscreenCamera === camera.id"
                      d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"
                    ></path>
                    <path
                      v-else
                      d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>

            <div class="video-container">
              <video
                muted
                loop
                autoplay
                :src="camera.url || 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4'"
                @error="camera.status = 'offline'"
              ></video>

              <div v-if="motionDetected[camera.id]" class="motion-alert">
                <IconAlert /> ตรวจพบการเคลื่อนไหว
              </div>
            </div>

            <div class="camera-controls">
              <div v-if="riskLevel[camera.id] > 0" class="risk-indicator">
                <span class="risk-level" :class="getRiskStatusClass(riskLevel[camera.id])">
                  {{ getRiskStatusText(riskLevel[camera.id]) }}
                </span>
                <span class="risk-value">{{ riskLevel[camera.id] }}/10</span>
              </div>

              <button
                v-if="!activeMonitors[camera.id]"
                @click="startMonitoring(camera)"
                class="btn btn-sm btn-success"
                :disabled="camera.status === 'connecting'"
              >
                เริ่มการตรวจจับ
              </button>
              <button v-else @click="stopMonitoring(camera)" class="btn btn-sm btn-danger">
                หยุดการตรวจจับ
              </button>
            </div>
          </div>
        </div>

        <!-- บันทึกกิจกรรม -->
        <div class="log-section card" :class="{ 'hidden-when-fullscreen': fullscreenCamera }">
          <div class="log-header">
            <h2 class="card-title">บันทึกกิจกรรม</h2>
            <button @click="clearLogs" class="btn btn-secondary btn-sm">ล้างบันทึก</button>
          </div>

          <div class="log-entries">
            <div v-if="logs.length === 0" class="empty-log">
              <p>ยังไม่มีบันทึกกิจกรรม</p>
            </div>

            <div v-for="log in logs" :key="log.id" class="log-entry" :class="log.type">
              <span class="log-time">{{ log.timestamp }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="sidebar" :class="{ 'hidden-when-fullscreen': fullscreenCamera }">
        <!-- การตั้งค่าการแจ้งเตือน -->
        <div class="card settings-card">
          <h2 class="card-title">ตั้งค่าการแจ้งเตือน</h2>

          <div class="form-group">
            <div class="form-check">
              <input
                type="checkbox"
                id="notification-enabled"
                v-model="notificationPeriod.enabled"
                class="form-check-input"
              />
              <label for="notification-enabled" class="form-check-label">
                เปิดใช้งานการแจ้งเตือน
              </label>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">ช่วงเวลาแจ้งเตือน</label>
            <div class="time-range">
              <input
                type="time"
                v-model="notificationPeriod.start"
                class="form-input time-input"
                :disabled="!notificationPeriod.enabled"
              />
              <span>ถึง</span>
              <input
                type="time"
                v-model="notificationPeriod.end"
                class="form-input time-input"
                :disabled="!notificationPeriod.enabled"
              />
            </div>
          </div>

          <button @click="saveNotificationSettings" class="btn btn-primary btn-save">
            บันทึกการตั้งค่า
          </button>
        </div>

        <!-- สถิติ -->
        <div class="stats-card card">
          <h3 class="card-title">สถิติการตรวจจับ</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-value">{{ eventCount }}</span>
              <span class="stat-label">เหตุการณ์ทั้งหมด</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ alertCount }}</span>
              <span class="stat-label">การแจ้งเตือน</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ cameras.length }}</span>
              <span class="stat-label">กล้องทั้งหมด</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{
                Object.values(activeMonitors).filter((v) => v).length
              }}</span>
              <span class="stat-label">กล้องที่ตรวจจับ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.monitor-view {
  padding-bottom: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.btn-icon {
  width: 16px;
  height: 16px;
  margin-right: 4px;
}

.no-camera {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.no-camera-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
}

.no-camera-icon {
  width: 4rem;
  height: 4rem;
  color: #d1d5db;
}

.dashboard {
  display: flex;
  gap: 1.5rem;
}

.main-content {
  flex: 3;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cameras-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.camera-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.camera-card.motion-detected {
  box-shadow: 0 0 0 3px #dc2626;
}

.camera-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: #f3f4f6;
}

.camera-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.camera-status {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
}

.camera-status.online {
  background-color: #d1fae5;
  color: #065f46;
}

.camera-status.offline {
  background-color: #f3f4f6;
  color: #6b7280;
}

.camera-status.connecting {
  background-color: #fff7ed;
  color: #9a3412;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.video-container {
  position: relative;
  width: 100%;
  height: 180px;
  background-color: #000;
}

.video-container video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.motion-alert {
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: rgba(220, 38, 38, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.camera-controls {
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.risk-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.risk-level {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.risk-low {
  background-color: #d1fae5;
  color: #065f46;
}

.risk-medium {
  background-color: #fff7ed;
  color: #9a3412;
}

.risk-high {
  background-color: #fee2e2;
  color: #b91c1c;
}

.risk-value {
  font-size: 0.875rem;
  color: #6b7280;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.log-entries {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background-color: white;
}

.log-entry {
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 1rem;
}

.log-entry:last-child {
  border-bottom: none;
}

.log-entry.alert {
  border-left: 3px solid #dc2626;
}

.log-entry.motion {
  border-left: 3px solid #f59e0b;
}

.log-entry.info {
  border-left: 3px solid #3b82f6;
}

.empty-log {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
}

.time-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-input {
  width: 100%;
  max-width: 120px;
}

.btn-save {
  margin-top: 1rem;
}

.settings-card,
.stats-card {
  margin-bottom: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.stat-item {
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 6px;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2563eb;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.camera-header-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.fullscreen-toggle {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.fullscreen-toggle:hover {
  background-color: rgba(0, 0, 0, 0.1);
  color: #1e40af;
}

.fullscreen-toggle svg {
  width: 16px;
  height: 16px;
}

.camera-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100vh;
  z-index: 1000;
  margin: 0;
  border-radius: 0;
  background-color: black;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.camera-fullscreen .camera-header {
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 12px 16px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1001;
}

.camera-fullscreen .camera-controls {
  background-color: rgba(0, 0, 0, 0.7);
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1001;
  padding: 12px 16px;
}

.camera-fullscreen .video-container {
  flex: 1;
  height: 100%;
}

.camera-fullscreen .video-container video {
  object-fit: contain;
  width: 100%;
  height: 100%;
}

.camera-hidden {
  display: none;
}

.hidden-when-fullscreen {
  display: none;
}

.fullscreen-mode {
  display: block;
}

/* ปรับหน้าจอโทรศัพท์ */
@media (max-width: 768px) {
  .dashboard {
    flex-direction: column;
  }

  .cameras-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
