<template>
  <div>
    <!-- NAVBAR -->
    <nav class="navbar">
      <div class="nav-center">

        <ul class="nav-links">
          <li><router-link to="/home">Home</router-link></li>
          <li><router-link to="/collection">Products</router-link></li>
          <li><router-link to="/events">Events</router-link></li>
          <li><router-link to="/about">About</router-link></li>
          <li><router-link to="/contact">Contact</router-link></li>
        </ul>

        <!-- Icons -->
        <div class="nav-icons">
          <router-link to="/favorites" class="icon-btn" title="Favorites">
            <i class="fas fa-heart"></i>
          </router-link>

          <router-link to="/cart" class="icon-btn" title="Cart">
            <i class="fas fa-bag-shopping"></i>
          </router-link>

          <!-- User Dropdown -->
          <div class="dropdown">
            <button class="icon-btnn" @click="toggleDropdown">
              <i class="fas fa-user"></i>
            </button>

            <div v-if="showDropdown" class="dropdown-menu">
              <router-link
                to="/profile"
                class="dropdown-item"
                @click="showDropdown = false">
                Profile
              </router-link>

              <router-link to="/order" class="dropdown-item" @click="showDropdown=false">My order</router-link>

              <router-link
                to="/application"
                class="dropdown-item"
                @click="showDropdown = false">
                Unlocked Privileges
              </router-link>

              <button @click="handleLogout" class="dropdown-itemmm">
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- APPLICATION FORM -->
    <div class="application-container">
      <h2>Unlocked Privileges Application</h2>

      <form @submit.prevent="submitApplication" class="application-form">

        <div class="form-group">
          <label>Full Name</label>
          <input v-model="form.name" type="text" required />
        </div>

        <div class="form-group">
          <label>Email</label>
          <input v-model="form.email" type="email" disabled />
        </div>

        <div class="form-group">
          <label>Reason for Application</label>
          <textarea
            v-model="form.reason"
            rows="4"
            placeholder="Why are you applying?"
            required />
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? "Submitting..." : "Submit Application" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useLogout } from "@/components/Scripts/homescript.js"

import { auth, db } from "@/firebase"
import { doc, setDoc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"

const router = useRouter()
const loading = ref(false)

const { logout, showDropdown, toggleDropdown } = useLogout()

const handleLogout = () => {
  logout()
  showDropdown.value = false
}

const form = ref({
  name: "",
  email: "",
  reason: ""
})

// Auto-fill user info
onAuthStateChanged(auth, async (user) => {
  if (!user) return

  form.value.email = user.email

  const uDoc = await getDoc(doc(db, "users", user.uid))
  if (uDoc.exists()) {
    form.value.name = uDoc.data().name || ""
  }
})

// Submit application
const submitApplication = async () => {
  const user = auth.currentUser
  if (!user) return alert("You must be logged in.")

  loading.value = true

  try {
    // 1. Save application in seller_applications/{uid}
    await setDoc(doc(db, "seller_applications", user.uid), {
      uid: user.uid,
      name: form.value.name,
      email: form.value.email,
      reason: form.value.reason,
      status: "pending",
      createdAt: serverTimestamp()
    })

    // 2. Update users/{uid} for quick role lookup
    const userRef = doc(db, "users", user.uid)
    await updateDoc(userRef, {
      role: "applicant",
      applicationStatus: "pending",
      applicationReason: form.value.reason,
      applicationDate: serverTimestamp()
    })

    alert("Application submitted! Pending admin approval.")
    router.push("/profile")

  } catch (err) {
    console.error(err)
    alert("Error submitting application.")
  } finally {
    loading.value = false
  }
}
</script>

<style src="./Styles/application.css"></style>
