<template>
  <div class="admin-container">

    <header class="topbar">
      <button class="menu-btn" @click="toggleSidebar">☰</button>
      <h1>Admin Dashboard</h1>
    </header>

    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-header">
        <h2>Admin Panel</h2>
      </div>

      <nav class="sidebar-nav">
        <button @click="showSection('pending')" :class="{ active: activeSection === 'pending' }">
          Pending Sellers
        </button>
        <button @click="showSection('sellers')" :class="{ active: activeSection === 'sellers' }">
          Approved Sellers
        </button>
        <button @click="showSection('users')" :class="{ active: activeSection === 'users' }">
          All Users
        </button>
      </nav>

      <button class="logout-btn" @click="logout">Logout</button>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="content" :class="{ shifted: sidebarOpen }" @click="autoCloseSidebar">

      <section class="dashboard-section">
        <h2> System Overview</h2>

        <div class="charts-container">
          <div class="chart-card">
            <h3>User Status</h3>
            <canvas id="usersChart"></canvas>
          </div>

          <div class="chart-card">
            <h3>User Distribution</h3>
            <canvas id="sellerChart"></canvas>
          </div>
        </div>
      </section>

      <div class="panel" v-if="activeSection === 'pending'">
        <h2>Pending Applications</h2>
        <table>
          <tr><th>Name</th><th>Email</th><th>Actions</th></tr>
          <tr v-for="p in pending" :key="p.id">
            <td>{{ p.name }}</td>
            <td>{{ p.email }}</td>
            <td>
              <button @click="approveSeller(p.id)">Approve</button>
              <button class="delete" @click="confirmDelete(p.id)">Delete</button>
            </td>
          </tr>
        </table>
      </div>

      <div class="panel" v-if="activeSection === 'sellers'">
        <h2>Approved Sellers</h2>
        <table>
          <tr><th>Name</th><th>Email</th><th>Actions</th></tr>
          <tr v-for="s in sellers" :key="s.id">
            <!-- 🔵 NEW — clicking seller name opens revenue modal -->
            <td class="seller-link" @click="openSellerRevenue(s)">{{ s.name }}</td>
            <td>{{ s.email }}</td>
            <td><button class="delete" @click="confirmDelete(s.id)">Delete</button></td>
          </tr>
        </table>
      </div>

      <div class="panel" v-if="activeSection === 'users'">
        <h2>All Users</h2>
        <table>
          <tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr>
          <tr v-for="u in users" :key="u.id">
            <td>{{ u.name }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.role }}</td>
            <td><button class="delete" @click="confirmDelete(u.id)">Delete</button></td>
          </tr>
        </table>
      </div>

    </main>

    <!-- DELETE CONFIRM MODAL -->
    <div class="overlay" v-if="showDeleteModal">
      <div class="modal">
        <h3>Are you sure?</h3>
        <p>Do you really want to delete this user?</p>

        <div class="modal-buttons">
          <button class="cancel" @click="showDeleteModal = false">Cancel</button>
          <button class="confirm" @click="deleteUserConfirmed">Delete</button>
        </div>
      </div>
    </div>

    <!-- 🔵 NEW SELLER REVENUE MODAL -->
    <div class="overlay" v-if="showRevenueModal">
      <div class="modal">
        <h3>Seller Revenue</h3>

        <p><strong>Name:</strong> {{ selectedSeller?.name }}</p>
        <p><strong>Email:</strong> {{ selectedSeller?.email }}</p>

        <h2 style="margin-top: 12px; color: green;">
          ₱ {{ sellerRevenue.toLocaleString() }}
        </h2>

        <div class="modal-buttons">
          <button class="cancel" @click="showRevenueModal = false">Close</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { db } from "@/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  query,
  where
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import Chart from "chart.js/auto";

const router = useRouter();
const auth = getAuth();

const pending = ref([]);
const sellers = ref([]);
const users = ref([]);
const activeSection = ref("pending");

const sidebarOpen = ref(false);
function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}
function autoCloseSidebar() {
  if (window.innerWidth < 900) sidebarOpen.value = false;
}
function showSection(section) {
  activeSection.value = section;
}

/* LOGOUT */
async function logout() {
  await signOut(auth);
  router.push("/login");
}

/* LOAD DATA */
async function loadData() {
  const usersSnap = await getDocs(collection(db, "users"));
  users.value = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  pending.value = users.value.filter((u) => u.role === "applicant");
  sellers.value = users.value.filter((u) => u.role === "seller");

  loadCharts();
}

/* DELETE CONFIRMATION */
const showDeleteModal = ref(false);
let deleteTargetId = null;

function confirmDelete(id) {
  deleteTargetId = id;
  showDeleteModal.value = true;
}

async function deleteUserConfirmed() {
  await deleteDoc(doc(db, "users", deleteTargetId));
  showDeleteModal.value = false;
  deleteTargetId = null;
  loadData();
}

/* APPROVE SELLER */
async function approveSeller(id) {
  await updateDoc(doc(db, "users", id), { role: "seller" });
  loadData();
}

/* ------------------------------- */
/* 🔵 REVENUE MODAL (Correct logic) */
/* ------------------------------- */
const showRevenueModal = ref(false);
const selectedSeller = ref(null);
const sellerRevenue = ref(0);

async function openSellerRevenue(seller) {
  selectedSeller.value = seller;

  // 🔥 Get revenue from USERS collection (this is where cart.vue writes it)
  const sellerRef = doc(db, "users", seller.id);
  const snap = await getDoc(sellerRef);

  if (snap.exists()) {
    sellerRevenue.value = snap.data().revenue || 0;
  } else {
    sellerRevenue.value = 0;
  }

  showRevenueModal.value = true;
}

/* CHARTS */
let usersChart = null;
let sellerChart = null;

function loadCharts() {
  if (usersChart) usersChart.destroy();
  if (sellerChart) sellerChart.destroy();

  usersChart = new Chart(document.getElementById("usersChart"), {
    type: "bar",
    data: {
      labels: ["Pending", "Sellers", "Total Users"],
      datasets: [
        {
          label: "Count",
          data: [
            pending.value.length,
            sellers.value.length,
            users.value.length,
          ],
          backgroundColor: ["#ff9800", "#4caf50", "#2196f3"],
        },
      ],
    },
  });

  sellerChart = new Chart(document.getElementById("sellerChart"), {
    type: "pie",
    data: {
      labels: ["Sellers", "Non-Sellers"],
      datasets: [
        {
          label: "Users",
          data: [
            sellers.value.length,
            users.value.length - sellers.value.length,
          ],
          backgroundColor: ["#4caf50", "#9c27b0"],
        },
      ],
    },
  });
}

onMounted(loadData);
</script>


<style src="./Styles/admin.css"></style>
