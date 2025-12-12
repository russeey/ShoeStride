<template>
  <div class="collection-page">

    <!-- NAVBAR -->
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

          <!-- USER DROPDOWN -->
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

    <!-- HEADER -->
    <div class="collection-header">
      <h1>Available Products</h1>
    </div>

    <!-- FILTER BUTTONS -->
    <div class="filter-buttons">
      <button :class="{ active: selectedFilter === 'all' }" @click="selectedFilter = 'all'">All</button>
      <button :class="{ active: selectedFilter === 'shoes' }" @click="selectedFilter = 'shoes'">Shoes</button>
      <button :class="{ active: selectedFilter === 'accessories' }" @click="selectedFilter = 'accessories'">Accessories</button>
    </div>

    <!-- PRODUCTS GRID -->
    <div class="collection-grid">

      <!-- SELLER UPLOAD BUTTON -->
      <div v-if="isSeller" class="product-card upload-card" @click="toggleUploadForm">
        <div class="upload-icon">＋</div>
        <p>Add Product</p>
      </div>

      <!-- PRODUCT CARDS -->
      <div
        class="product-card"
        v-for="product in filteredProducts"
        :key="product.id || product.name"
      >

        <!-- DELETE BUTTON -->
        <div
          class="delete-btn"
          v-if="product.sellerId === currentUserId"
          @click.stop="requestDeleteProduct(product.id)"
        >
          ✖
        </div>

        <!-- PRODUCT IMAGE -->
        <img
          :src="product.colorImages?.[product.colors?.[0]] || product.image"
          @click="openProductModal(product)"
        />

        <p @click="openProductModal(product)">{{ product.name }}</p>
        <span @click="openProductModal(product)">Php. {{ product.price }}</span>
      </div>
    </div>

    <!-- UPLOAD MODAL -->
    <div v-if="showUploadForm" class="modal-overlay" @click.self="toggleUploadForm">
      <div class="modal-container upload-modal">
        <button class="modal-close" @click="toggleUploadForm">✖</button>

        <h2>Upload New Product</h2>

        <form @submit.prevent="uploadProduct" class="upload-form">

          <input type="text" v-model="name" placeholder="Product Name" required />
          <input type="number" v-model="price" placeholder="Price" required />

          <select v-model="productType" required>
            <option value="shoes">Shoes</option>
            <option value="accessories">Accessories</option>
          </select>

          <textarea v-model="description" placeholder="Description"></textarea>

          <!-- SIZES -->
          <label>Available Sizes:</label>
          <div class="size-options">
            <label v-for="s in allSizes" :key="s">
              <input type="checkbox" :value="s" v-model="availableSizes">
              {{ s }}
            </label>
          </div>

          <!-- COLORS -->
          <label>Available Colors:</label>
          <div class="color-options">
            <label v-for="c in allColors" :key="c">
              <input type="checkbox" :value="c" v-model="availableColors">
              {{ c }}
            </label>
          </div>

          <!-- IMAGE PER COLOR -->
          <div v-if="availableColors.length > 0" class="color-image-upload">
            <h3>Upload Image for Each Selected Color</h3>

            <div
              v-for="color in availableColors"
              :key="color"
              class="color-upload-row"
            >
              <label>{{ color }}:</label>
              <input type="file" accept="image/*" @change="(e) => handleColorImageUpload(e, color)" />
            </div>
          </div>

          <!-- FALLBACK IMAGE -->
          <input type="file" accept="image/*" @change="handleFile" required />

          <button class="upload-btn">
            {{ uploading ? "Uploading..." : "Upload Product" }}
          </button>
        </form>
      </div>
    </div>

    <!-- PRODUCT MODAL -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">

        <button class="modal-close" @click="closeModal">✖</button>

        <img
          :src="selectedProduct.colorImages?.[selectedColor] || selectedProduct.image"
          class="modal-img"
        />

        <h2>{{ selectedProduct.name }}</h2>
        <p>Php {{ selectedProduct.price }}</p>

        <!-- SIZE SELECT -->
        <label>Size:</label>
        <select v-model="selectedSize">
          <option v-for="s in selectedProduct.sizes" :key="s" :value="s">
            {{ s }}
          </option>
        </select>

        <!-- COLOR SELECT -->
        <label>Color:</label>
        <select v-model="selectedColor">
          <option v-for="c in selectedProduct.colors" :key="c" :value="c">
            {{ c }}
          </option>
        </select>

        <!-- ACTION BUTTONS -->
        <div class="product-modal-actions">
          <button class="cart-btn" @click="addToCart(selectedProduct)">Add to Cart</button>
          <button class="favorite-btn" @click="addToFavorites(selectedProduct)">Favorite</button>
        </div>

      </div>
    </div>

    <!-- OVERLAY SUCCESS -->
    <div v-if="showOverlay" class="overlay-success">
      {{ overlayMessage }}
    </div>

    <!-- ⭐⭐⭐ DELETE CONFIRMATION MODAL (ADDED BY REQUEST — ONLY THIS) ⭐⭐⭐ -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="cancelDeleteProduct">
      <div class="modal-container delete-modal">

        <h2>Delete Product?</h2>
        <p>This action cannot be undone.</p>

        <div class="delete-actions">
          <button class="cancel-btn" @click="cancelDeleteProduct">Cancel</button>
          <button class="delete-confirm-btn" @click="confirmDeleteProduct">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { db, auth } from "../firebase";
