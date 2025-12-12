<template>
  <div>
    <!-- Navbar -->
    <nav class="navbar">
      <ul>
        <li><router-link to="/home">Home</router-link></li>
        <li><router-link to="/collection">Collection</router-link></li>
        <li><router-link to="/events">Events</router-link></li>
        <li><a href="#">About</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </nav>

    <!-- Page Wrapper -->
    <div :class="{ blurred: showOverlay }" class="wrapper">
      <!-- Left Info Section -->
      <div class="left">
        <h1 class="title">Shoe Stride</h1>
        <p class="subtitle">Ultimate Running Shoe & Accessories</p>
        <p class="desc">Store with Marathon Registration</p>
        <p class="info">
          Shop premium running shoes and register for marathons all in one place.
        </p>
      </div>

      <!-- Login Box -->
      <div class="login-box">
        <h2>Login</h2>
        <p class="subtitlee">Glad you're back!</p>

        <form @submit.prevent="handleLogin">
          <input v-model="email" type="email" placeholder="Email" required />

          <div class="password-wrapper">
            <input
              :type="passwordFieldType"
              v-model="password"
              placeholder="Password"
              required
            />
            <span class="show-password-text" @click="togglePassword">
              {{ showPassword ? "Hide" : "Show" }}
            </span>
          </div>

          <div class="remember-forgot">
            <label><input type="checkbox" /> Remember me</label>
            <router-link to="/forgetPass">Forgot password?</router-link>
          </div>

          <button type="submit">Login</button>
          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        </form>

        <!-- Social Login -->
        <p class="or"> Or </p>
        <div class="social-buttons">
          <button class="google-btn" @click="handleGoogleLogin">
            <img src="../assets/google.png" alt="Google" />
          </button>
          <button class="facebook-btn" @click="handleFacebookLogin">
            <img src="../assets/facebook.png" alt="Facebook" />
          </button>
        </div>

        <!-- Signup -->
        <p class="signup">
          Don’t have an account? <router-link to="/signup">Sign up</router-link>
        </p>

        <!-- Footer Links -->
        <div class="footer-links">
          <a href="#" @click.prevent="openOverlay('Terms & Conditions')"
            >Terms & Conditions</a
          >
          <a href="#" @click.prevent="openOverlay('Support')">Support</a>
          <a href="#" @click.prevent="openOverlay('Customer Care')"
            >Customer Care</a
          >
        </div>
      </div>
    </div>

    <!-- Overlay -->
    <div v-if="showOverlay" class="overlay">
      <div class="overlay-content">
        <h3>{{ overlayTitle }}</h3>
        <p v-if="overlayTitle === 'Terms & Conditions'">
          By accepting, you agree to our terms and conditions.
        </p>
        <p v-else>This is the content for {{ overlayTitle }}.</p>
        <button @click="closeOverlay">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
/* IMPORTS */
import { ref } from "vue";
import { useRouter } from "vue-router";
import { auth, db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  login,
  loginWithGoogle,
  loginWithFacebook,
  showPassword,
  passwordFieldType,
  togglePassword,
  showOverlay,
  overlayTitle,
  openOverlay,
  closeOverlay,
  errorMessage,
} from "./Scripts/loginScript";

/* STATE */
const router = useRouter();
const email = ref("");
const password = ref("");

/* LOGIN HANDLER */
const handleLogin = async () => {
  errorMessage.value = "";

  // LOGIN via Firebase Auth
  const success = await login(email.value, password.value);
  if (!success) {
    errorMessage.value = "Invalid email or password";
    return;
  }

  // GET USER FROM AUTH
  const user = auth.currentUser;
  if (!user) {
    errorMessage.value = "Login failed. Try again.";
    return;
  }

  // FETCH USER ROLE FROM FIRESTORE
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    errorMessage.value = "Account not found in database.";
    return;
  }

  const data = snap.data();

  /* ROLE-BASED REDIRECT */
  switch (data.role) {
    case "admin":
      router.push("/admin");
      break;

    case "seller":
      router.push("/home"); // change if needed
      break;

    case "applicant":
      router.push("/home");
      break;

    default:
      router.push("/home");
      break;
  }
};

/* GOOGLE LOGIN */
const handleGoogleLogin = async () => {
  const success = await loginWithGoogle();
  if (!success) return;

  router.push("/home");
};

/* FACEBOOK LOGIN */
const handleFacebookLogin = async () => {
  const success = await loginWithFacebook();
  if (!success) return;

  router.push("/home");
};
</script>

<style src="./Styles/login.css"></style>
