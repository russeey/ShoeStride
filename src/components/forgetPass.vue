<template>
  <div class="forget-pass">

    <!-- NAVBAR with login restriction -->
    <nav class="navbar">
      <ul>
        <li><router-link to="/home">Home</router-link></li>
        <li><router-link to="/collection">Collection</router-link></li>
        <li><router-link to="/events">Events</router-link></li>
        <li><a href="#">About</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </nav>

    <!-- FORGOT PASSWORD FORM -->
    <div class="forget-container">
      <h2>Forgot Password</h2>
      <p>Please enter your email to reset your password.</p>

      <form @submit.prevent="submitEmail">
        <input 
          type="email"
          v-model="email"
          placeholder="Enter your email"
          required
        />

        <button type="submit">Send Reset Link</button>
      </form>

      <p v-if="successMessage" class="success">{{ successMessage }}</p>
    </div>

    <!-- Overlay -->
    <div v-if="showOverlay" class="overlay">
      <div class="overlay-content">
        <h3>{{ overlayTitle }}</h3>
        <p>{{ overlayMessage }}</p>
        <button @click="closeOverlay">Close</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";

/* FORM DATA */
const email = ref("");
const successMessage = ref("");
const router = useRouter();

/* NAVBAR LOGIC */
const isLoggedIn = ref(false);
const showOverlay = ref(false);
const overlayTitle = ref("");
const overlayMessage = ref("");

onAuthStateChanged(auth, (user) => {
  isLoggedIn.value = !!user;
});

/* Prevent access when not logged in */
const safeNavigate = (path) => {
  if (!isLoggedIn.value) {
    overlayTitle.value = "Access Denied";
    overlayMessage.value = "You must log in first to continue.";
    showOverlay.value = true;
    return;
  }
  router.push(path);
};

const closeOverlay = () => {
  showOverlay.value = false;
};

/* PASSWORD RESET */
const submitEmail = () => {
  const token = Math.random().toString(36).substring(2, 15);
  console.log(`Reset link: /resetPassword?token=${token}`);

  successMessage.value = `Reset link sent to ${email.value}. Redirecting...`;

  setTimeout(() => {
    router.push(`/resetPassword?token=${token}`);
  }, 2000);
};
</script>

<!-- IMPORT SEPARATE CSS FILE -->
<style src="./Styles/forgetPass.css"></style>
