<template>
  <div class="dashboard-view">
    <h1 class="page-title">แดชบอร์ด</h1>

    <div class="summary-cards">
      <div class="summary-card">
        <div class="summary-icon camera-icon">
          <IconCamera />
        </div>
        <div class="summary-content">
          <div class="summary-value">{{ cameraStore.cameras.length }}</div>
          <div class="summary-label">กล้องทั้งหมด</div>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon alert-icon">
          <IconAlert />
        </div>
        <div class="summary-content">
          <div class="summary-value">{{ alertCount }}</div>
          <div class="summary-label">การแจ้งเตือนวันนี้</div>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon motion-icon">
          <IconMotion />
        </div>
        <div class="summary-content">
          <div class="summary-value">{{ motionCount }}</div>
          <div class="summary-label">ตรวจพบการเคลื่อนไหว</div>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="dashboard-card lg">
        <h2 class="card-title">กล้องที่กำลังใช้งาน</h2>
        <div class="active-cameras">
          <div v-for="camera in activeCameras" :key="camera.id" class="active-camera-item">
            <div class="camera-name">{{ camera.name }}</div>
            <div class="camera-status" :class="camera.status">{{ camera.status }}</div>
          </div>
          <div v-if="activeCameras.length === 0" class="empty-state">
            ยังไม่มีกล้องที่กำลังใช้งาน
          </div>
        </div>
      </div>

      <div class="dashboard-card">
        <h2 class="card-title">การแจ้งเตือนล่าสุด</h2>
        <div class="recent-alerts">
          <div v-for="(alert, index) in recentAlerts" :key="index" class="alert-item">
            <div class="alert-time">{{ alert.time }}</div>
            <div class="alert-info">
              <div class="alert-source">{{ alert.source }}</div>
              <div class="alert-message">{{ alert.message }}</div>
            </div>
          </div>
          <div v-if="recentAlerts.length === 0" class="empty-state">ยังไม่มีการแจ้งเตือน</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCameraStore } from '@/stores/camera'
import IconCamera from '@/components/icons/IconCamera.vue'
import IconAlert from '@/components/icons/IconAlert.vue'
import IconMotion from '@/components/icons/IconMotion.vue'

const cameraStore = useCameraStore()
const alertCount = ref(12) // ในระบบจริง ควรดึงมาจาก store
const motionCount = ref(48) // ในระบบจริง ควรดึงมาจาก store

// จำลองข้อมูลสำหรับการแสดงผล
const activeCameras = computed(() => {
  return cameraStore.cameras.filter((camera) => camera.status === 'online')
})

const recentAlerts = ref([
  {
    time: '12:34',
    source: 'กล้องหน้าบ้าน',
    message: 'ตรวจพบการเคลื่อนไหว (ระดับความเสี่ยง: 8/10)',
  },
  {
    time: '11:20',
    source: 'กล้องหลังบ้าน',
    message: 'ตรวจพบการเคลื่อนไหว (ระดับความเสี่ยง: 7/10)',
  },
  {
    time: '09:45',
    source: 'กล้องหน้าบ้าน',
    message: 'ตรวจพบการเคลื่อนไหว (ระดับความเสี่ยง: 9/10)',
  },
])

onMounted(() => {
  cameraStore.loadCameras()
})
</script>

<style scoped>
.dashboard-view {
  padding-bottom: 2rem;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
  margin-bottom: 2rem;
}

.summary-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
  display: flex;
  align-items: center;
}

.summary-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
}

.summary-icon svg {
  width: 24px;
  height: 24px;
  color: white;
}

.camera-icon {
  background-color: #3b82f6;
}

.alert-icon {
  background-color: #ef4444;
}

.motion-icon {
  background-color: #f59e0b;
}

.summary-content {
  flex: 1;
}

.summary-value {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
  color: #111827;
}

.summary-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 1.5rem;
}

.dashboard-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
}

.dashboard-card.lg {
  grid-column: span 1;
}

.active-cameras {
  margin-top: 1rem;
}

.active-camera-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.active-camera-item:last-child {
  border-bottom: none;
}

.camera-status {
  font-size: 0.875rem;
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

.recent-alerts {
  margin-top: 1rem;
}

.alert-item {
  display: flex;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.alert-item:last-child {
  border-bottom: none;
}

.alert-time {
  font-size: 0.875rem;
  color: #6b7280;
  width: 50px;
}

.alert-info {
  flex: 1;
}

.alert-source {
  font-weight: 500;
}

.alert-message {
  font-size: 0.875rem;
  color: #4b5563;
}

.empty-state {
  padding: 2rem 0;
  text-align: center;
  color: #9ca3af;
  font-style: italic;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-card.lg {
    grid-column: span 1;
  }
}
</style>
