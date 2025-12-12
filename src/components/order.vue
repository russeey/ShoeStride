<template>
  <div>
    <!-- 🔹 Navbar (SAME AS cart.vue) -->
    <nav class="navbar">
      <div class="nav-center">
        <ul class="nav-links">
          <li><router-link to="/home">Home</router-link></li>
          <li><router-link to="/collection">Products</router-link></li>
          <li><router-link to="/events">Events</router-link></li>
          <li><router-link to="/about">About</router-link></li>
          <li><router-link to="/contact">Contact</router-link></li>
        </ul>

        <!-- ICONS -->
        <div class="nav-icons">
          <router-link to="/favorites" class="icon-btn">
            <i class="fas fa-heart"></i>
          </router-link>

          <router-link to="/cart" class="icon-btn">
            <i class="fas fa-bag-shopping"></i>
          </router-link>

          <!-- Dropdown -->
          <div class="dropdown">
            <button class="icon-btnn" @click="toggleDropdown">
              <i class="fas fa-user"></i>
            </button>

            <div v-if="showDropdown" class="dropdown-menu">
              <router-link to="/profile" class="dropdown-item" @click="showDropdown=false">Profile</router-link>
              <router-link to="/order" class="dropdown-item" @click="showDropdown=false">My order</router-link>
              <button class="dropdown-itemmm" @click="handleLogout">Log Out</button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- 🔹 ORDER PAGE CONTENT -->
    <div class="order-page">
      <h1>My Orders</h1>

      <div v-if="orders.length === 0" class="empty-msg">
        You have no orders yet.
      </div>

      <div v-else class="order-list">
        <div class="order-item" v-for="(order, index) in orders" :key="index">
          <img :src="order.image" class="order-img" />

          <div class="order-info">
            <h3>{{ order.name }}</h3>
            <p>Size: {{ order.size }} | Color: {{ order.color }}</p>
            <p>Price: Php {{ order.price }}</p>
            <p>Payment: {{ order.paymentMethod }}</p>
            <p class="order-date">Ordered: {{ new Date(order.timestamp).toLocaleString() }}</p>
          </div>

          <!-- ❌ DELETE BUTTON -->
          <button class="delete-btn" @click="deleteOrder(order.id, index)">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { auth, db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useLogout } from "./Scripts/homescript.js";

const { logout, showDropdown, toggleDropdown } = useLogout();
const handleLogout = () => {
  logout();
  showDropdown.value = false;
};

const orders = ref([]);

onMounted(async () => {
  const user = auth.currentUser;

  if (!user) {
    console.warn("⚠ No user detected.");
    return;
  }

  console.log("🔍 Loading orders for:", user.uid);

  // 🔥 THIS IS THE CORRECT PATH BASED ON YOUR FIREBASE STRUCTURE
  const orderRef = collection(db, "orders", user.uid, "items");

  try {
    const snapshot = await getDocs(orderRef);

    orders.value = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    console.log("📦 Loaded orders:", orders.value);
  } catch (err) {
    console.error("❌ Failed to load orders:", err);
  }
});

// 🗑 DELETE ORDER
const deleteOrder = async (orderId, index) => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await deleteDoc(doc(db, "orders", user.uid, "items", orderId));
    orders.value.splice(index, 1);
    console.log("🗑 Deleted:", orderId);
  } catch (err) {
    console.error("❌ Delete failed:", err);
  }
};
</script>

<style src="./Styles/order.css"></style>
