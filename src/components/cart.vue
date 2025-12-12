<template>
  <div>
    <!-- 🔹 Navbar -->
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
          <router-link to="/favorites" class="icon-btn">
            <i class="fas fa-heart"></i>
          </router-link>

          <router-link to="/cart" class="icon-btn">
            <i class="fas fa-bag-shopping"></i>
          </router-link>

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

    <!-- CART PAGE -->
    <div class="cart-page">
      <h1>My Cart</h1>

      <div v-if="cart.length === 0" class="empty-msg">Your cart is empty.</div>

      <div v-else class="cart-items">
        <div class="cart-item" v-for="(item, index) in cart" :key="index">

          <input type="checkbox" v-model="checkedItems" :value="item" />

          <img :src="item.image" class="cart-img" />

          <div class="item-info">
            <h3 class="item-title">{{ item.name }}</h3>
            <p class="item-sub">Size: {{ item.size }} | Color: {{ item.color }}</p>
            <p class="item-price">Php {{ item.price }}</p>
          </div>

          <button class="remove-btn" @click="removeFromCart(item)">Remove</button>
        </div>
      </div>

      <div class="checkout-section" v-if="cart.length > 0">
        <button
          class="checkout-btn"
          :disabled="checkedItems.length === 0"
          @click="openCheckout"
        >
          Checkout ({{ checkedItems.length }} items)
        </button>
      </div>

      <!-- CHECKOUT MODAL -->
      <div v-if="showCheckout" class="checkout-overlay" @click.self="closeCheckout">
        <div class="checkout-modal" @click.stop>
          <button class="close-btn" @click="closeCheckout">✖</button>

          <h2>Checkout Summary</h2>

          <!-- 🔹 USER DETAILS - EDITABLE -->
          <div class="user-details-box">
            <h3>User Details</h3>

            <div class="user-detail-row">
              <label>Full Name</label>
              <input v-model="userInfo.fullName" type="text" />
            </div>

            <div class="user-detail-row">
              <label>Phone</label>
              <input v-model="userInfo.phone" type="text" />
            </div>

            <div class="user-detail-row">
              <label>Address</label>
              <textarea v-model="userInfo.address"></textarea>
            </div>
          </div>

          <div class="checkout-items">
            <div class="checkout-item" v-for="(item, index) in checkedItems" :key="index">
              <img :src="item.image" />
              <div class="checkout-details">
                <div class="title">{{ item.name }}</div>
                <div class="price">Size: {{ item.size }} | Color: {{ item.color }}</div>
                <div class="price">Price: Php {{ item.price }}</div>
              </div>
            </div>
          </div>

          <h3 class="total">Total: Php {{ totalAmount }}</h3>

          <div class="payment-method-modern">
            <h3>Select Payment Method</h3>

            <div class="payment-options">
              <div
                class="payment-card"
                :class="{ active: paymentMethod === 'COD' }"
                @click="paymentMethod = 'COD'"
              >
                <i class="fas fa-box payment-icon"></i>
                <span>Cash on Delivery</span>
              </div>

              <div
                class="payment-card"
                :class="{ active: paymentMethod === 'GCash' }"
                @click="paymentMethod = 'GCash'"
              >
                <i class="fas fa-wallet payment-icon"></i>
                <span>GCash</span>
              </div>
            </div>
          </div>

          <button class="confirm-btn" @click="confirmPayment">
            Confirm Payment
          </button>
        </div>
      </div>

      <!-- RECEIPT OVERLAY -->
      <div v-if="showReceipt" class="receipt-overlay" @click.self="showReceipt=false">
        <div class="receipt-box" @click.stop>
          <h2>Order Receipt</h2>

          <!-- USER DETAILS IN RECEIPT -->
          <div class="receipt-user">
            <p><strong>Name:</strong> {{ recentUser.fullName }}</p>
            <p><strong>Phone:</strong> {{ recentUser.phone }}</p>
            <p><strong>Address:</strong> {{ recentUser.address }}</p>
          </div>

          <div class="receipt-items">
            <div class="receipt-item" v-for="(item, index) in recentOrder" :key="index">
              <img :src="item.image" />
              <div>
                <p class="r-title">{{ item.name }}</p>
                <p class="r-sub">Size: {{ item.size }} | Color: {{ item.color }}</p>
                <p class="r-price">Php {{ item.price }}</p>
              </div>
            </div>
          </div>

          <h3 class="receipt-total">Total: Php {{
            recentOrder.reduce((t, i) => t + i.price, 0)
          }}</h3>

          <p class="receipt-method">Payment: {{ recentPayment }}</p>
          <p class="receipt-time">Time: {{ new Date().toLocaleString() }}</p>

          <button class="close-receipt" @click="finishReceipt">Close</button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { useCart } from "./Scripts/cart.js";
