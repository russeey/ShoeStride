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
              <router-link
                to="/profile"
                class="dropdown-item"
                @click="showDropdown = false"
              >
                Profile
              </router-link>

              <router-link
                to="/order"
                class="dropdown-item"
                @click="showDropdown = false"
              >
                My order
              </router-link>

              <button class="dropdown-itemmm" @click="handleLogout">
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- HEADER -->
    <div class="collection-header">
      <h1>Available Products</h1>
    </div>

    <!-- 🔍 SEARCH BAR (ADDED ONLY) -->
    <div class="product-search">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search products..."
      />
    </div>

    <!-- FILTER BUTTONS -->
    <div class="filter-buttons">
      <button
        :class="{ active: selectedFilter === 'all' }"
        @click="selectedFilter = 'all'"
      >
        All
      </button>

      <button
        :class="{ active: selectedFilter === 'shoes' }"
        @click="selectedFilter = 'shoes'"
      >
        Shoes
      </button>

      <button
        :class="{ active: selectedFilter === 'accessories' }"
        @click="selectedFilter = 'accessories'"
      >
        Accessories
      </button>
    </div>

    <!-- PRODUCTS GRID -->
    <div class="collection-grid">

      <!-- SELLER UPLOAD BUTTON -->
      <div
        v-if="isSeller"
        class="product-card upload-card"
        @click="toggleUploadForm"
      >
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

        <!-- SELLER NAME BADGE -->
        <div
          v-if="product.sellerName"
          class="seller-badge"
        >
          {{ product.sellerName }}
        </div>

        <!-- PRODUCT IMAGE -->
        <img
          :src="product.colorImages?.[product.colors?.[0]] || product.image"
          @click="openProductModal(product)"
        />

        <p @click="openProductModal(product)">
          {{ product.name }}
        </p>

        <span @click="openProductModal(product)">
          Php. {{ product.price }}
        </span>
      </div>
    </div>

    <!-- UPLOAD MODAL -->
    <div
      v-if="showUploadForm"
      class="modal-overlay"
      @click.self="toggleUploadForm"
    >
      <div class="modal-container upload-modal">
        <button class="modal-close" @click="toggleUploadForm">✖</button>

        <h2>Upload New Product</h2>

        <form @submit.prevent="uploadProduct" class="upload-form">

          <input
            type="text"
            v-model="name"
            placeholder="Product Name"
            required
          />

          <input
            type="number"
            v-model="price"
            placeholder="Price"
            required
          />

          <select v-model="productType" required>
            <option value="shoes">Shoes</option>
            <option value="accessories">Accessories</option>
          </select>

          <textarea
            v-model="description"
            placeholder="Description"
          ></textarea>

          <!-- AVAILABLE SIZES -->
          <label>Available Sizes:</label>
          <div class="size-options">
            <label v-for="s in allSizes" :key="s">
              <input type="checkbox" :value="s" v-model="availableSizes" />
              {{ s }}
            </label>
          </div>

          <!-- COLORS -->
          <label>Available Colors:</label>
          <div class="color-options">
            <label v-for="c in allColors" :key="c">
              <input type="checkbox" :value="c" v-model="availableColors" />
              {{ c }}
            </label>
          </div>

          <!-- IMAGE PER COLOR -->
          <div
            v-if="availableColors.length > 0"
            class="color-image-upload"
          >
            <h3>Upload Image for Each Selected Color</h3>

            <div
              v-for="color in availableColors"
              :key="color"
              class="color-upload-row"
            >
              <label>{{ color }}:</label>
              <input
                type="file"
                accept="image/*"
                @change="(e) => handleColorImageUpload(e, color)"
              />
            </div>
          </div>

          <!-- FALLBACK IMAGE -->
          <input
            type="file"
            accept="image/*"
            @change="handleFile"
            required
          />

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

        <!-- SELLER NAME IN MODAL -->
        <p v-if="selectedProduct.sellerName" class="modal-seller">
          Sold by {{ selectedProduct.sellerName }}
        </p>

        <p>Php {{ selectedProduct.price }}</p>

        <!-- SIZE SELECT -->
        <div v-if="hasSizes">
          <label>Size:</label>
          <select v-model="selectedSize">
            <option
              v-for="s in selectedProduct.sizes"
              :key="s"
              :value="s"
            >
              {{ s }}
            </option>
          </select>
        </div>

        <!-- COLOR SELECT -->
        <div v-if="hasColors">
          <label>Color:</label>
          <select v-model="selectedColor">
            <option
              v-for="c in selectedProduct.colors"
              :key="c"
              :value="c"
            >
              {{ c }}
            </option>
          </select>
        </div>

        <!-- ACTION BUTTONS -->
        <div class="product-modal-actions">
          <button class="cart-btn" @click="addToCart">Add to Cart</button>
          <button class="favorite-btn" @click="addToFavorites">
            Favorite
          </button>
        </div>
      </div>
    </div>

    <!-- DELETE CONFIRM MODAL -->
    <div
      v-if="showDeleteConfirm"
      class="modal-overlay"
      @click.self="cancelDeleteProduct"
    >
      <div class="modal-container delete-modal">
        <h2>Delete Product?</h2>
        <p>This action cannot be undone.</p>

        <div class="delete-actions">
          <button class="cancel-btn" @click="cancelDeleteProduct">
            Cancel
          </button>
          <button class="delete-confirm-btn" @click="confirmDeleteProduct">
            Delete
          </button>
        </div>
      </div>
    </div>

  </div>
