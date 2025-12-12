<template>
  <div class="about-page">
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
              <router-link
                to="/profile"
                class="dropdown-item"
                @click="showDropdown = false"
              >
                Profile
              </router-link>
             <router-link to="/order" class="dropdown-item" @click="showDropdown=false">My order</router-link>
              <button @click="handleLogout" class="dropdown-itemmm">
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero-about">
      <h1>Welcome to ShoeStride</h1>
      <p>Your one-stop system for shoes, accessories, and marathon events!</p>
    </section>

    <!-- Info Sections -->
    <section class="info-sections">
      <div class="info-card" @click="openModal('vision')">
        <i class="fas fa-eye fa-2x"></i>
        <h3>Vision</h3>
      </div>
      <div class="info-card" @click="openModal('mission')">
        <i class="fas fa-bullseye fa-2x"></i>
        <h3>Mission</h3>
      </div>
      <div class="info-card" @click="openModal('about')">
        <i class="fas fa-info-circle fa-2x"></i>
        <h3>About Us</h3>
      </div>
    </section>

    <!-- Modal Overlay -->
    <div v-if="activeModal" class="overlay" @click.self="closeModal">
      <div class="overlay-content slide-in" :class="animationClass">
        <button class="close-btn" @click="closeModal">&times;</button>
        <h2>{{ modalTitle }}</h2>
        <p class="modal-text">{{ modalText }}</p>
      </div>

      <!-- Navigation Arrows -->
      <button v-if="activeModal" class="nav-arrow prev" @click="prevModal">
        <i class="fas fa-arrow-left"></i>
      </button>
      <button v-if="activeModal" class="nav-arrow next" @click="nextModal">
        <i class="fas fa-arrow-right"></i>
      </button>
    </div>

    <!-- Features Section -->
    <section class="features">
      <h2>Key Features</h2>
      <div class="features-grid">
        <div class="feature-card">
          <i class="fas fa-shoe-prints fa-2x"></i>
          <h3>Trending Shoes</h3>
          <p>Explore the latest collections and hottest sneaker releases.</p>
        </div>
        <div class="feature-card">
          <i class="fas fa-box-open fa-2x"></i>
          <h3>Accessories</h3>
          <p>Find the perfect accessories to match your style and needs.</p>
        </div>
        <div class="feature-card">
          <i class="fas fa-flag-checkered fa-2x"></i>
          <h3>Marathon Events</h3>
          <p>Register and stay updated on upcoming marathon events.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useLogout } from "./Scripts/homescript.js"

const { logout, showDropdown, toggleDropdown } = useLogout()
const handleLogout = () => {
  logout()
  showDropdown.value = false
}

// Modal logic
const activeModal = ref(null)
const modalTitle = ref("")
const modalText = ref("")
const animationClass = ref("")

const modals = ["vision", "mission", "about"]

const modalData = {
  vision: { 
    title: "Our Vision", 
    text: `
    To become the leading all-in-one digital hub for runners—empowering every athlete to access the right gear, discover meaningful race opportunities, and build a supportive running community through an innovative and seamless online platform.` 
  },
  mission: { 
    title: "Our Mission", 
    text: `
To provide a secure, user-friendly online marketplace for purchasing high-quality running shoes and accessories tailored to diverse running styles and needs.

To simplify marathon participation by offering an integrated and convenient registration system with real-time updates and event information.

To support athletes, retailers, and event organizers through digital tools that enhance inventory management, event coordination, and customer engagement.

To promote a healthy and active lifestyle by connecting runners to products, events, and a community that motivates personal growth and athletic achievement.` 
  },
  about: { 
    title: "About Us", 
    text: `
ShoeStride is an innovative web-based platform designed for runners of all levels—whether beginners, fitness enthusiasts, or competitive athletes. We bring together two essential aspects of the running experience in one convenient online space: premium running gear and marathon event registration.

Through ShoeStride, users can easily browse and purchase running shoes and accessories that match their preferences, foot type, and running goals. Our platform provides detailed product information, real-time inventory updates, and secure checkout options to ensure a smooth shopping experience.

Beyond shopping, ShoeStride allows athletes to register for upcoming marathons and running events effortlessly. With clear event details, real-time notifications, and streamlined registration, runners can prepare for their races with confidence.

Our platform also supports local retailers, event organizers, and the running community by offering tools for product management, event coordination, and data-driven insights.

At ShoeStride, we envision a connected and empowered running community where every runner has access to the right gear and the right events—anytime, anywhere.` 
  },
}

const openModal = (type) => {
  activeModal.value = type
  modalTitle.value = modalData[type].title
  modalText.value = modalData[type].text
  animationClass.value = "" // reset horizontal animation
}

const closeModal = () => {
  activeModal.value = null
  animationClass.value = ""
}

// Horizontal slide for arrows
let isAnimating = false

const nextModal = () => {
  if (isAnimating) return
  isAnimating = true
  const currentIndex = modals.indexOf(activeModal.value)
  const nextIndex = (currentIndex + 1) % modals.length

  animationClass.value = "slide-left"

  setTimeout(() => {
    activeModal.value = modals[nextIndex]
    modalTitle.value = modalData[modals[nextIndex]].title
    modalText.value = modalData[modals[nextIndex]].text
  }, 150)

  setTimeout(() => {
    animationClass.value = ""
    isAnimating = false
  }, 300)
}

const prevModal = () => {
  if (isAnimating) return
  isAnimating = true
  const currentIndex = modals.indexOf(activeModal.value)
  const prevIndex = (currentIndex - 1 + modals.length) % modals.length

  animationClass.value = "slide-right"

  setTimeout(() => {
    activeModal.value = modals[prevIndex]
    modalTitle.value = modalData[modals[prevIndex]].title
    modalText.value = modalData[modals[prevIndex]].text
  }, 150)

  setTimeout(() => {
    animationClass.value = ""
    isAnimating = false
  }, 300)
}
</script>

<style src="./Styles/about.css"></style>