import { collection, getDocs, addDoc, doc, getDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import canvasImg from "@/assets/canvas.png";
import rcasualImg from "@/assets/rcasual.png";
import menImg from "@/assets/men.png";

import { useFavorites } from "./Scripts/favorites.js";
import { useCart } from "./Scripts/cart.js";
import { useLogout } from "./Scripts/homescript.js";

const router = useRouter();

/* ---------------- DEFAULT MODELS ---------------- */
const defaultModels = [
  { name: "Running canvas shoes", price: 2999, image: canvasImg, sellerName: "Default Shop", productType: "shoes" },
  { name: "Running casual shoes", price: 2999, image: rcasualImg, sellerName: "Default Shop", productType: "shoes" },
  { name: "Casual Nike shoes", price: 2999, image: menImg, sellerName: "Default Shop", productType: "shoes" }
];

/* ---------------- LOAD PRODUCTS ---------------- */
const products = ref([]);
const loadProducts = async () => {
  const snapshot = await getDocs(collection(db, "products"));
  products.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
onMounted(loadProducts);

/* ---------------- AUTH / SELLER ---------------- */
const isSeller = ref(false);
const currentUserId = ref(null);

onAuthStateChanged(auth, async (user) => {
  currentUserId.value = user ? user.uid : null;
  if (!user) return (isSeller.value = false);

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  isSeller.value = snap.exists() && snap.data().role === "seller";
});

/* ---------------- UPLOAD SYSTEM ---------------- */
const showUploadForm = ref(false);
const name = ref("");
const price = ref("");
const description = ref("");
const productType = ref("shoes");
const file = ref(null);
const uploading = ref(false);

/* SIZE & COLOR OPTIONS */
const allSizes = ["6","7","8","9","10","11"];
const allColors = ["Red","Black","Blue","White","Green","Gray"];

const availableSizes = ref([]);
const availableColors = ref([]);

const colorImages = ref({});

/* Toggle upload form */
const toggleUploadForm = () => {
  if (!isSeller.value) return alert("Only sellers can upload products.");
  showUploadForm.value = !showUploadForm.value;
};

/* Main image fallback */
const handleFile = (e) => {
  file.value = e.target.files[0];
};

/* File → base64 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const IMGBB_KEY = "1625bffbcaa3ffd31209bacb3d3c450c";

/* Upload to imgbb */
const uploadToImgbb = async (imageFile) => {
  const base64 = await fileToBase64(imageFile);
  const form = new FormData();
  form.append("key", IMGBB_KEY);
  form.append("image", base64.split(",")[1]);

  const res = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body: form
  });

  const data = await res.json();
  if (!data.success) throw new Error("Image upload failed");

  return data.data.url;
};

/* Upload image for each selected color */
const handleColorImageUpload = async (e, color) => {
  const selected = e.target.files[0];
  if (!selected) return;

  try {
    const url = await uploadToImgbb(selected);
    colorImages.value[color] = url;
  } catch {
    alert("Failed to upload image for " + color);
  }
};