import { auth, db } from "../firebase";
import { collection, addDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import { useLogout } from "./Scripts/homescript.js";
import { useRouter } from "vue-router";

const router = useRouter();
const { cart, removeFromCart } = useCart();

const { logout, showDropdown, toggleDropdown } = useLogout();
const handleLogout = () => {
  logout();
  showDropdown.value = false;
};

const checkedItems = ref([]);
const showCheckout = ref(false);
const paymentMethod = ref("COD");

const showReceipt = ref(false);
const recentOrder = ref([]);
const recentPayment = ref("");
const recentUser = ref({});

const userInfo = ref({
  fullName: "",
  phone: "",
  address: ""
});

// -----------------------------------------------------------
// LOAD USER DETAILS
// -----------------------------------------------------------
onMounted(async () => {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    const data = snap.data();
    userInfo.value.fullName = `${data.firstName} ${data.lastName}`;
    userInfo.value.phone = data.contactNumber || "";
    userInfo.value.address = data.address || "";
  }
});

// -----------------------------------------------------------
// SAVE USER DETAILS
// -----------------------------------------------------------
const saveUserDetails = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const [firstName, ...rest] = userInfo.value.fullName.split(" ");
  const lastName = rest.join(" ");

  await updateDoc(doc(db, "users", user.uid), {
    firstName,
    lastName,
    contactNumber: userInfo.value.phone,
    address: userInfo.value.address
  });
};

// -----------------------------------------------------------
// CHECKOUT UI
// -----------------------------------------------------------
const openCheckout = () =>
  checkedItems.value.length && (showCheckout.value = true);

const closeCheckout = () => (showCheckout.value = false);

const totalAmount = computed(() =>
  checkedItems.value.reduce((sum, i) => sum + i.price, 0)
);

// -----------------------------------------------------------
// SAFE REVENUE UPDATE (compatible with your Firestore rules)
// -----------------------------------------------------------
const updateSellerRevenue = async (item) => {
  const sellerId = item.sellerId;
  if (!sellerId) return console.warn("Missing sellerId:", item);

  const sellerRef = doc(db, "users", sellerId);
  const snap = await getDoc(sellerRef);

  if (!snap.exists()) return;

  const currentRevenue = snap.data().revenue || 0;

  // Only buyers updating revenue is allowed under your current rules
  await updateDoc(sellerRef, {
    revenue: currentRevenue + item.price
  });
};

// -----------------------------------------------------------
// MAIN PAYMENT HANDLER
// -----------------------------------------------------------
const confirmPayment = async () => {
  await saveUserDetails();

  const user = auth.currentUser;
  if (!user) return;

  const orderRef = collection(db, "orders", user.uid, "items");

  // ---------------------------------------------------------
  // GCASH PAYMENT
  // ---------------------------------------------------------
  if (paymentMethod.value === "GCash") {
    recentOrder.value = [...checkedItems.value];
    recentPayment.value = "GCash";
    recentUser.value = { ...userInfo.value };

    for (const item of checkedItems.value) {
      // Save order
      await addDoc(orderRef, {
        ...item,
        paymentMethod: "GCash",
        userDetails: userInfo.value,
        timestamp: Date.now()
      });

      await updateSellerRevenue(item);

      // SAFE update to product (allowed by rules)
      await updateDoc(doc(db, "products", item.id), {
        sold: true,
        soldAt: Date.now()
      });
    }

    // Remove from cart
    cart.value = cart.value.filter(i => !checkedItems.value.includes(i));
    localStorage.setItem("cart", JSON.stringify(cart.value));

    // PAYMONGO REQUEST
    const res = await axios.post("http://localhost:5000/create-gcash", {
      amount: totalAmount.value,
      items: checkedItems.value,
      uid: user.uid
    });

    window.open(res.data.paymongo_url, "_blank");

    showCheckout.value = false;
    showReceipt.value = true;
    return;
  }

  // ---------------------------------------------------------
  // COD PAYMENT
  // ---------------------------------------------------------
  saveOrder("COD");
};

// -----------------------------------------------------------
// SAVE COD ORDER
// -----------------------------------------------------------
const saveOrder = async (method = "COD") => {
  const user = auth.currentUser;
  if (!user) return;

  const orderRef = collection(db, "orders", user.uid, "items");

  recentOrder.value = [...checkedItems.value];
  recentPayment.value = method;
  recentUser.value = { ...userInfo.value };

  for (const item of checkedItems.value) {
    await addDoc(orderRef, {
      ...item,
      paymentMethod: method,
      userDetails: userInfo.value,
      timestamp: Date.now()
    });

    await updateSellerRevenue(item);
  }

  // Clean cart
  cart.value = cart.value.filter(i => !checkedItems.value.includes(i));
  localStorage.setItem("cart", JSON.stringify(cart.value));

  checkedItems.value = [];
  showCheckout.value = false;
  showReceipt.value = true;
};

const finishReceipt = () => {
  showReceipt.value = false;
  router.push("/order");
};
</script>


<style src="./Styles/cart.css"></style>
