<template>
  <div>
    <!-- Navbar -->
    <nav class="navbar">
      <div class="nav-center">
        <ul class="nav-links">
          <li><router-link to="/home">Home</router-link></li>
          <li><router-link to="/collection">Products</router-link></li>
          <li><router-link to="/events">Events</router-link></li>
          <li><router-link to="/about">About</router-link></li>
          <li><router-link to="/contact">Contact</router-link></li>
        </ul>
        <div class="nav-icons">
          <router-link to="/favorites" class="icon-btn" title="Favorites">
            <i class="fas fa-heart"></i>
          </router-link>
          <router-link to="/cart" class="icon-btn" title="Cart">
            <i class="fas fa-bag-shopping"></i>
          </router-link>
          <div class="dropdown">
            <button class="icon-btnn" @click="toggleDropdown">
              <i class="fas fa-user"></i>
            </button>
            <div v-if="showDropdown" class="dropdown-menu">
              <router-link to="/profile" class="dropdown-item" @click="showDropdown = false">Profile</router-link>
              <router-link to="/order" class="dropdown-item" @click="showDropdown=false">My order</router-link>
              <button @click="handleLogout" class="dropdown-itemmm">Log Out</button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Profile -->
    <div class="profile-page">
      <h1 class="profile-title">My Profile</h1>

      <!-- Profile Picture + Name -->
      <div class="profile-picture-row mb-6">
        <div class="profile-picture-wrapper" @click="openFileInput">
          <img v-if="photoURL" :src="photoURL" alt="Profile" class="profile-picture-img" />
          <span v-else class="profile-picture-placeholder">No Image</span>
          <input ref="fileInput" type="file" accept="image/*" @change="onFileChange" style="display: none" />
        </div>
        <div>
          <p class="profile-header-name">{{ fullName || 'Your Name' }}</p>
          <p class="profile-header-email">{{ emailDisplay }}</p>
        </div>
      </div>

      <!-- Loading / Error -->
      <div v-if="loading" class="profile-loading">Loading profile...</div>
      <div v-if="error" class="profile-error">{{ error }}</div>

      <!-- Profile Form -->
      <form v-if="!loading" @submit.prevent="saveProfile" class="profile-form">
        <div class="form-group">
          <label class="label">Full Name</label>
          <input type="text" class="input" v-model="fullName" placeholder="First Last" />
        </div>

        <div class="form-group">
          <label class="label">Age</label>
          <input type="number" class="input" v-model.number="age" min="0" />
        </div>

        <div class="form-group">
          <label class="label">Birthdate</label>
          <input type="date" class="input" v-model="birthdate" />
        </div>

        <div class="form-group">
          <label class="label">Contact Number</label>
          <input type="text" class="input" v-model="contactNumber" placeholder="09xxxxxxxxx" />
        </div>

        <div class="form-group">
          <label class="label">Address</label>
          <input type="text" class="input" v-model="address" placeholder="Your Address" />
          <button type="button" class="btn-save mt-2" @click="showMapOverlay = true">Use Current Location</button>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-save" :disabled="saving">
            <span v-if="!saving">Save Profile</span>
            <span v-else>Saving...</span>
          </button>
        </div>
      </form>

      <!-- Map Overlay -->
      <div v-if="showMapOverlay" class="map-overlay">
        <div class="map-container">
          <button class="btn-close" @click="cancelLocation">✖</button>
          <div id="map" class="map-div"></div>
          <button class="btn-confirm" @click="confirmLocation">Confirm Location</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from "vue"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useLogout } from "./Scripts/homescript.js"

const auth = getAuth()
const db = getFirestore()
const userId = ref(null)
const loading = ref(true)
const saving = ref(false)
const error = ref(null)
const firstName = ref("")
const lastName = ref("")
const age = ref(null)
const birthdate = ref("")
const contactNumber = ref("")
const address = ref("")
const lat = ref(null)
const lng = ref(null)
const photoURL = ref("")
const selectedFile = ref(null)
const userEmail = ref("")
const showMapOverlay = ref(false)

// Navbar logout / dropdown
const { logout, showDropdown, toggleDropdown } = useLogout()
const handleLogout = () => { logout(); showDropdown.value = false }

