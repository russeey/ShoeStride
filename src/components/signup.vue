<template>
  <div>
    <nav class="navbar">
      <ul>
        <li><router-link to="/">Home</router-link></li>
        <li><router-link to="/collection">Collection</router-link></li>
        <li><router-link to="/events">Events</router-link></li>
        <li><a href="#">About</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </nav>

    <div class="wrapper">
      <div class="left">
        <h1 class="title">Shoe Stride</h1>
        <p class="subtitle">Ultimate Running Shoe & Accessories</p>
        <p class="desc">Store with Marathon Registration</p>
        <p class="info">
          Shoe Stride is your destination for top-tier running shoes and accessories.
          Use our app platform to shop and register for upcoming marathons, track events, and more.
        </p>
      </div>

      <div class="login-box">
        <h2>Sign Up</h2>
        <p class="Subtitleee">Please fill up</p>

        <form @submit.prevent="handleSignup">
          <div class="name-fields">
            <input v-model="firstName" type="text" placeholder="First Name" required />
            <input v-model="lastName" type="text" placeholder="Last Name" required />
          </div>

          <input v-model="email" type="email" placeholder="Email" required />
          <input v-model="password" type="password" placeholder="Password" required />
          <input v-model="confirmPassword" type="password" placeholder="Confirm Password" required />

          <select v-model="gender" class="gender-select" required>
            <option value="" disabled>Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <!-- ⭐ Manual typing + Calendar-enabled Birthdate Input -->
          <input
            :type="showDatePicker ? 'date' : 'text'"
            v-model="birthdate"
            placeholder="YYYY-MM-DD"
            @focus="showDatePicker = true"
            @blur="showDatePicker = false"
            required
          />

          <input v-model="age" type="number" placeholder="Age" min="0" required />

          <button type="submit">Create Account</button>

          <p v-if="error" class="error">{{ error }}</p>
          <p v-if="success" class="success">{{ success }}</p>
        </form>

        <p class="signup">
          Already have an account? <router-link to="/login">Log In</router-link>
        </p>

        <div class="footer-links">
          <a href="#">Support</a>
          <a href="#">Customer Care</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
  gender,
  birthdate,
  age,
  error,
  success,
  signup
} from './Scripts/ScriptSignup.js'

import { useRouter } from 'vue-router'
import { ref } from 'vue'
import './Styles/signup.css'

const router = useRouter()

// ⭐ Controls whether input shows text or date picker
const showDatePicker = ref(false)

const handleSignup = async () => {
  await signup()

  if (success.value) {
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  }
}
</script>