/* SAVE PRODUCT */
const uploadProduct = async () => {
  if (!file.value && Object.keys(colorImages.value).length === 0) {
    return alert("Please upload at least one image.");
  }

  uploading.value = true;

  try {
    const user = auth.currentUser;
    const imageUrl = file.value ? await uploadToImgbb(file.value) : "";

    await addDoc(collection(db, "products"), {
      name: name.value,
      price: Number(price.value),
      description: description.value,
      productType: productType.value,
      image: imageUrl,
      sizes: availableSizes.value,
      colors: availableColors.value,
      colorImages: colorImages.value,
      sellerId: user.uid,
      sellerEmail: user.email,
      sellerName: user.displayName || "Unknown Seller",
      createdAt: serverTimestamp()
    });

    uploading.value = false;
    showUploadForm.value = false;

    availableColors.value = [];
    colorImages.value = {};
    file.value = null;

    await loadProducts();
  } catch {
    uploading.value = false;
    alert("Upload failed.");
  }
};

/* ---------------- DELETE PRODUCT ---------------- */
const showDeleteConfirm = ref(false);
const deleteTargetId = ref(null);

const requestDeleteProduct = (id) => {
  deleteTargetId.value = id;
  showDeleteConfirm.value = true;
};

const confirmDeleteProduct = async () => {
  try {
    await deleteDoc(doc(db, "products", deleteTargetId.value));
    await loadProducts();
  } finally {
    showDeleteConfirm.value = false;
    deleteTargetId.value = null;
  }
};

const cancelDeleteProduct = () => {
  showDeleteConfirm.value = false;
  deleteTargetId.value = null;
};

/* ---------------- FILTER SYSTEM ---------------- */
const selectedFilter = ref("all");

const mergedProducts = computed(() => [...defaultModels, ...products.value]);

const filteredProducts = computed(() => {
  if (selectedFilter.value === "all") return mergedProducts.value;
  return mergedProducts.value.filter(
    (p) => (p.productType || "shoes") === selectedFilter.value
  );
});

/* ---------------- PRODUCT MODAL ---------------- */
const showModal = ref(false);
const selectedProduct = ref({});
const selectedSize = ref("");
const selectedColor = ref("");
const selectedImage = ref("");

/* ⭐ OPEN MODAL — choose correct first color image */
const openProductModal = (p) => {
  selectedProduct.value = JSON.parse(JSON.stringify(p));
  selectedSize.value = selectedProduct.value.sizes?.[0] || "";
  selectedColor.value = selectedProduct.value.colors?.[0] || "";

  // pick correct image based on selected color
  if (selectedProduct.value.colorImages && selectedProduct.value.colorImages[selectedColor.value]) {
    selectedImage.value = selectedProduct.value.colorImages[selectedColor.value];
  } else {
    selectedImage.value = selectedProduct.value.image;
  }

  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

/* ⭐ update image when color changes */
watch(selectedColor, () => {
  if (selectedProduct.value.colorImages?.[selectedColor.value]) {
    selectedImage.value = selectedProduct.value.colorImages[selectedColor.value];
  } else {
    selectedImage.value = selectedProduct.value.image;
  }
});

/* ---------------- FAVORITES & CART ---------------- */
const { addFavorite } = useFavorites();
const { addCart } = useCart();

/* ⭐ OVERLAY SYSTEM */
const showOverlay = ref(false);
const overlayMessage = ref("");

const triggerOverlay = (msg) => {
  overlayMessage.value = msg;
  showOverlay.value = true;

  setTimeout(() => {
    showOverlay.value = false;
  }, 1500);
};

/* ⭐ ADD FAVORITE — save selected color image */
const addToFavorites = () => {
  const productData = {
    ...selectedProduct.value,
    selectedColor: selectedColor.value,
    selectedSize: selectedSize.value,
    image: selectedImage.value   // << IMPORTANT
  };
  addFavorite(productData);
  triggerOverlay("❤️ Added to Favorites!");
};

/* ⭐ ADD CART — save selected color image */
const addToCart = () => {
  const productData = {
    ...selectedProduct.value,
    selectedColor: selectedColor.value,
    selectedSize: selectedSize.value,
    image: selectedImage.value   // << IMPORTANT
  };
  addCart(productData);
  triggerOverlay("🛒 Added to Cart!");
};

/* ---------------- LOGOUT / DROPDOWN ---------------- */
const { logout, showDropdown, toggleDropdown } = useLogout();
const handleLogout = () => logout();
</script>

<style src="./Styles/collection.css"></style>