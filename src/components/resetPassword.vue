<template>
  <div class="reset-password">
    <h2>Reset Your Password</h2>
    <form @submit.prevent="resetPassword">
      <input type="password" v-model="newPassword" placeholder="New Password" required />
      <input type="password" v-model="confirmPassword" placeholder="Confirm Password" required />
      <button type="submit">Reset Password</button>
    </form>
    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const token = route.query.token
const newPassword = ref('')
const confirmPassword = ref('')
const message = ref('')

const resetPassword = () => {
  if (newPassword.value !== confirmPassword.value) {
    message.value = "Passwords do not match!"
    return
  }

  console.log(`Resetting password with token: ${token}`)
  message.value = "Password has been reset successfully!"

  setTimeout(() => {
    router.push('/login')
  }, 2000)
}
</script>

<style scoped>
.message {
  margin-top: 1rem;
  color: green;
}
</style>
