<template>
  <div class="loading-container" :class="{ overlay: overlay }">
    <div class="spinner">
      <div class="bounce1"></div>
      <div class="bounce2"></div>
      <div class="bounce3"></div>
    </div>
    <div v-if="message" class="loading-message">{{ message }}</div>
  </div>
</template>

<script setup>
defineProps({
  overlay: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: 'กำลังโหลดข้อมูล...',
  },
})
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.loading-container.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  z-index: 1000;
}

.loading-message {
  margin-top: 1rem;
  color: #1e40af;
  font-weight: 500;
}

.spinner {
  display: flex;
  gap: 4px;
}

.spinner > div {
  width: 12px;
  height: 12px;
  background-color: #2563eb;
  border-radius: 100%;
  display: inline-block;
  animation: bounce 1.4s infinite ease-in-out both;
}

.spinner .bounce1 {
  animation-delay: -0.32s;
}

.spinner .bounce2 {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}
</style>
