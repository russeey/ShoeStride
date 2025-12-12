<template>
  <div>
    <!-- 🔹 Navbar (same as Home & Events) -->
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

    <!-- 🔹 Favorite Page Content -->
    <div class="favorite-page">
      <h1>My Favorites</h1>

      <div v-if="favorites.length === 0" class="empty-msg">
        You have no favorite items.
      </div>

      <div v-else class="favorite-items">
        <div
          class="favorite-item"
          v-for="(item, index) in favorites"
          :key="index"
        >
          <img :src="item.image" :alt="item.name" />
          <div class="item-info">
            <h3>{{ item.name }}</h3>
            <p>Size: {{ item.size }}, Color: {{ item.color }}</p>
            <p>Price: Php. {{ item.price }}</p>
          </div>
          <button class="remove-btn" @click="removeFavorite(item)">
            Remove
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useFavorites } from "./Scripts/favorites.js"
import { useLogout } from "./Scripts/homescript.js"

// favorites composable
const { favorites, removeFavorite } = useFavorites()

// logout + dropdown (same logic as Home & Events)
const { logout, showDropdown, toggleDropdown } = useLogout()

const handleLogout = () => {
  logout()
  showDropdown.value = false
}
</script>

<style src="./Styles/favorite.css"></style>
