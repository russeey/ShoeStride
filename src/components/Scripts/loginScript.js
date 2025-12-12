// src/Scripts/loginScript.js
import { ref, computed } from 'vue'
import { auth } from '../../firebase'
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth'
import router from '../../router'

// Overlay
export const showOverlay = ref(false)
export const overlayTitle = ref('')
export const openOverlay = (title) => { overlayTitle.value = title; showOverlay.value = true }
export const closeOverlay = () => (showOverlay.value = false)

// Fields
export const showPassword = ref(false)
export const passwordFieldType = computed(() => showPassword.value ? 'text' : 'password')
export const togglePassword = () => (showPassword.value = !showPassword.value)
export const errorMessage = ref('')

// Firebase email/password login
export const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password)
    errorMessage.value = ''
    return true
  } catch (err) {
    errorMessage.value = 'Invalid email or password'
    console.error(err)
    return false
  }
}

// Google login
export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider()
  try {
    const result = await signInWithPopup(auth, provider)
    console.log('Google user:', result.user)
    errorMessage.value = ''
    return true
  } catch (err) {
    errorMessage.value = 'Google login failed: ' + err.message
    console.error(err)
    return false
  }
}

// Facebook login
export const loginWithFacebook = async () => {
  const provider = new FacebookAuthProvider()
  try {
    const result = await signInWithPopup(auth, provider)
    console.log('Facebook user:', result.user)
    errorMessage.value = ''
    return true
  } catch (err) {
    errorMessage.value = 'Facebook login failed: ' + err.message
    console.error(err)
    return false
  }
}
