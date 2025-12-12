<template>
  <div class="contact-page">
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

    <!-- Team Section -->
    <section class="team-section">
      <h1>ShoeStride Developers</h1>
      <p>Meet the developers of ShoeStride</p>

      <div class="team-grid">
        <div class="team-member" v-for="(member, index) in teamMembers" :key="index" @click="openModal(member)">
          <img :src="member.photo" :alt="member.name" />
          <div class="member-info">
            <h3>{{ member.name }}</h3>
            <p>📞 {{ member.contact }}</p>
            <p>✉️ {{ member.email }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal Overlay -->
    <div v-if="selectedMember" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <button class="close-btn" @click="closeModal">&times;</button>
        <img :src="selectedMember.photo" :alt="selectedMember.name" />
        <h2>{{ selectedMember.name }}</h2>
        <p>📞 {{ selectedMember.contact }}</p>
        <p>✉️ {{ selectedMember.email }}</p>
        <p class="about">{{ selectedMember.about }}</p>
        <div class="social-links">
          <a v-for="(social, i) in selectedMember.socials" :key="i" :href="social.url" target="_blank">
            <i :class="social.icon"></i>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useLogout } from './Scripts/homescript.js'

const { logout, showDropdown, toggleDropdown } = useLogout()
const handleLogout = () => {
  logout()
  showDropdown.value = false
}

import member1Img from '@/assets/izellee.png'
import member2Img from '@/assets/paulin.png'
import member3Img from '@/assets/melanie.jpeg'
import member4Img from '@/assets/Lumosad.jpg'

const teamMembers = ref([
  {
    name: "Izelle Jean Franco",
    contact: "09274238157",
    email: "franco.izellejean23@gmail.com",
    photo: member1Img,
    about: "Lead designer and creative mind behind ShoeStride. Passionate about fashion and innovative shoe designs.",
  },
  {
    name: "Paulin Reese Cuaresma",
    contact: "09616578549",
    email: "paulincuaresma@gmail.com",
    photo: member2Img,
    about: "Front-end developer specializing in Vue.js and interactive user experiences.",
  },
  {
    name: "Melanie Baldeviso",
    contact: "09556546302",
    email: "baldevisomelanie09@gmail.com",
    photo: member3Img,
    about: "Backend engineer ensuring smooth functionality and seamless integration across our platform.",
  },
  {
    name: "Kinley Lumosad",
    contact: "09484850991",
    email: "Lumosad.JosephKinley@gmail.com",
    photo: member4Img,
    about: "Marketing strategist focusing on user engagement and brand visibility for ShoeStride.",
  },
])

const selectedMember = ref(null)
const openModal = (member) => selectedMember.value = member
const closeModal = () => selectedMember.value = null
</script>

<style src="./Styles/contact.css"></style>