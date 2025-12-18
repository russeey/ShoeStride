<template>
  <div class="admin-container">

    <!-- TOP BAR -->
    <header class="topbar">
      <button class="menu-btn" @click="toggleSidebar">☰</button>
      <h1>Admin Dashboard</h1>
    </header>

    <!-- SIDEBAR -->
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

      <!-- DASHBOARD -->
      <section class="dashboard-section">
        <h2>System Overview</h2>

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

      <!-- PENDING APPLICATIONS -->
      <div class="panel" v-if="activeSection === 'pending'">
        <h2>Pending Applications</h2>

        <table>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Reason</th>
            <th>Actions</th>
          </tr>

          <tr v-for="p in pending" :key="p.id">
            <td>{{ p.name }}</td>
            <td>{{ p.email }}</td>
            <td>
              <button class="view-reason-btn" @click="openReasonModal(p)">
                View Reason
              </button>
            </td>
            <td>
              <button @click="approveSeller(p.id)">Approve</button>
              <button class="delete" @click="confirmDelete(p.id)">Delete</button>
            </td>
          </tr>
        </table>
      </div>

      <!-- APPROVED SELLERS -->
      <div class="panel" v-if="activeSection === 'sellers'">
        <h2>Approved Sellers</h2>

        <table>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>

          <tr v-for="s in sellers" :key="s.id">
            <td class="seller-link" @click="openSellerRevenue(s)">
              {{ s.name }}
            </td>
            <td>{{ s.email }}</td>
            <td>
              <button class="delete" @click="confirmDelete(s.id)">Delete</button>
            </td>
          </tr>
        </table>
      </div>

      <!-- ALL USERS -->
      <div class="panel" v-if="activeSection === 'users'">
        <h2>All Users</h2>

        <table>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>

          <tr v-for="u in users" :key="u.id">
            <td>{{ u.name }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.role }}</td>
            <td>
              <button class="delete" @click="confirmDelete(u.id)">Delete</button>
            </td>
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

    <!-- ✅ MODERN SELLER REVENUE MODAL -->
    <div class="revenue-overlay" v-if="showRevenueModal">
      <div class="revenue-modal">

        <div class="revenue-header">
          <h3>Seller Revenue</h3>
          <button class="revenue-close" @click="showRevenueModal = false">✕</button>
        </div>

        <div class="total-revenue-card">
          <p>Total Revenue</p>
          <h2>₱ {{ sellerRevenue.toLocaleString() }}</h2>
        </div>

        <div class="revenue-list">
          <div class="revenue-item">
            <div class="revenue-seller">
              <span>{{ selectedSeller?.name }}</span>
              <span>{{ selectedSeller?.email }}</span>
            </div>
            <div class="revenue-amount">
              ₱ {{ sellerRevenue.toLocaleString() }}
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- VIEW REASON MODAL -->
    <div class="overlay" v-if="showReasonModal" @click.self="closeReasonModal">
      <div class="modal">
        <h3>Application Reason</h3>

        <p><strong>Applicant Name:</strong></p>
        <p>{{ selectedApplication?.name }}</p>

        <p style="margin-top: 12px;"><strong>Reason:</strong></p>
        <p>{{ selectedApplication?.reason }}</p>

        <div class="modal-buttons">
          <button class="cancel" @click="closeReasonModal">Close</button>
        </div>
      </div>
    </div>

  </div>
</template>



<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { db } from "@/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
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

/* LOAD USERS */
async function loadData() {
  const usersSnap = await getDocs(collection(db, "users"));

  users.value = usersSnap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    name:
      d.data().name ||
      `${d.data().firstName || ""} ${d.data().lastName || ""}`.trim(),
  }));

  sellers.value = users.value.filter((u) => u.role === "seller");

  loadCharts();
}

/* =============================== */
/* LOAD SELLER APPLICATIONS        */
/* =============================== */
async function loadSellerApplications() {
  const snap = await getDocs(collection(db, "seller_applications"));

  const applications = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  pending.value = applications.filter(
    (app) => app.status === "pending"
  );
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
/* SELLER REVENUE MODAL            */
/* ------------------------------- */
const showRevenueModal = ref(false);
const selectedSeller = ref(null);
const sellerRevenue = ref(0);

async function openSellerRevenue(seller) {
  selectedSeller.value = seller;

  const sellerRef = doc(db, "users", seller.id);
  const snap = await getDoc(sellerRef);

  sellerRevenue.value = snap.exists()
    ? snap.data().revenue || 0
    : 0;

  showRevenueModal.value = true;
}

/* ------------------------------- */
/* VIEW REASON MODAL               */
/* ------------------------------- */
const showReasonModal = ref(false);
const selectedApplication = ref(null);

function openReasonModal(application) {
  selectedApplication.value = application;
  showReasonModal.value = true;
}

function closeReasonModal() {
  showReasonModal.value = false;
  selectedApplication.value = null;
}

/* =============================== */
/* 🔥 NORMALIZE PENDING DATA (ADD) */
/* =============================== */
watch(
  pending,
  () => {
    pending.value = pending.value.map((p) => ({
      ...p,
      name:
        p.name ||
        `${p.firstName || ""} ${p.lastName || ""}`.trim(),

      reason:
        p.reason ||
        p.applicationReason ||
        "No reason provided",

      email: p.email || "",
      uid: p.uid || p.id,
    }));
  },
  { deep: true }
);

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

/* MOUNT */
onMounted(() => {
  loadData();               // users & sellers
  loadSellerApplications(); // pending applications
});
</script>







<style src="./Styles/admin.css"></style>
