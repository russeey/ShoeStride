<template>
  <div>
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

              <!-- Unlocked Privileges visible only for users (not sellers) -->
              <router-link
                v-if="userRole !== 'seller'"
                to="/application"
                class="dropdown-item"
                @click="showDropdown = false"
              >
                Unlocked Privileges
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
    <section class="hero">
      <div class="hero-left">
        <h4>Our Trending Shoes</h4>
        <h2>Most Popular <br /> Products</h2>
        <p>Trending now! Explore our hottest picks that sell out fast. Don’t miss your perfect pair.</p>
        <button class="explore-btn" @click="goToCollection">Explore</button>
      </div>

      <!-- Products -->
      <div class="hero-products">
        <div
          v-for="(product, index) in products"
          :key="index"
          class="product-card"
          @click="openProductModal(product)"
        >
          <img :src="product.image" :alt="product.name" />
          <p>{{ product.name }}</p>
          <span>Php. {{ product.price }}</span>
        </div>
      </div>
    </section>

    <!-- Events Section -->
    <section class="events">
      <h3>Upcoming Running Events</h3>
      <div class="events-grid">
        <div
          class="event-card home-event-card"
          v-for="event in homeEvents"
          :key="event.id"
          @click="openEvent(event)"
        >
          <img
            :src="event.image"
            :alt="event.title"
            class="home-event-image"
          />
          <div class="home-event-info">
            <span class="date">{{ event.displayDate }}</span>
            <p class="event-title">{{ event.title }}</p>
            <small>{{ event.location }} • {{ event.type }}</small>
          </div>
        </div>
      </div>

      <button class="load-btn" @click="goToEvents">Load More</button>
    </section>

    <!-- Product Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <button class="modal-close" @click="closeModal">✖</button>
        <img :src="selectedProduct.image" :alt="selectedProduct.name" />
        <h3>{{ selectedProduct.name }}</h3>
        <p>Php. {{ selectedProduct.price }}</p>

        <div class="form-group">
          <label>Select Size:</label>
          <select v-model="selectedSize">
            <option v-for="size in sizes" :key="size" :value="size">
              {{ size }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Select Color:</label>
          <select v-model="selectedColor">
            <option v-for="color in colors" :key="color" :value="color">
              {{ color }}
            </option>
          </select>
        </div>

        <div class="product-modal-actions">
          <button class="favorite-btn" @click="addToFavorites(selectedProduct)">
            <i class="fas fa-heart"></i> Add to Favorites
          </button>
          <button class="cart-btn" @click="addToCart(selectedProduct)">
            <i class="fas fa-shopping-bag"></i> Add to Cart
          </button>
        </div>
      </div>
    </div>

    <!-- Event Modal -->
    <div v-if="showEventModal" class="overlay" @click.self="closeEventModal">
      <div class="modal">
        <button class="close-btn" @click="closeEventModal">✖</button>

        <div class="modal-header" v-if="selectedEvent">
          <img
            :src="selectedEvent.image"
            :alt="selectedEvent.title"
            class="modal-image"
          />
          <div class="modal-title-block">
            <h2>{{ selectedEvent.title }}</h2>
            <p class="modal-date-location">
              {{ selectedEvent.displayDate }} • {{ selectedEvent.location }}
            </p>
            <p class="modal-desc">{{ selectedEvent.description }}</p>
            <p class="modal-extra">
              Type: {{ selectedEvent.type }} <br />
              Categories: {{ selectedEvent.categories?.join(' • ') }}
            </p>
          </div>
        </div>

        <div class="modal-body">
          <h3>Registration Form</h3>
          <form @submit.prevent="submitEventRegistration">
            <div class="form-group">
              <label>Full Name</label>
              <input v-model="eventForm.name" type="text" required />
            </div>

            <div class="form-group">
              <label>Email</label>
              <input v-model="eventForm.email" type="email" required />
            </div>

            <div class="form-group">
              <label>Category</label>
              <select v-model="eventForm.category" required>
                <option disabled value="">Select category</option>
                <option>3K Fun Run</option>
                <option>5K Run</option>
                <option>10K Run</option>
                <option>21K Half Marathon</option>
                <option>42K Marathon</option>
                <option>50K Ultra</option>
              </select>
            </div>

            <div class="form-group">
              <label>Shirt Size</label>
              <select v-model="eventForm.shirtSize" required>
                <option disabled value="">Select size</option>
                <option>XS</option>
                <option>S</option>
                <option>M</option>
                <option>L</option>
                <option>XL</option>
              </select>
            </div>

            <div class="form-group">
              <label>Notes (optional)</label>
              <textarea
                v-model="eventForm.notes"
                rows="3"
                placeholder="Any special requests or information?"
              ></textarea>
            </div>

            <button type="submit" class="register-btn">
              Submit Registration
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useFavorites } from "./Scripts/favorites.js";
import { useCart } from "./Scripts/cart.js";
import { useLogout } from "./Scripts/homescript.js";

// FIREBASE
import { auth, db } from "@/firebase.js";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