</template>



<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";

import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import { useFavorites } from "./Scripts/favorites.js";
import { useCart } from "./Scripts/cart.js";
import { useLogout } from "./Scripts/homescript.js";

const router = useRouter();

/* ---------------- LOAD PRODUCTS ---------------- */
const products = ref([]);

const loadProducts = async () => {
  const snapshot = await getDocs(collection(db, "products"));
  products.value = snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
};

onMounted(loadProducts);

/* ---------------- AUTH / SELLER ---------------- */
const isSeller = ref(false);
const currentUserId = ref(null);
const currentUserName = ref("Seller");

onAuthStateChanged(auth, async (user) => {
  currentUserId.value = user ? user.uid : null;

  if (!user) {
    isSeller.value = false;
    return;
  }

  const snap = await getDoc(doc(db, "users", user.uid));

  if (snap.exists()) {
    const data = snap.data();

    isSeller.value = data.role === "seller";

    // ✅ CORRECT assignment
    currentUserName.value =
      `${data.firstName || ""} ${data.lastName || ""}`.trim() || "Seller";
  }
});

/* ---------------- UPLOAD STATE ---------------- */
const showUploadForm = ref(false);
const name = ref("");
const price = ref("");
const description = ref("");
const productType = ref("shoes");
const file = ref(null);
const uploading = ref(false);

/* ---------------- SIZES ---------------- */
const shoeSizes = ["6", "7", "8", "9", "10", "11"];
const accessorySizes = ["XS", "S", "M", "L", "XL", "XXL"];

const allSizes = computed(() =>
  productType.value === "shoes" ? shoeSizes : accessorySizes
);

const availableSizes = ref([]);
watch(productType, () => {
  availableSizes.value = [];
});

/* ---------------- COLORS ---------------- */
const allColors = ["Red", "Black", "Blue", "White", "Green", "Gray"];
const availableColors = ref([]);
const colorImages = ref({});

/* ---------------- UPLOAD TOGGLE ---------------- */
const toggleUploadForm = () => {
  if (!isSeller.value) {
    alert("Only sellers can upload products.");
    return;
  }
  showUploadForm.value = !showUploadForm.value;
};

const handleFile = (e) => {
  file.value = e.target.files[0];
};

/* ---------------- IMAGE UPLOAD ---------------- */
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const IMGBB_KEY = "1625bffbcaa3ffd31209bacb3d3c450c";

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
  if (!data.success) throw new Error("Upload failed");
  return data.data.url;
};

const handleColorImageUpload = async (e, color) => {
  const img = e.target.files[0];
  if (!img) return;
  colorImages.value[color] = await uploadToImgbb(img);
};

