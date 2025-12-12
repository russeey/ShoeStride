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
              <router-link to="/profile" class="dropdown-item" @click="showDropdown = false">
                Profile
              </router-link>
           <router-link to="/order" class="dropdown-item" @click="showDropdown=false">My order</router-link>

              <button @click="handleLogout" class="dropdown-itemmm">Log Out</button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- 🔹 EVENT PAGE -->
    <div class="event-page">
      <h1>Upcoming Running Events</h1>

      <!-- Filters -->
      <div class="filters-container">
        <!-- Month -->
        <div class="filter-group select-wrapper">
          <label for="monthFilter">Month</label>
          <select id="monthFilter" v-model="filters.month">
            <option value="all">All Months</option>
            <option value="0">January</option>
            <option value="1">February</option>
            <option value="2">March</option>
            <option value="3">April</option>
            <option value="4">May</option>
            <option value="5">June</option>
            <option value="6">July</option>
            <option value="7">August</option>
            <option value="8">September</option>
            <option value="9">October</option>
            <option value="10">November</option>
            <option value="11">December</option>
          </select>
        </div>

        <!-- Type -->
        <div class="filter-group select-wrapper">
          <label for="typeFilter">Run Type</label>
          <select id="typeFilter" v-model="filters.type">
            <option value="all">All Types</option>
            <option>Fun Run</option>
            <option>Marathon</option>
            <option>Half Marathon</option>
            <option>Ultra Marathon</option>
          </select>
        </div>

        <!-- Category -->
        <div class="filter-group select-wrapper">
          <label for="categoryFilter">Category</label>
          <select id="categoryFilter" v-model="filters.category">
            <option value="all">All Categories</option>
            <option>3K Fun Run</option>
            <option>5K Run</option>
            <option>10K Run</option>
            <option>21K Half Marathon</option>
            <option>42K Marathon</option>
            <option>50K Ultra</option>
          </select>
        </div>
      </div>

      <!-- EVENT GRID -->
      <transition-group name="fade" tag="div" class="events-grid">
        <div
          v-for="event in visibleEvents"
          :key="event.id"
          class="event-card"
          @click="openEvent(event)"
        >
          <img :src="event.image" class="event-image" />
          <div class="event-info">
            <span class="event-date">{{ event.displayDate }}</span>
            <h3>{{ event.title }}</h3>
            <p class="location">{{ event.location }}</p>
            <p class="event-type">{{ event.type }}</p>
            <p class="event-categories">{{ event.categories.join(' • ') }}</p>
          </div>
        </div>

        <div v-if="filteredEvents.length === 0" key="no-events" class="no-events-message">
          No events found. Check back later!
        </div>
      </transition-group>

      <!-- Load more buttons -->
      <div class="load-more-container" v-if="filteredEvents.length > 0">
        <button
          v-if="visibleEvents.length < filteredEvents.length"
          @click="loadMore"
          class="load-more-btn"
        >
          Show More
        </button>

        <button
          v-if="visibleEvents.length > initialVisibleCount"
          @click="showLess"
          class="show-less-btn"
        >
          Show Less
        </button>
      </div>

      <!-- MODAL -->
      <div v-if="showModal" class="overlay" @click.self="closeModal">
        <div class="modal">
          <button class="close-btn" @click="closeModal">✖</button>

          <div class="modal-header">
            <img :src="selectedEvent?.image" class="modal-image" />
            <div class="modal-title-block">
              <h2>{{ selectedEvent?.title }}</h2>
              <p class="modal-date-location">
                {{ selectedEvent?.displayDate }} • {{ selectedEvent?.location }}
              </p>
              <p class="modal-desc">{{ selectedEvent?.description }}</p>
              <p class="modal-extra">
                Type: {{ selectedEvent?.type }} <br />
                Categories: {{ selectedEvent?.categories?.join(' • ') }}
              </p>
            </div>
          </div>

          <!-- Registration Form -->
          <div class="modal-body">
            <h3>Registration Form</h3>

            <form @submit.prevent="submitRegistration">
              <div class="form-group">
                <label>Full Name</label>
                <input v-model="form.name" required />
              </div>

              <div class="form-group">
                <label>Email</label>
                <input v-model="form.email" type="email" required />
              </div>

              <div class="form-group">
                <label>Category</label>
                <select v-model="form.category" required>
                  <option disabled value="">Select category</option>
                  <option v-for="cat in selectedEvent?.categories" :key="cat">{{ cat }}</option>
                </select>
              </div>

              <div class="form-group">
                <label>Shirt Size</label>
                <select v-model="form.shirtSize" required>
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
                <textarea v-model="form.notes" rows="3"></textarea>
              </div>

              <button class="register-btn" type="submit">Submit Registration</button>
            </form>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import emailjs from "emailjs-com";
import kagayanImg from "@/assets/kagay-an.png";
import iliganImg from "@/assets/iligan.png";
import funrunImg from "@/assets/funrun.png";
import freedomrun from "@/assets/funrun6.png";
import { useLogout } from "./Scripts/homescript.js";