// Computed
const fullName = computed({
  get() {
    if (firstName.value || lastName.value) return `${firstName.value} ${lastName.value}`.trim()
    return ""
  },
  set(value) {
    const parts = value.trim().split(" ")
    firstName.value = parts[0] || ""
    lastName.value = parts.slice(1).join(" ") || ""
  }
})
const emailDisplay = computed(() => userEmail.value || "No email")

// Profile Picture Upload
const fileInput = ref(null)
const openFileInput = () => fileInput.value.click()
const onFileChange = event => {
  const file = event.target.files?.[0]
  if (!file) return
  selectedFile.value = file
  const reader = new FileReader()
  reader.onload = e => (photoURL.value = e.target.result)
  reader.readAsDataURL(file)
}

// Leaflet Map
let map = null
let marker = null
watch(showMapOverlay, async (val) => {
  if (val) {
    await nextTick()
    if (!map) {
      map = L.map('map').setView([14.5995, 120.9842], 13)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map)
      map.on('click', e => {
        lat.value = e.latlng.lat
        lng.value = e.latlng.lng
        if (marker) marker.remove()
        marker = L.marker([lat.value, lng.value]).addTo(map)
      })
      // Try to get current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
          lat.value = pos.coords.latitude
          lng.value = pos.coords.longitude
          map.setView([lat.value, lng.value], 15)
          if (marker) marker.remove()
          marker = L.marker([lat.value, lng.value]).addTo(map)
        })
      }
    }
    map.invalidateSize()
  }
})

const cancelLocation = () => { showMapOverlay.value = false }

const confirmLocation = async () => {
  if (lat.value && lng.value) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat.value}&lon=${lng.value}`)
      const data = await res.json()
      address.value = data.display_name || `${lat.value}, ${lng.value}`
    } catch (e) {
      console.error("Failed to get address:", e)
      address.value = `${lat.value}, ${lng.value}`
    }
  }
  showMapOverlay.value = false
}

// Save Profile
const uploadToPostimages = async file => {
  try {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload", "Upload")
    const res = await fetch("https://api.postimages.org/1/upload", { method: "POST", body: formData })
    const data = await res.json()
    return data.url
  } catch { return null }
}
const saveProfile = async () => {
  if (!userId.value) return error.value = "No user is logged in."
  saving.value = true
  error.value = null
  try {
    let newPhotoURL = photoURL.value
    if (selectedFile.value) {
      const url = await uploadToPostimages(selectedFile.value)
      if (url) newPhotoURL = url
    }
    const userDocRef = doc(db, 'users', userId.value)
    await setDoc(userDocRef, {
      firstName: firstName.value,
      lastName: lastName.value,
      age: age.value,
      birthdate: birthdate.value,
      contactNumber: contactNumber.value,
      address: address.value,
      latitude: lat.value,
      longitude: lng.value,
      photoURL: newPhotoURL,
      email: userEmail.value
    }, { merge: true })
    photoURL.value = newPhotoURL
  } catch (e) {
    console.error("Failed to save profile:", e)
    error.value = "Failed to save profile."
  } finally {
    saving.value = false
    selectedFile.value = null
  }
}

// Load Profile
const loadProfile = async uid => {
  loading.value = true
  error.value = null
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    if (snap.exists()) {
      const data = snap.data()
      firstName.value = data.firstName || ""
      lastName.value = data.lastName || ""
      age.value = data.age || null
      birthdate.value = data.birthdate || ""
      contactNumber.value = data.contactNumber || ""
      address.value = data.address || ""
      lat.value = data.latitude || null
      lng.value = data.longitude || null
      photoURL.value = data.photoURL || ""
      userEmail.value = data.email || auth.currentUser?.email || ""
    }
  } catch (e) {
    console.error("Failed to load profile:", e)
    error.value = "Failed to load profile."
  } finally {
    loading.value = false
  }
}

// Auth
onMounted(() => {
  onAuthStateChanged(auth, user => {
    if (user) {
      userId.value = user.uid
      userEmail.value = user.email || ""
      loadProfile(user.uid)
    } else {
      userId.value = null
      loading.value = false
      error.value = "You must be logged in to view your profile."
    }
  })
})
</script>

<style src="./Styles/profile.css"></style>