/* ---------------- UPLOAD PRODUCT ---------------- */
const uploadProduct = async () => {
  if (!availableSizes.value.length) {
    alert("Please select at least one size.");
    return;
  }

  if (!availableColors.value.length) {
    alert("Please select at least one color.");
    return;
  }

  if (!file.value && !Object.keys(colorImages.value).length) {
    alert("Upload at least one image.");
    return;
  }

  uploading.value = true;

  try {
    const imageUrl = file.value ? await uploadToImgbb(file.value) : "";

    const productData = {
      name: name.value,
      price: Number(price.value),
      description: description.value,
      productType: productType.value,
      image: imageUrl,
      sizes: availableSizes.value,
      colors: availableColors.value,
      colorImages: colorImages.value,
      sellerId: currentUserId.value,
      sellerName: currentUserName.value,
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, "products"), productData);

    showUploadForm.value = false;
    name.value = "";
    price.value = "";
    description.value = "";
    availableSizes.value = [];
    availableColors.value = [];
    colorImages.value = {};
    file.value = null;

    await loadProducts();
  } catch {
    alert("Upload failed.");
  } finally {
    uploading.value = false;
  }
};

/* ---------------- PRODUCT MODAL ---------------- */
const showModal = ref(false);
const selectedProduct = ref({});
const selectedSize = ref(null);
const selectedColor = ref(null);
const selectedImage = ref("");

const hasSizes = computed(() =>
  Array.isArray(selectedProduct.value.sizes) &&
  selectedProduct.value.sizes.length > 0
);

const hasColors = computed(() =>
  Array.isArray(selectedProduct.value.colors) &&
  selectedProduct.value.colors.length > 0
);

const openProductModal = (product) => {
  selectedProduct.value = product;
  selectedSize.value = hasSizes.value ? product.sizes[0] : null;
  selectedColor.value = hasColors.value ? product.colors[0] : null;
  selectedImage.value =
    product.colorImages?.[selectedColor.value] || product.image;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

watch(selectedColor, () => {
  if (selectedProduct.value?.colorImages?.[selectedColor.value]) {
    selectedImage.value =
      selectedProduct.value.colorImages[selectedColor.value];
  }
});

/* ---------------- CART / FAVORITES ---------------- */
const { addFavorite } = useFavorites();
const { addCart } = useCart();

const addToFavorites = () => {
  addFavorite({
    ...selectedProduct.value,
    selectedSize: hasSizes.value ? selectedSize.value : null,
    selectedColor: hasColors.value ? selectedColor.value : null,
    image: selectedImage.value
  });
};

const addToCart = () => {
  addCart({
    ...selectedProduct.value,
    selectedSize: hasSizes.value ? selectedSize.value : null,
    selectedColor: hasColors.value ? selectedColor.value : null,
    image: selectedImage.value
  });
};

/* ---------------- DELETE PRODUCT ---------------- */
const showDeleteConfirm = ref(false);
const deleteTargetId = ref(null);

const requestDeleteProduct = (id) => {
  deleteTargetId.value = id;
  showDeleteConfirm.value = true;
};

const confirmDeleteProduct = async () => {
  if (!deleteTargetId.value) return;

  await deleteDoc(doc(db, "products", deleteTargetId.value));
  await loadProducts();

  showDeleteConfirm.value = false;
  deleteTargetId.value = null;
};

const cancelDeleteProduct = () => {
  showDeleteConfirm.value = false;
  deleteTargetId.value = null;
};

/* ---------------- FILTER ---------------- */
const selectedFilter = ref("all");

/* 🔍 SEARCH (ADDED ONLY) */
const searchQuery = ref("");

const filteredProducts = computed(() => {
  let list = products.value;

  if (selectedFilter.value !== "all") {
    list = list.filter(
      p => (p.productType || "shoes") === selectedFilter.value
    );
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.sellerName?.toLowerCase().includes(q)
    );
  }

  return list;
});

/* ---------------- LOGOUT / DROPDOWN ---------------- */
const { logout, showDropdown, toggleDropdown } = useLogout();
const handleLogout = () => logout();
</script>


  

<style src="./Styles/collection.css"></style>