// Router
const router = useRouter();

// States
const showModal = ref(false);
const selectedProduct = ref({});
const selectedSize = ref("");
const selectedColor = ref("");

const showEventModal = ref(false);
const selectedEvent = ref(null);

const eventForm = ref({
  name: "",
  email: "",
  category: "",
  shirtSize: "",
  notes: ""
});

const sizes = ["5", "6", "7", "8", "9", "10"];
const colors = ["Red", "Blue", "Black", "White"];

// ⭐ USER ROLE – DEFAULT IS "user" UNTIL FIREBASE LOADS
const userRole = ref("user");
const userData = ref(null);

// Product Images
import canvasImg from "@/assets/canvas.png";
import rcasualImg from "@/assets/rcasual.png";
import menImg from "@/assets/men.png";
import kagayanImg from "@/assets/kagay-an.png";

// Product List
const products = [
  { name: "Running canvas shoes", price: 2999, image: canvasImg },
  { name: "Running casual shoes", price: 2999, image: rcasualImg },
  { name: "Casual Nike shoes", price: 2999, image: menImg }
];

// Events
const events = ref([
  {
    id: 1,
    title: "Sante Barley Trilogy Run Asia - Leg 1",
    displayDate: "Sep 18, 2025",
    location: "Cagayan de Oro City",
    type: "Half Marathon",
    categories: ["3K Fun Run", "5K Run", "10K Run", "21K Half Marathon"],
    image:
      "https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg",
    description:
      "Join the first leg of the trilogy run with exciting activities and booths."
  },
  {
    id: 2,
    title: "Milo 50K Ultra Marathon",
    displayDate: "Oct 05, 2025",
    location: "Cagayan de Oro City",
    type: "Ultra Marathon",
    categories: ["50K Ultra"],
    image:
      "https://images.pexels.com/photos/1199590/pexels-photo-1199590.jpeg",
    description: "Challenge yourself in the Milo 50K Ultra Marathon."
  },
  {
    id: 3,
    title: "Kagay-an Festival Marathon",
    displayDate: "Aug 28, 2025",
    location: "Cagayan de Oro City",
    type: "Marathon",
    categories: ["10K Run", "21K Half Marathon", "42K Marathon"],
    image: kagayanImg,
    description:
      "Celebrate the San Agustin feast with the Kagay-an Festival Marathon."
  }
]);

const homeEvents = computed(() => events.value.slice(0, 3));

// Cart / Favorites
const { addFavorite } = useFavorites();
const { addCart } = useCart();

// Logout
const { logout, showDropdown, toggleDropdown } = useLogout();

const handleLogout = () => {
  logout();
  showDropdown.value = false;
};

// Navigation
const goToEvents = () => router.push("/events");
const goToCollection = () => router.push("/collection");

// ------------------------------------------------------
// PRODUCT MODAL
// ------------------------------------------------------
const openProductModal = (product) => {
  selectedProduct.value = product;
  selectedSize.value = sizes[0];
  selectedColor.value = colors[0];
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const addToFavorites = (product) => {
  addFavorite({
    ...product,
    size: selectedSize.value,
    color: selectedColor.value
  });
  alert(`${product.name} added to Favorites!`);
};

const addToCart = (product) => {
  addCart({
    ...product,
    size: selectedSize.value,
    color: selectedColor.value
  });
  alert(`${product.name} added to Cart!`);
};

// ------------------------------------------------------
// EVENT MODAL + FIREBASE REGISTRATION
// ------------------------------------------------------
const openEvent = (event) => {
  selectedEvent.value = event;

  eventForm.value = {
    name: "",
    email: "",
    category: "",
    shirtSize: "",
    notes: ""
  };

  showEventModal.value = true;
};

const closeEventModal = () => {
  showEventModal.value = false;
};

const submitEventRegistration = async () => {
  if (
    !eventForm.value.name ||
    !eventForm.value.email ||
    !eventForm.value.category ||
    !eventForm.value.shirtSize
  ) {
    alert("Please complete all required fields.");
    return;
  }

  try {
    await addDoc(collection(db, "event_registrations"), {
      ...eventForm.value,
      eventId: selectedEvent.value.id,
      eventName: selectedEvent.value.title,
      eventDate: selectedEvent.value.displayDate,
      location: selectedEvent.value.location,
      createdAt: serverTimestamp(),
      userId: auth.currentUser?.uid || null
    });

    alert("Registration submitted successfully!");
    showEventModal.value = false;
  } catch (err) {
    console.error("Error submitting registration:", err);
    alert("Error submitting registration.");
  }
};

// ------------------------------------------------------
// LOAD USER ROLE FROM FIREBASE
// ------------------------------------------------------
onMounted(async () => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      userData.value = snap.data();
      userRole.value = snap.data().role || "user"; // ⭐ IMPORTANTE!!!
    }
  } catch (err) {
    console.error("Failed loading user:", err);
  }
});
</script>

<style src="./Styles/home.css"></style>
