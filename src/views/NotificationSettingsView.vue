<template>
  <div class="notification-settings">
    <h1 class="page-title">ตั้งค่าการแจ้งเตือน</h1>

    <div v-if="saveSuccess" class="alert alert-success">บันทึกการตั้งค่าเรียบร้อยแล้ว</div>

    <div class="settings-container">
      <div class="card">
        <h2 class="card-title">การตั้งค่าทั่วไป</h2>

        <div class="form-group form-checkbox">
          <input type="checkbox" id="notification-enabled" v-model="settings.enabled" />
          <label for="notification-enabled">เปิดใช้งานการแจ้งเตือน</label>
        </div>

        <div class="form-group">
          <label class="form-label">ช่วงเวลาแจ้งเตือน</label>
          <div class="time-range">
            <input
              type="time"
              v-model="settings.timeRange.start"
              class="form-input time-input"
              :disabled="!settings.enabled"
            />
            <span>ถึง</span>
            <input
              type="time"
              v-model="settings.timeRange.end"
              class="form-input time-input"
              :disabled="!settings.enabled"
            />
          </div>
          <small class="text-muted">กำหนดช่วงเวลาที่ต้องการรับการแจ้งเตือน</small>
        </div>
      </div>

      <div class="card">
        <h2 class="card-title">การยืนยันและการแจ้งเตือนซ้ำ</h2>

        <div class="form-group form-checkbox">
          <input
            type="checkbox"
            id="require-acknowledgment"
            v-model="settings.requireAcknowledgment"
          />
          <label for="require-acknowledgment">ต้องการการยืนยันรับทราบ</label>
          <small class="text-muted block-help">
            เมื่อเปิดใช้งาน การแจ้งเตือนที่สำคัญจะต้องได้รับการยืนยันรับทราบ
            มิฉะนั้นจะมีการแจ้งเตือนซ้ำ
          </small>
        </div>

        <div class="form-group">
          <label class="form-label">ระยะเวลาในการแจ้งเตือนซ้ำ (นาที)</label>
          <input
            type="number"
            v-model="settings.reminderInterval"
            class="form-input"
            min="1"
            max="60"
            :disabled="!settings.requireAcknowledgment"
          />
          <small class="text-muted">ระยะเวลาก่อนที่จะแจ้งเตือนซ้ำหากไม่มีการยืนยัน</small>
        </div>

        <div class="form-group">
          <label class="form-label">จำนวนครั้งในการแจ้งเตือนซ้ำ</label>
          <input
            type="number"
            v-model="settings.maxReminders"
            class="form-input"
            min="1"
            max="10"
            :disabled="!settings.requireAcknowledgment"
          />
        </div>
      </div>

      <div class="card">
        <h2 class="card-title">ประเภทการแจ้งเตือน</h2>

        <div class="notification-types">
          <div v-for="type in notificationTypes" :key="type.value" class="form-group form-checkbox">
            <input
              type="checkbox"
              :id="'type-' + type.value"
              v-model="settings.enabledTypes[type.value]"
              :disabled="!settings.enabled"
            />
            <label :for="'type-' + type.value">{{ type.label }}</label>
          </div>
        </div>
      </div>

      <div class="card">
        <h2 class="card-title">ระดับความเสี่ยงสำหรับการแจ้งเตือน</h2>

        <div class="form-group">
          <label class="form-label">แจ้งเตือนเมื่อระดับความเสี่ยงมากกว่า</label>
          <div class="risk-slider-container">
            <input
              type="range"
              v-model="settings.minRiskLevel"
              min="1"
              max="10"
              class="risk-slider"
              :disabled="!settings.enabled"
            />
            <div class="risk-value">{{ settings.minRiskLevel }}/10</div>
          </div>
          <div class="risk-labels">
            <span>ต่ำ</span>
            <span>ปานกลาง</span>
            <span>สูง</span>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button @click="saveSettings" class="btn btn-primary">บันทึกการตั้งค่า</button>
        <button @click="resetSettings" class="btn btn-secondary">รีเซ็ตเป็นค่าเริ่มต้น</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'

const notificationStore = useNotificationStore()

const saveSuccess = ref(false)
const settings = ref({
  enabled: true,
  timeRange: {
    start: '00:00',
    end: '23:59',
  },
  requireAcknowledgment: true,
  reminderInterval: 2,
  maxReminders: 3,
  enabledTypes: {
    motion: true,
    alert: true,
    system: true,
    info: false,
  },
  minRiskLevel: 7,
})

const notificationTypes = [
  { value: 'motion', label: 'ตรวจพบการเคลื่อนไหว' },
  { value: 'alert', label: 'การแจ้งเตือนความปลอดภัย' },
  { value: 'system', label: 'ระบบ' },
  { value: 'info', label: 'ข้อมูลทั่วไป' },
]

// โหลดการตั้งค่าจาก localStorage
onMounted(() => {
  const savedSettings = localStorage.getItem('notificationSettings')
  if (savedSettings) {
    try {
      settings.value = JSON.parse(savedSettings)
    } catch (e) {
      console.error('Error parsing notification settings:', e)
    }
  }

  // อัปเดต store ด้วยค่าที่โหลด
  if (settings.value.reminderInterval) {
    notificationStore.setReminderInterval(settings.value.reminderInterval * 60000)
  }
})

// บันทึกการตั้งค่าลง localStorage
function saveSettings() {
  localStorage.setItem('notificationSettings', JSON.stringify(settings.value))

  // อัปเดต store
  notificationStore.setReminderInterval(settings.value.reminderInterval * 60000)

  // แสดงข้อความบันทึกสำเร็จ
  saveSuccess.value = true
  setTimeout(() => {
    saveSuccess.value = false
  }, 3000)
}

// รีเซ็ตการตั้งค่าเป็นค่าเริ่มต้น
function resetSettings() {
  settings.value = {
    enabled: true,
    timeRange: {
      start: '00:00',
      end: '23:59',
    },
    requireAcknowledgment: true,
    reminderInterval: 2,
    maxReminders: 3,
    enabledTypes: {
      motion: true,
      alert: true,
      system: true,
      info: false,
    },
    minRiskLevel: 7,
  }
}
</script>

<style scoped>
.notification-settings {
  padding-bottom: 2rem;
}

.settings-container {
  max-width: 800px;
}

.block-help {
  display: block;
  margin-top: 4px;
  margin-left: 24px;
}

.text-muted {
  color: #6b7280;
  font-size: 0.875rem;
}

.notification-types {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.risk-slider-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

.risk-slider {
  flex: 1;
  height: 5px;
  background: linear-gradient(to right, #10b981, #f59e0b, #ef4444);
  border-radius: 5px;
  outline: none;
  -webkit-appearance: none;
}

.risk-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}

.risk-value {
  width: 50px;
  text-align: right;
  font-weight: 600;
}

.risk-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
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

@media (max-width: 768px) {
  .notification-types {
    grid-template-columns: 1fr;
  }
}
</style>
