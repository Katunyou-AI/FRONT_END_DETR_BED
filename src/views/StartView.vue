<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import IconCamera from '@/components/icons/IconCamera.vue'
import IconAlert from '@/components/icons/IconAlert.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'

const username = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()
const authStore = useAuthStore()

const isLoading = computed(() => authStore.isLoading)
const authError = computed(() => authStore.error)

async function handleLogin() {
  error.value = ''
  if (!username.value || !password.value) {
    error.value = 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน'
    return
  }

  try {
    await authStore.login(username.value, password.value)
    router.push('/camera')
  } catch (err) {
    error.value = err || 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง'
  }
}
</script>

<template>
  <div class="start-container">
    <div class="left-section">
      <div class="brand-container">
        <h1 class="main-title">V89 DETE-BED</h1>
        <p class="subtitle">ระบบตรวจจับความเคลื่อนไหวและแจ้งเตือนอัจฉริยะ</p>
      </div>

      <div class="features-grid">
        <div class="feature-card">
          <IconCamera class="feature-icon" />
          <div class="feature-content">
            <h3>การจัดการกล้องที่ยืดหยุ่น</h3>
            <p>เชื่อมต่อและจัดการกล้องได้หลากหลาย สามารถเพิ่ม ลบ และตั้งค่าได้ตามต้องการ</p>
          </div>
        </div>

        <div class="feature-card">
          <IconAlert class="feature-icon" />
          <div class="feature-content">
            <h3>การแจ้งเตือนอัตโนมัติ</h3>
            <p>รับการแจ้งเตือนทันทีเมื่อตรวจพบความเคลื่อนไหวตามเงื่อนไขที่ตั้งไว้</p>
          </div>
        </div>
      </div>
    </div>

    <div class="right-section">
      <div class="login-box">
        <h2>เข้าสู่ระบบ</h2>

        <ErrorMessage v-if="error" type="error" :message="error" />

        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="username">ชื่อผู้ใช้</label>
            <input
              type="text"
              id="username"
              v-model="username"
              placeholder="กรอกชื่อผู้ใช้"
              autocomplete="username"
              autofocus
              :disabled="isLoading"
            />
          </div>

          <div class="form-group">
            <label for="password">รหัสผ่าน</label>
            <input
              type="password"
              id="password"
              v-model="password"
              placeholder="กรอกรหัสผ่าน"
              autocomplete="current-password"
              :disabled="isLoading"
            />
          </div>

          <button type="submit" class="login-button" :disabled="isLoading">
            <span v-if="isLoading">กำลังดำเนินการ...</span>
            <span v-else>เข้าสู่ระบบ</span>
          </button>
        </form>

        <div v-if="isLoading" class="login-loading">
          <LoadingSpinner message="กำลังดำเนินการเข้าสู่ระบบ..." />
        </div>

        <div class="demo-info">
          <div class="info-header">ข้อมูลสำหรับทดสอบ</div>
          <div class="info-credentials">
            <div><span>ชื่อผู้ใช้:</span> <strong>admin</strong></div>
            <div><span>รหัสผ่าน:</span> <strong>admin123</strong></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.start-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: calc(100vh - 4rem);
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}

.left-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-right: 2rem;
}

.brand-container {
  margin-bottom: 2rem;
}

.main-title {
  font-size: 3rem;
  font-weight: 700;
  color: #1e40af;
  margin-bottom: 0.5rem;
  letter-spacing: -1px;
}

.subtitle {
  font-size: 1.25rem;
  color: #4b5563;
  line-height: 1.5;
}

.features-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-top: 2rem;
}

.feature-card {
  display: flex;
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: #2563eb;
  margin-right: 1rem;
  flex-shrink: 0;
}

.feature-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.feature-content p {
  color: #6b7280;
  font-size: 0.95rem;
}

.right-section {
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-box {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.login-box h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #111827;
  text-align: center;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #374151;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.15s ease-in-out;
}

.form-group input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.login-button {
  width: 100%;
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition:
    background-color 0.15s ease-in-out,
    transform 0.2s ease;
}

.login-button:hover {
  background-color: #1d4ed8;
  transform: translateY(-2px);
}

.error-message {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.info-header {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.info-credentials {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.info-credentials span {
  color: #4b5563;
}

.login-loading {
  margin-top: 1rem;
  padding: 0.5rem;
  text-align: center;
}

@media (max-width: 768px) {
  .start-container {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 1rem;
  }

  .left-section {
    padding-right: 0;
    text-align: center;
    order: 1;
  }

  .right-section {
    order: 0;
  }

  .login-box {
    max-width: 100%;
  }

  .features-grid {
    gap: 1rem;
  }

  .feature-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .feature-icon {
    margin-right: 0;
    margin-bottom: 1rem;
  }

  .main-title {
    font-size: 2.25rem;
  }

  .info-credentials {
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }
}
</style>
