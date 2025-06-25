<script setup>
import { RouterView, useRoute, RouterLink, useRouter } from 'vue-router'
import { computed, ref, watch, onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useNotificationStore } from './stores/notification'
import { useLeftNotificationStore } from './stores/leftNotification'
import LeftSideNotification from '@/components/common/LeftSideNotification.vue'
import NetworkStatus from '@/components/common/NetworkStatus.vue' // นำเข้าคอมโพเนนต์ใหม่

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const leftNotificationStore = useLeftNotificationStore()

const currentRoutePath = computed(() => route.path)
const notifications = computed(() => notificationStore.notifications)
const showNotification = ref(false)
const currentNotification = ref(null)

// ฟังก์ชันสำหรับออกจากระบบและนำทางกลับไปที่หน้า login
function handleLogout() {
  authStore.logout()
  router.push('/')
}

// แสดงการแจ้งเตือนเมื่อมีการแจ้งเตือนใหม่
function showLatestNotification() {
  if (notifications.value.length > 0) {
    currentNotification.value = notifications.value[0]
    showNotification.value = true

    // ซ่อนการแจ้งเตือนหลังจาก 5 วินาที
    setTimeout(() => {
      showNotification.value = false
    }, 5000)
  }
}

// เมื่อมีการล็อกอินสำเร็จให้แสดงข้อความแจ้งเตือนต้อนรับ
onMounted(() => {
  if (authStore.isLoggedIn) {
    setTimeout(() => {
      leftNotificationStore.addNotification({
        title: 'ยินดีต้อนรับ',
        message: `ยินดีต้อนรับกลับมา ${authStore.user?.name || 'คุณ'}`,
        type: 'success',
        duration: 4000,
      })
    }, 1000)
  }
})

// ทำให้การแจ้งเตือนปกติไปปรากฎทางซ้ายด้วย
watch(
  notifications,
  (newValue, oldValue) => {
    if (newValue.length > (oldValue?.length || 0)) {
      const latestNotification = newValue[0]

      leftNotificationStore.addNotification({
        title: latestNotification.title,
        message: latestNotification.message,
        type: latestNotification.type || 'info',
        duration: 5000,
      })

      showLatestNotification()
    }
  },
  { deep: true },
)
</script>

<template>
  <div class="app-container">
    <header v-if="authStore.isLoggedIn" class="app-header">
      <div class="app-logo">
        <RouterLink to="/dashboard" class="logo-link">V89 DETE-BED</RouterLink>
      </div>
      <nav class="app-nav">
        <RouterLink :to="'/dashboard'" :class="{ active: currentRoutePath === '/dashboard' }">
          แดชบอร์ด
        </RouterLink>
        <RouterLink :to="'/camera'" :class="{ active: currentRoutePath === '/camera' }">
          จัดการกล้อง
        </RouterLink>
        <RouterLink :to="'/monitor'" :class="{ active: currentRoutePath === '/monitor' }">
          มอนิเตอร์
        </RouterLink>
        <RouterLink :to="'/about'" :class="{ active: currentRoutePath === '/about' }">
          เกี่ยวกับ
        </RouterLink>
        <RouterLink
          :to="'/notification-example'"
          :class="{ active: currentRoutePath === '/notification-example' }"
        >
          ตัวอย่างแจ้งเตือน
        </RouterLink>
        <RouterLink
          :to="'/notification-settings'"
          :class="{ active: currentRoutePath === '/notification-settings' }"
        >
          ตั้งค่าแจ้งเตือน
        </RouterLink>
        <button type="button" @click="handleLogout" class="nav-logout-btn">ออกจากระบบ</button>
      </nav>
    </header>

    <!-- การแจ้งเตือนทางด้านซ้าย -->
    <LeftSideNotification v-if="authStore.isLoggedIn" />
    <NetworkStatus />
    <!-- เพิ่ม Network Status Monitor -->

    <main class="app-content">
      <RouterView />
    </main>

    <!-- แสดงการแจ้งเตือน -->
    <div v-if="showNotification && currentNotification" class="notification-toast">
      <div class="notification-header">
        <span class="notification-title">{{ currentNotification.title }}</span>
        <button @click="showNotification = false" class="close-btn">&times;</button>
      </div>
      <div class="notification-body">
        {{ currentNotification.message }}
      </div>
      <div class="notification-time">
        {{ new Date(currentNotification.timestamp).toLocaleTimeString() }}
      </div>
    </div>

    <footer class="app-footer">
      <div>
        © {{ new Date().getFullYear() }} V89 DETE-BED - ระบบตรวจจับความเคลื่อนไหวและแจ้งเตือน
      </div>
    </footer>
  </div>
</template>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

.app-header {
  background-color: #1e40af;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.app-logo {
  font-weight: 700;
  font-size: 1.5rem;
}

.logo-link {
  color: white;
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.logo-link:hover {
  opacity: 0.9;
  background-color: transparent; /* ป้องกันไม่ให้ได้รับสไตล์พื้นหลังจาก global styles */
}

.app-nav {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.app-nav a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 0;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.app-nav a:hover,
.app-nav a.active {
  color: white;
  border-bottom-color: white;
}

.nav-logout-btn {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  z-index: 1;
}

.nav-logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.app-content {
  flex: 1;
  width: 100%;
  max-width: 1400px; /* เพิ่มความกว้างสูงสุด */
  margin: 0 auto;
  padding: 2rem 1rem;
}

.app-footer {
  background-color: #f3f4f6;
  padding: 1.5rem;
  text-align: center;
  color: #6b7280;
  border-top: 1px solid #e5e7eb;
  font-size: 0.875rem;
}

.notification-toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 350px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  border-left: 4px solid #2563eb;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.notification-title {
  font-weight: 600;
  color: #1e40af;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #6b7280;
}

.notification-body {
  padding: 16px;
  color: #374151;
}

.notification-time {
  padding: 8px 16px;
  font-size: 0.75rem;
  color: #6b7280;
  text-align: right;
  background-color: #f8fafc;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 768px) {
  .app-header {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .app-nav {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .app-content {
    padding: 1rem 0.5rem;
  }

  .notification-toast {
    width: calc(100% - 40px);
    bottom: 10px;
    right: 10px;
    left: 10px;
  }
}
</style>
