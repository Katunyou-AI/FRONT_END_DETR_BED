<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCameraStore } from '@/stores/camera'
import { useAuthStore } from '@/stores/auth'
import IconCamera from '@/components/icons/IconCamera.vue'
import SearchFilter from '@/components/common/SearchFilter.vue' // นำเข้าคอมโพเนนต์ค้นหา

const cameraStore = useCameraStore()
const authStore = useAuthStore()
const router = useRouter()

const newCamera = ref({
  id: '',
  name: '',
  url: '',
  status: 'offline',
})
const message = ref('')
const messageType = ref('')
const searchQuery = ref('')

// เพิ่ม state สำหรับการแก้ไขกล้อง
const isEditing = ref(false)
const editingCamera = ref({
  id: '',
  name: '',
  url: '',
  status: 'offline',
})
const showEditModal = ref(false)

// Computed properties
const allCameras = computed(() => cameraStore.cameras)
const cameras = computed(() => {
  if (!searchQuery.value) return allCameras.value

  return allCameras.value.filter(
    (camera) =>
      camera.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      camera.url.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

onMounted(() => {
  // Redirect if not logged in
  if (!authStore.isLoggedIn) {
    router.push('/')
    return
  }

  // Load cameras if needed
  if (allCameras.value.length === 0) {
    cameraStore.loadCameras()
  }
})

function addCamera() {
  if (!newCamera.value.name || !newCamera.value.url) {
    message.value = 'กรุณากรอกชื่อกล้องและ URL ให้ครบถ้วน'
    messageType.value = 'danger'
    return
  }

  try {
    const camera = {
      id: Date.now().toString(),
      name: newCamera.value.name,
      url: newCamera.value.url,
      status: 'offline',
      active: true,
    }

    cameraStore.addCamera(camera)
    message.value = `เพิ่มกล้อง ${camera.name} เรียบร้อยแล้ว`
    messageType.value = 'success'

    // Reset form
    newCamera.value = {
      id: '',
      name: '',
      url: '',
      status: 'offline',
    }

    setTimeout(() => {
      router.push('/monitor')
    }, 1500)
  } catch (err) {
    message.value = 'เกิดข้อผิดพลาดในการเพิ่มกล้อง'
    messageType.value = 'danger'
  }

  setTimeout(() => {
    message.value = ''
  }, 3000)
}

function removeCamera(camera) {
  if (confirm(`ต้องการลบกล้อง ${camera.name} ใช่หรือไม่?`)) {
    cameraStore.removeCamera(camera)
    message.value = `ลบกล้อง ${camera.name} เรียบร้อยแล้ว`
    messageType.value = 'info'

    setTimeout(() => {
      message.value = ''
    }, 3000)
  }
}

// เพิ่มฟังก์ชันเริ่มแก้ไขกล้อง
function startEditCamera(camera) {
  // คัดลอกข้อมูลกล้องที่ต้องการแก้ไข
  editingCamera.value = { ...camera }
  isEditing.value = true
  showEditModal.value = true
}

// ฟังก์ชันบันทึกการแก้ไขกล้อง
function saveEditCamera() {
  if (!editingCamera.value.name || !editingCamera.value.url) {
    message.value = 'กรุณากรอกชื่อกล้องและ URL ให้ครบถ้วน'
    messageType.value = 'danger'
    return
  }

  try {
    // อัพเดทกล้องใน store
    cameraStore.updateCamera(editingCamera.value.id, editingCamera.value)
    message.value = `อัพเดทกล้อง ${editingCamera.value.name} เรียบร้อยแล้ว`
    messageType.value = 'success'

    // ปิด modal
    showEditModal.value = false
    isEditing.value = false

    setTimeout(() => {
      message.value = ''
    }, 3000)
  } catch (err) {
    message.value = 'เกิดข้อผิดพลาดในการอัพเดทกล้อง'
    messageType.value = 'danger'
  }
}

// ฟังก์ชันยกเลิกการแก้ไข
function cancelEdit() {
  showEditModal.value = false
  isEditing.value = false
}

function goToMonitor() {
  router.push('/monitor')
}

function handleSearch(query) {
  searchQuery.value = query
}

function clearSearch() {
  searchQuery.value = ''
}
</script>

<template>
  <div class="camera-management">
    <div class="page-header">
      <h1 class="page-title">จัดการกล้อง</h1>
      <button @click="goToMonitor" class="btn btn-secondary">ไปยังหน้ามอนิเตอร์</button>
    </div>

    <div v-if="message" :class="`alert alert-${messageType} notification`">
      {{ message }}
    </div>

    <div class="container">
      <div class="row">
        <!-- ส่วนเพิ่มกล้องใหม่ -->
        <div class="col-md-6">
          <div class="camera-form card">
            <h2 class="card-title">เพิ่มกล้องใหม่</h2>

            <form @submit.prevent="addCamera">
              <div class="form-group">
                <label for="camera-name" class="form-label"
                  >ชื่อกล้อง <span class="required">*</span></label
                >
                <input
                  type="text"
                  id="camera-name"
                  v-model="newCamera.name"
                  class="form-input"
                  placeholder="เช่น กล้องหน้าบ้าน, กล้องหลังบ้าน"
                  autofocus
                />
              </div>

              <div class="form-group">
                <label for="camera-url" class="form-label"
                  >URL การเชื่อมต่อ <span class="required">*</span></label
                >
                <input
                  type="text"
                  id="camera-url"
                  v-model="newCamera.url"
                  class="form-input"
                  placeholder="เช่น rtsp://username:password@ip:port/path"
                />
                <small class="form-help">รองรับ RTSP, RTMP, HLS หรือ URL ของไฟล์วิดีโอ</small>
              </div>

              <div class="form-buttons">
                <button type="submit" class="btn btn-primary">บันทึกและไปที่มอนิเตอร์</button>
              </div>
            </form>
          </div>
        </div>

        <!-- ส่วนแสดงกล้องปัจจุบัน -->
        <div class="col-md-6">
          <div class="card">
            <h2 class="card-title">กล้องในระบบ</h2>

            <!-- เพิ่มค้นหา -->
            <SearchFilter placeholder="ค้นหากล้อง..." @search="handleSearch" @clear="clearSearch" />

            <div v-if="cameras.length === 0" class="empty-state">
              <IconCamera class="empty-icon" />
              <p>
                {{ searchQuery ? 'ไม่พบกล้องที่ค้นหา' : 'ยังไม่มีกล้องในระบบ กรุณาเพิ่มกล้องใหม่' }}
              </p>
            </div>

            <div v-else class="camera-list">
              <div v-for="camera in cameras" :key="camera.id" class="camera-item">
                <div class="camera-info">
                  <h3 class="camera-name">{{ camera.name }}</h3>
                  <p class="camera-url">{{ camera.url }}</p>
                </div>
                <div class="camera-actions">
                  <!-- เพิ่มปุ่มแก้ไข -->
                  <button class="btn btn-secondary btn-sm" @click="startEditCamera(camera)">
                    แก้ไข
                  </button>
                  <button class="btn btn-danger btn-sm" @click="removeCamera(camera)">ลบ</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal สำหรับแก้ไขกล้อง -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>แก้ไขกล้อง</h3>
          <button @click="cancelEdit" class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveEditCamera">
            <div class="form-group">
              <label for="edit-camera-name" class="form-label"
                >ชื่อกล้อง <span class="required">*</span></label
              >
              <input
                type="text"
                id="edit-camera-name"
                v-model="editingCamera.name"
                class="form-input"
                placeholder="เช่น กล้องหน้าบ้าน, กล้องหลังบ้าน"
                autofocus
              />
            </div>

            <div class="form-group">
              <label for="edit-camera-url" class="form-label"
                >URL การเชื่อมต่อ <span class="required">*</span></label
              >
              <input
                type="text"
                id="edit-camera-url"
                v-model="editingCamera.url"
                class="form-input"
                placeholder="เช่น rtsp://username:password@ip:port/path"
              />
              <small class="form-help">รองรับ RTSP, RTMP, HLS หรือ URL ของไฟล์วิดีโอ</small>
            </div>

            <div class="form-actions">
              <button type="button" @click="cancelEdit" class="btn btn-secondary">ยกเลิก</button>
              <button type="submit" class="btn btn-primary">บันทึกการเปลี่ยนแปลง</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.camera-management {
  padding-bottom: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.container {
  width: 100%;
  margin: 0 auto;
}

.row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -15px;
}

.col-md-6 {
  width: 100%;
  padding: 0 15px;
}

@media (min-width: 768px) {
  .col-md-6 {
    width: 50%;
  }
}

.notification {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.required {
  color: #dc2626;
}

.empty-state {
  text-align: center;
  padding: 2rem 0;
  color: #6b7280;
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.camera-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.camera-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: #f9fafb;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.camera-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.camera-name {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.camera-url {
  font-size: 0.875rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
}

.form-buttons {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
}

.form-help {
  display: block;
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.camera-card {
  transition: all 0.2s ease;
  border: 2px solid transparent;
  position: relative;
  z-index: 0;
}

.camera-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.camera-selected {
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.camera-actions {
  display: flex;
  gap: 8px;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: modal-appear 0.3s ease-out;
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
}

.modal-body {
  padding: 1.5rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .control-panel {
    display: flex;
    width: 100%;
    justify-content: space-between;
  }

  .camera-card:hover {
    transform: none;
  }
}
</style>