export default {
  name: "Events",
  setup() {
    const initialVisibleCount = 3;

    /* ------------------------------------
     EVENTS LIST
    ------------------------------------ */
    const events = ref([
      {
        id: 1,
        title: "Sante Barley Trilogy Run Asia - Leg 1",
        date: "2025-09-18",
        displayDate: "Sep 18, 2025",
        location: "Cagayan de Oro City",
        type: "Half Marathon",
        categories: ["3K Fun Run", "5K Run", "10K Run", "21K Half Marathon"],
        image: "https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg",
        description: "Join the first leg of the Sante Barley Trilogy Run Asia."
      },
      {
        id: 2,
        title: "Milo 50K Ultra Marathon",
        date: "2025-10-05",
        displayDate: "Oct 05, 2025",
        location: "Metro Manila",
        type: "Ultra Marathon",
        categories: ["50K Ultra"],
        image: "https://images.pexels.com/photos/1199590/pexels-photo-1199590.jpeg",
        description: "Challenge yourself in this 50K ultra marathon."
      },
      {
        id: 3,
        title: "Kagay-an Festival Marathon",
        date: "2025-08-28",
        displayDate: "Aug 28, 2025",
        location: "Cagayan de Oro City",
        type: "Marathon",
        categories: ["10K Run", "21K Half Marathon", "42K Marathon"],
        image: kagayanImg,
        description: "Celebrate the San Agustin feast with a marathon across CDO."
      },
      {
        id: 4,
        title: "Iligan City Marathon",
        date: "2025-11-12",
        displayDate: "Nov 12, 2025",
        location: "Iligan City",
        type: "Marathon",
        categories: ["5K Run", "10K Run", "21K Half Marathon", "42K Marathon"],
        image: iliganImg,
        description: "Run through Iligan City's scenic routes."
      },
      {
        id: 5,
        title: "Cagayan de Oro City Fun Run",
        date: "2025-12-05",
        displayDate: "Dec 05, 2025",
        location: "Cagayan de Oro City",
        type: "Fun Run",
        categories: ["3K Fun Run", "5K Run", "10K Run"],
        image: funrunImg,
        description: "Night fun run with lights and music."
      },
      {
        id: 6,
        title: "Freedom Run CDO",
        date: "2026-01-15",
        displayDate: "Jan 15, 2026",
        location: "Cagayan de Oro City",
        type: "Half Marathon",
        categories: ["5K Run", "10K Run", "21K Half Marathon"],
        image: freedomrun,
        description: "Celebrate freedom and fitness!"
      },
    ]);

    /* ------------------------------------
     FILTERS & GRID
    ------------------------------------ */
    const filters = ref({
      month: "all",
      type: "all",
      category: "all",
    });

    const visibleCount = ref(initialVisibleCount);
    const showModal = ref(false);
    const selectedEvent = ref(null);

    const form = ref({
      name: "",
      email: "",
      category: "",
      shirtSize: "",
      notes: ""
    });

    const filteredEvents = computed(() => {
      return events.value.filter((event) => {
        const month = new Date(event.date).getMonth();

        if (filters.value.month !== "all" && month !== Number(filters.value.month))
          return false;

        if (filters.value.type !== "all" && event.type !== filters.value.type)
          return false;

        if (
          filters.value.category !== "all" &&
          !event.categories.includes(filters.value.category)
        )
          return false;

        return true;
      });
    });

    const visibleEvents = computed(() =>
      filteredEvents.value.slice(0, visibleCount.value)
    );

    const loadMore = () => {
      visibleCount.value = Math.min(
        visibleCount.value + 3,
        filteredEvents.value.length
      );
    };

    const showLess = () => {
      visibleCount.value = initialVisibleCount;
    };

    /* ------------------------------------
     MODAL FUNCTIONS
    ------------------------------------ */
    const openEvent = (event) => {
      selectedEvent.value = event;
      form.value = {
        name: "",
        email: "",
        category: "",
        shirtSize: "",
        notes: ""
      };
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
    };

    /* ------------------------------------
     EMAILJS + GOOGLE SHEETS SUBMISSION
    ------------------------------------ */
    const submitRegistration = async () => {
      if (!form.value.name || !form.value.email || !form.value.category || !form.value.shirtSize) {
        alert("Please fill out all required fields.");
        return;
      }

      const payload = {
        name: form.value.name,
        email: form.value.email,
        eventName: selectedEvent.value.title,
        eventDate: selectedEvent.value.displayDate,
        eventLocation: selectedEvent.value.location,
        category: form.value.category,
        shirtSize: form.value.shirtSize,
        notes: form.value.notes || "None"
      };

      /* Submit to Google Sheets */
      try {
        await fetch(
          "https://script.google.com/macros/s/AKfycbykz5buukRuHIRjqKlpNP1qT26i4h3ZZekGdxDrwlPRy0tqXR1i_UCIl95JAl1vuPfbuA/exec",
          {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          }
        );
      } catch (err) {
        console.error("Sheets Error:", err);
      }

      /* EmailJS */
      emailjs
        .send("service_a7gh7rg", "template_21rnnd8", payload, "1GnKwfiFgGJJfoKbn")
        .then(() => {
          alert("Registration successful! Confirmation email sent.");
          closeModal();
        })
        .catch((error) => {
          console.error("EmailJS Error:", error);
          alert("Error sending email.");
        });
    };

    /* ------------------------------------
      LOGOUT
    ------------------------------------ */
    const { logout, showDropdown, toggleDropdown } = useLogout();
    const handleLogout = () => {
      logout();
      showDropdown.value = false;
    };

    return {
      events,
      filters,
      visibleEvents,
      filteredEvents,
      visibleCount,
      initialVisibleCount,
      showModal,
      selectedEvent,
      form,
      loadMore,
      showLess,
      openEvent,
      closeModal,
      submitRegistration,
      showDropdown,
      toggleDropdown,
      handleLogout
    };
  },
};
</script>

<style src="./Styles/event.css"></style>
